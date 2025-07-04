'use client';

import React, { useState, useEffect } from 'react';
import { useTestExecution } from '@/context/TestExecutionContext';
import { useTask } from '@/context/TaskContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TestExecution } from '@/types/testExecution';
import { Task } from '@/types/task';
import ImageUpload from './ImageUpload';
import { Clock, CheckCircle, XCircle, AlertCircle, Hash, User, FileText } from 'lucide-react';

interface TestExecutionFormProps {
  editTestExecution?: TestExecution | null;
  onSuccess?: () => void;
}

export default function TestExecutionForm({ editTestExecution, onSuccess }: TestExecutionFormProps) {
  const { createTestExecution, updateTestExecution, loading, uploadImages } = useTestExecution();
  const { tasks, getTasks } = useTask();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    taskId: '',
    status: 'fail' as 'pass' | 'fail',
    feedback: '',
    attachedImages: [] as string[],
  });

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    getTasks();
  }, []);

  // Generate random test ID
  const generateTestId = () => {
    const prefix = 'TEST';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  };

  // Pre-populate form if editing
  useEffect(() => {
    if (editTestExecution) {
      setFormData({
        taskId: editTestExecution.taskId?._id || '',
        status: editTestExecution.status === 'completed' ? 'pass' : 'fail',
        feedback: editTestExecution.feedback,
        attachedImages: editTestExecution.attachedImages || [],
      });
      
      // Find and set selected task
      const task = tasks.find((t:any) => t._id === editTestExecution.taskId);
      if (task) {
        setSelectedTask(task);
      }
    }
  }, [editTestExecution, tasks]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleTaskSelect = (taskId: string) => {
    const task = tasks.find(t => t._id === taskId);
    if (task) {
      setSelectedTask(task);
      setFormData(prev => ({
        ...prev,
        taskId,
      }));
    }
  };

  const handleStatusChange = (status: 'pass' | 'fail') => {
    setFormData(prev => ({
      ...prev,
      status,
    }));
  };

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({
      ...prev,
      attachedImages: images,
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.taskId) {
      newErrors.taskId = 'Task selection is required';
    }

    if (!formData.feedback.trim()) {
      newErrors.feedback = 'Feedback is required';
    }

    if (!user?.name) {
      newErrors.user = 'User not authenticated';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const testExecutionData = {
        ...formData,
        testId: generateTestId(), // Auto-generate test ID
        testerName: user?.name || '', // Use logged-in user's name
        feedback: formData.feedback.trim(),
        testCases: [{ // Add default test case structure
          testCase: 'Default test case',
          passed: formData.status === 'pass',
          notes: formData.feedback,
        }],
      };

      if (editTestExecution && editTestExecution._id) {
        await updateTestExecution(editTestExecution._id, {
          ...testExecutionData,
          status: formData.status === 'pass' ? 'completed' : 'failed',
        });
      } else {
        // Always create new test execution (no duplicate checking)
        await createTestExecution({
          ...testExecutionData,
          status: formData.status === 'pass' ? 'completed' : 'failed',
        });
      }

      // Reset form after successful submission
      if (!editTestExecution) {
        setFormData({
          taskId: '',
          status: 'fail',
          feedback: '',
          attachedImages: [],
        });
        setSelectedTask(null);
      }

      onSuccess?.();
    } catch (error) {
      console.error('Error saving test execution:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'fail':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="w-full shadow-lg border-0 bg-white">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <CardTitle className="flex items-center space-x-2 text-xl font-bold text-gray-900">
          <FileText className="h-6 w-6 text-blue-600" />
          <span>{editTestExecution ? 'Edit Test Execution' : 'Create Test Execution'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label htmlFor="taskId" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                <Hash className="h-4 w-4" />
                <span>Select Unit Test Label</span>
              </Label>
              <Select
                value={formData.taskId}
                onValueChange={handleTaskSelect}
                disabled={!!editTestExecution}
              >
                <SelectTrigger className={`h-12 ${errors.taskId ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-blue-500`}>
                  <SelectValue placeholder="Select a unit test label" />
                </SelectTrigger>
                <SelectContent>
                  {tasks.map((task) => (
                    <SelectItem key={task._id} value={task._id!}>
                      <div className="flex flex-col py-1">
                        <span className="font-medium text-gray-900">
                          {task.unitTestLabel}
                        </span>
                        <span className="text-sm text-gray-500">
                          {task.description.substring(0, 60)}...
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.taskId && (
                <p className="text-sm text-red-500 flex items-center space-x-1">
                  <XCircle className="h-3 w-3" />
                  <span>{errors.taskId}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                {getStatusIcon(formData.status)}
                <span>Status</span>
              </Label>
              <Select
                value={formData.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pass">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Pass</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="fail">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span>Fail</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedTask && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Selected Task Details</Label>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Description:</span> {selectedTask.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-sm font-medium text-gray-600 mr-2">Tags:</span>
                    {selectedTask.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Display current user info */}
          <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Label className="text-sm font-semibold text-blue-700 flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Tester Information</span>
            </Label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-blue-800 font-medium">Testing as:</span>
              <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                {user?.name || 'Unknown User'}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Feedback</span>
            </Label>
            <Textarea
              id="feedback"
              name="feedback"
              value={formData.feedback}
              onChange={handleInputChange}
              placeholder="Enter detailed feedback about the testing..."
              rows={5}
              className={`${errors.feedback ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-blue-500`}
            />
            {errors.feedback && (
              <p className="text-sm text-red-500 flex items-center space-x-1">
                <XCircle className="h-3 w-3" />
                <span>{errors.feedback}</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Attach Images</Label>
            <ImageUpload
              images={formData.attachedImages}
              onImagesChange={handleImagesChange}
              onUpload={uploadImages}
            />
          </div>

          <div className="flex items-center justify-between pt-6 border-t">
            <div className="text-sm text-gray-500">
              {editTestExecution ? 'Update existing test execution' : 'Create new test execution'}
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
            >
              {loading ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : editTestExecution ? (
                'Update Test Execution'
              ) : (
                'Save Test Execution'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}