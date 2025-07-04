import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Task from '@/models/Task';
import mongoose from 'mongoose';

// GET - Fetch task by ID
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
          error: 'Invalid task ID',
        },
        { status: 400 }
      );
    }

    const task = await Task.findById(id);
    
    if (!task) {
      return NextResponse.json(
        {
          success: false,
          error: 'Task not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch task',
      },
      { status: 500 }
    );
  }
}

// PUT - Update task by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    const body = await request.json();
    const { unitTestLabel, tags, description, testCases, notes, attachedImages } = body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid task ID',
        },
        { status: 400 }
      );
    }

    // Validation
    if (!unitTestLabel || !unitTestLabel.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unit Test Label is required',
        },
        { status: 400 }
      );
    }

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least one tag is required',
        },
        { status: 400 }
      );
    }

    if (!description || !testCases || testCases.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Description and at least one test case are required',
        },
        { status: 400 }
      );
    }

    // Filter out empty test cases
    const validTestCases = testCases.filter((testCase: string) => testCase.trim() !== '');
    
    if (validTestCases.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least one valid test case is required',
        },
        { status: 400 }
      );
    }

    // Filter out empty tags
    const validTags = tags.filter((tag: string) => tag.trim() !== '');

    // Check if unit test label already exists (excluding current task)
    const existingTask = await Task.findOne({ 
      unitTestLabel: { $regex: new RegExp(`^${unitTestLabel.trim()}$`, 'i') },
      _id: { $ne: id }
    });
    
    if (existingTask) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unit Test Label already exists',
        },
        { status: 400 }
      );
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        unitTestLabel: unitTestLabel.trim(),
        tags: validTags,
        description: description.trim(),
        testCases: validTestCases,
        notes: notes?.trim() || '',
        attachedImages: attachedImages || [],
      },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return NextResponse.json(
        {
          success: false,
          error: 'Task not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedTask,
      message: 'Task updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating task:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unit Test Label already exists',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update task',
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete task by ID
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
          error: 'Invalid task ID',
        },
        { status: 400 }
      );
    }

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return NextResponse.json(
        {
          success: false,
          error: 'Task not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete task',
      },
      { status: 500 }
    );
  }
}