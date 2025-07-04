import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import TestExecution from '@/models/TestExecution';
import mongoose from 'mongoose';

// GET - Fetch test executions by task ID
export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    await connectToDatabase();
    
    const { taskId } = params;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid task ID',
        },
        { status: 400 }
      );
    }

    const testExecutions = await TestExecution.find({ taskId })
      .populate('taskId', 'description tags')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: testExecutions,
    });
  } catch (error) {
    console.error('Error fetching test executions by task ID:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch test executions',
      },
      { status: 500 }
    );
  }
}