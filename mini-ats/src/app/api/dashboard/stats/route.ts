import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { Candidate } from '@/models/Candidate';
import { getAuthUser } from '@/lib/auth';
import { HIRING_STAGES } from '@/types';

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    const userObjectId = new mongoose.Types.ObjectId(authUser.id);

    // Run all aggregations in parallel
    const [stageCounts, totalCount, recentCandidates, monthlyHires] = await Promise.all([
      // Count by hiring stage
      Candidate.aggregate([
        { $match: { createdBy: userObjectId } },
        { $group: { _id: '$hiringStage', count: { $sum: 1 } } },
      ]),

      // Total candidates
      Candidate.countDocuments({ createdBy: userObjectId }),

      // Recent 5 candidates
      Candidate.find({ createdBy: userObjectId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // Hires this month
      Candidate.countDocuments({
        createdBy: userObjectId,
        hiringStage: 'Hired',
        updatedAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      }),
    ]);

    // Build byStage map with zeros for all stages
    const byStage: Record<string, number> = {};
    for (const stage of HIRING_STAGES) {
      byStage[stage] = 0;
    }
    for (const item of stageCounts) {
      if (item._id) byStage[item._id] = item.count;
    }

    return NextResponse.json({
      totalCandidates: totalCount,
      byStage,
      recentCandidates,
      hiresThisMonth: monthlyHires,
      interviewsScheduled: byStage['Interview'] || 0,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
