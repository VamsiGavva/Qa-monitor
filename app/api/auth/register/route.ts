import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { name, email, password } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name, email, and password are required',
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: 'Password must be at least 6 characters long',
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User with this email already exists',
        },
        { status: 400 }
      );
    }

    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    const savedUser = await user.save();

    // Generate JWT token
    const token = generateToken({
      userId: savedUser._id.toString(),
      email: savedUser.email,
      name: savedUser.name,
      role: 'user', // Default role for compatibility
    });

    // Remove password from response
    const userResponse = {
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      isActive: savedUser.isActive,
    };

    return NextResponse.json({
      success: true,
      data: {
        user: userResponse,
        token,
      },
      message: 'User registered successfully',
    });
  } catch (error: any) {
    console.error('Error registering user:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: 'User with this email already exists',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to register user',
      },
      { status: 500 }
    );
  }
}