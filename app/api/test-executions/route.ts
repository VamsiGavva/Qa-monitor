import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import TestExecution from '@/models/TestExecution';
import Task from '@/models/Task';

// GET - Fetch all test executions with filters
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const tags = searchParams.get('tags');
    const status = searchParams.get('status');
    const label = searchParams.get('label');
    const latest = searchParams.get('latest');

    // Build aggregation pipeline
    const pipeline: any[] = [
      // Populate task information
      {
        $lookup: {
          from: 'tasks',
          localField: 'taskId',
          foreignField: '_id',
          as: 'taskId'
        }
      },
      {
        $unwind: '$taskId'
      }
    ];

    // Build match conditions
    const matchConditions: any = {};

    // Filter by status
    if (status && status.trim() !== '') {
      matchConditions.status = status.toLowerCase();
    }

    // Filter by unit test label
    if (label && label.trim() !== '') {
      matchConditions['taskId.unitTestLabel'] = { 
        $regex: new RegExp(label, 'i') 
      };
    }

    // Filter by tags
    if (tags && tags.trim() !== '') {
      try {
        const tagsArray = JSON.parse(tags);
        if (Array.isArray(tagsArray) && tagsArray.length > 0) {
          matchConditions['taskId.tags'] = { 
            $in: tagsArray.map(tag => new RegExp(tag, 'i'))
          };
        }
      } catch (error) {
        // If tags is not a valid JSON array, treat it as a single tag
        matchConditions['taskId.tags'] = { 
          $in: [new RegExp(tags, 'i')]
        };
      }
    }

    // Add match stage if there are conditions
    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    // Sort by creation date (newest first)
    pipeline.push({ $sort: { createdAt: -1 } });

    // If latest is true and no filters are applied, get only the latest execution per task
    if (latest === 'true' && Object.keys(matchConditions).length === 0) {
      pipeline.push(
        {
          $group: {
            _id: '$taskId._id',
            latestExecution: { $first: '$$ROOT' }
          }
        },
        {
          $replaceRoot: { newRoot: '$latestExecution' }
        },
        {
          $sort: { createdAt: -1 }
        }
      );
    }

    const testExecutions = await TestExecution.aggregate(pipeline);
    
    return NextResponse.json({
      success: true,
      data: testExecutions,
    });
  } catch (error) {
    console.error('Error fetching test executions:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch test executions',
      },
      { status: 500 }
    );
  }
}

// POST - Create a new test execution
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { taskId, testId, status, feedback, attachedImages, testerName } = body;

    console.log('Received test execution data:', body);

    // Validation
    if (!taskId || !testId || !feedback || !testerName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Task ID, Test ID, feedback, and tester name are required',
        },
        { status: 400 }
      );
    }

    // Verify task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json(
        {
          success: false,
          error: 'Task not found',
        },
        { status: 404 }
      );
    }

    // Create new test execution (always create new, don't update existing)
    const testExecution = new TestExecution({
      taskId,
      testId: testId.trim(),
      status: status || 'fail',
      feedback: feedback.trim(),
      attachedImages: attachedImages || [],
      testerName: testerName.trim(),
    });

    const savedTestExecution = await testExecution.save();
    await savedTestExecution.populate('taskId', 'unitTestLabel description tags');

    return NextResponse.json({
      success: true,
      data: savedTestExecution,
      message: 'Test execution created successfully',
    });
  } catch (error) {
    console.error('Error creating test execution:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create test execution',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}