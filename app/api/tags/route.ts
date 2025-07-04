import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Tag from '@/models/Tag';
import { getUserFromRequest } from '@/lib/auth';

// GET - Fetch all active tags
export async function GET() {
  try {
    await connectToDatabase();
    
    const tags = await Tag.find({ isActive: true })
      .sort({ name: 1 })
      .select('name');
    
    return NextResponse.json({
      success: true,
      data: tags.map(tag => tag.name),
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch tags',
      },
      { status: 500 }
    );
  }
}

// POST - Add new tag
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { tag } = body;

    if (!tag || !tag.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tag name is required',
        },
        { status: 400 }
      );
    }

    const tagName = tag.trim();

    // Check if tag already exists
    const existingTag = await Tag.findOne({ 
      name: { $regex: new RegExp(`^${tagName}$`, 'i') } 
    });
    
    if (existingTag) {
      return NextResponse.json({
        success: true,
        message: 'Tag already exists',
        data: existingTag.name,
      });
    }

    // Create new tag
    const newTag = new Tag({
      name: tagName,
      createdBy: userPayload.userId,
    });

    const savedTag = await newTag.save();

    return NextResponse.json({
      success: true,
      message: 'Tag created successfully',
      data: savedTag.name,
    });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create tag',
      },
      { status: 500 }
    );
  }
}