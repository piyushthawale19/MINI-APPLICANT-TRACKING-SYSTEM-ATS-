import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Candidate } from '@/models/Candidate';
import { getAuthUser } from '@/lib/auth';

// GET /api/candidates/[id]
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await connectDB();

    const candidate = await Candidate.findOne({ _id: id, createdBy: authUser.id });
    if (!candidate) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });

    return NextResponse.json(candidate);
  } catch (error) {
    console.error('Candidate GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/candidates/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { fullName, email, phone, appliedRole, skills, experience, hiringStage, resumeUrl, notes } = body;

    if (!fullName || !email || !appliedRole || !experience) {
      return NextResponse.json({ error: 'Full name, email, applied role, and experience are required' }, { status: 400 });
    }

    await connectDB();

    const candidate = await Candidate.findOneAndUpdate(
      { _id: id, createdBy: authUser.id },
      {
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim(),
        appliedRole: appliedRole.trim(),
        skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
        experience: experience.trim(),
        hiringStage,
        resumeUrl: resumeUrl?.trim(),
        notes: notes?.trim(),
      },
      { new: true, runValidators: true }
    );

    if (!candidate) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });

    return NextResponse.json(candidate);
  } catch (error) {
    console.error('Candidate PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/candidates/[id]
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await connectDB();

    const candidate = await Candidate.findOneAndDelete({ _id: id, createdBy: authUser.id });
    if (!candidate) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });

    return NextResponse.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Candidate DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
