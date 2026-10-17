import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Candidate } from '@/models/Candidate';
import { getAuthUser } from '@/lib/auth';
import { HIRING_STAGES } from '@/types';

// PATCH /api/candidates/[id]/stage — update only the hiring stage
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { hiringStage } = body;

    if (!hiringStage || !HIRING_STAGES.includes(hiringStage)) {
      return NextResponse.json(
        { error: `Invalid hiring stage. Must be one of: ${HIRING_STAGES.join(', ')}` },
        { status: 400 }
      );
    }

    await connectDB();

    const candidate = await Candidate.findOneAndUpdate(
      { _id: id, createdBy: authUser.id },
      { hiringStage },
      { new: true, runValidators: true }
    );

    if (!candidate) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });

    return NextResponse.json(candidate);
  } catch (error) {
    console.error('Stage update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
