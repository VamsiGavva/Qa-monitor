import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Task from '@/models/Task';

// GET - Fetch all tasks
export async function GET() {
  try {
    await connectToDatabase();
    
    const tasks = await Task.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch tasks',
      },
      { status: 500 }
    );
  }
}

// POST - Create a new task
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { unitTestLabel, tags, description, testCases, notes, attachedImages } = body;

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

    // Check if unit test label already exists
    const existingTask = await Task.findOne({ 
      unitTestLabel: { $regex: new RegExp(`^${unitTestLabel.trim()}$`, 'i') } 
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

    const task = new Task({
      unitTestLabel: unitTestLabel.trim(),
      tags: validTags,
      description: description.trim(),
      testCases: validTestCases,
      notes: notes?.trim() || '',
      attachedImages: attachedImages || [],
    });

    const savedTask = await task.save();

    return NextResponse.json({
      success: true,
      data: savedTask,
      message: 'Task created successfully',
    });
  } catch (error: any) {
    console.error('Error creating task:', error);
    
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
        error: 'Failed to create task',
      },
      { status: 500 }
    );
  }
}