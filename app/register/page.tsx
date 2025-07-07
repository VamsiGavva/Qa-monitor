'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Bug, Loader2, Rocket, Zap, Target } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const { register, loading, error, isAuthenticated } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setFormError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }

    try {
      await register(formData.name, formData.email, formData.password);
      router.push('/dashboard');
    } catch (error) {
      // Error is handled by context
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-lg text-gray-700 font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding & Benefits */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
          <div className="mb-12">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <Bug className="h-8 w-8 text-white" />
              </div>
              <span className="text-3xl font-bold">QAMonitorTool</span>
            </div>
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Join the Future of Quality Assurance
            </h1>
            <p className="text-xl text-purple-100 leading-relaxed">
              Create your account and start building better software with our advanced QA monitoring platform.
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Quick Setup</h3>
                <p className="text-purple-100">Get started in minutes with our intuitive onboarding process</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Powerful Features</h3>
                <p className="text-purple-100">Advanced test management and comprehensive reporting tools</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Proven Results</h3>
                <p className="text-purple-100">Reduce bugs by 60% and improve deployment confidence</p>
              </div>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="text-2xl font-bold">500+</div>
              <div className="text-sm text-purple-200">Active Teams</div>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="text-2xl font-bold">50K+</div>
              <div className="text-sm text-purple-200">Tests Executed</div>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="text-2xl font-bold">99.9%</div>
              <div className="text-sm text-purple-200">Uptime</div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6 pt-8">
              <div className="flex items-center justify-center space-x-2 mb-6 lg:hidden">
                <Bug className="h-8 w-8 text-indigo-600" />
                <span className="text-2xl font-bold text-gray-900">QAMonitorTool</span>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Create Account</CardTitle>
              <p className="text-gray-600 mt-2">Join our QA testing platform</p>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {(error || formError) && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">
                      {error || formError}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="h-11 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="h-11 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      className="h-11 pr-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      className="h-11 pr-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/login" className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors">
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}