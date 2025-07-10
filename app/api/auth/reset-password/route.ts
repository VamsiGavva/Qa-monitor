import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { token, password, confirmPassword } = body;

    // Validation
    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token, password, and confirm password are required',
        },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Passwords do not match',
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

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or expired reset token',
        },
        { status: 400 }
      );
    }

    // Update password and clear reset token
    user.password = password;
    user.isFirstLogin = false; // Mark as no longer first login
    user.clearPasswordResetToken();
    user.lastLoginAt = new Date();
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to reset password',
      },
      { status: 500 }
    );
  }
}