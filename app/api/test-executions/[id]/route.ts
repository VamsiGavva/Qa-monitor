import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import TestExecution from '@/models/TestExecution';
import mongoose from 'mongoose';

// GET - Fetch test execution by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid test execution ID',
        },
        { status: 400 }
      );
    }

    const testExecution = await TestExecution.findById(id).populate('taskId', 'description tags');
    
    if (!testExecution) {
      return NextResponse.json(
        {
          success: false,
          error: 'Test execution not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: testExecution,
    });
  } catch (error) {
    console.error('Error fetching test execution:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch test execution',
      },
      { status: 500 }
    );
  }
}

// PUT - Update test execution by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    const body = await request.json();
    const { taskId, testId, testCases, status, feedback, attachedImages, testerName } = body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid test execution ID',
        },
        { status: 400 }
      );
    }

    // Validation
    if (!taskId || !testId || !testCases || !feedback || !testerName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Task ID, Test ID, test cases, feedback, and tester name are required',
        },
        { status: 400 }
      );
    }

    // Calculate passed test cases
    const passedTestCases = testCases.filter((tc: any) => tc.passed).length;
    const totalTestCases = testCases.length;

    const updatedTestExecution = await TestExecution.findByIdAndUpdate(
      id,
      {
        taskId,
        testId: testId.trim(),
        testCases,
        status,
        feedback: feedback.trim(),
        attachedImages: attachedImages || [],
        testerName: testerName.trim(),
        passedTestCases,
        totalTestCases,
      },
      { new: true, runValidators: true }
    ).populate('taskId', 'description tags');

    if (!updatedTestExecution) {
      return NextResponse.json(
        {
          success: false,
          error: 'Test execution not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedTestExecution,
      message: 'Test execution updated successfully',
    });
  } catch (error) {
    console.error('Error updating test execution:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update test execution',
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete test execution by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid test execution ID',
        },
        { status: 400 }
      );
    }

    const deletedTestExecution = await TestExecution.findByIdAndDelete(id);

    if (!deletedTestExecution) {
      return NextResponse.json(
        {
          success: false,
          error: 'Test execution not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Test execution deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting test execution:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete test execution',
      },
      { status: 500 }
    );
  }
}