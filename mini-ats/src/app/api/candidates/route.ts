import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { Candidate } from '@/models/Candidate';
import { getAuthUser } from '@/lib/auth';
import { HIRING_STAGES } from '@/types';

// GET /api/candidates — list with pagination, search, filter, sort
export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const search = searchParams.get('search') || '';
    const stage = searchParams.get('stage') || '';
    const role = searchParams.get('role') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    await connectDB();

    // Build filter
    const filter: Record<string, unknown> = { createdBy: authUser.id };

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { appliedRole: { $regex: search, $options: 'i' } },
      ];
    }

    if (stage && HIRING_STAGES.includes(stage as (typeof HIRING_STAGES)[number])) {
      filter.hiringStage = stage;
    }

    if (role) {
      filter.appliedRole = { $regex: role, $options: 'i' };
    }

    const allowedSortFields = ['fullName', 'email', 'appliedRole', 'hiringStage', 'createdAt', 'updatedAt'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [candidates, total] = await Promise.all([
      Candidate.find(filter)
        .sort({ [safeSortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Candidate.countDocuments(filter),
    ]);

    return NextResponse.json({
      data: candidates,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Candidates GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/candidates — create candidate
export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { fullName, email, phone, appliedRole, skills, experience, hiringStage, resumeUrl, notes } = body;

    if (!fullName || !email || !appliedRole || !experience) {
      return NextResponse.json({ error: 'Full name, email, applied role, and experience are required' }, { status: 400 });
    }

    await connectDB();

    const candidate = await Candidate.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim(),
      appliedRole: appliedRole.trim(),
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
      experience: experience.trim(),
      hiringStage: hiringStage || 'Applied',
      resumeUrl: resumeUrl?.trim(),
      notes: notes?.trim(),
      createdBy: authUser.id,
    });

    return NextResponse.json(candidate, { status: 201 });
  } catch (error) {
    console.error('Candidates POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
