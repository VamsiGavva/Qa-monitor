'use client';

import React, { useState, useEffect } from 'react';
import { useTask } from '@/context/TaskContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';
import { Task } from '@/types/task';
import MultiSelectTags from './MultiSelectTags';
import ImageUpload from './ImageUpload';

interface TaskFormProps {
  editTask?: Task | null;
  onSuccess?: () => void;
}

export default function TaskForm({ editTask, onSuccess }: TaskFormProps) {
  const { createTask, updateTask, loading, uploadImages } = useTask();
  
  const [formData, setFormData] = useState({
    unitTestLabel: '',
    tags: [] as string[],
    description: '',
    testCases: [''],
    notes: '',
    attachedImages: [] as string[],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Pre-populate form if editing
  useEffect(() => {
    if (editTask) {
      setFormData({
        unitTestLabel: editTask.unitTestLabel || '',
        tags: editTask.tags || [],
        description: editTask.description || '',
        testCases: editTask.testCases.length > 0 ? editTask.testCases : [''],
        notes: editTask.notes || '',
        attachedImages: editTask.attachedImages || [],
      });
    }
  }, [editTask]);

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

  const handleTagsChange = (tags: string[]) => {
    setFormData(prev => ({
      ...prev,
      tags,
    }));

    // Clear tags error
    if (errors.tags) {
      setErrors(prev => ({
        ...prev,
        tags: '',
      }));
    }
  };

  const handleTestCaseChange = (index: number, value: string) => {
    const updatedTestCases = [...formData.testCases];
    updatedTestCases[index] = value;
    setFormData(prev => ({
      ...prev,
      testCases: updatedTestCases,
    }));

    // Clear test case errors
    if (errors.testCases) {
      setErrors(prev => ({
        ...prev,
        testCases: '',
      }));
    }
  };

  const addTestCase = () => {
    setFormData(prev => ({
      ...prev,
      testCases: [...prev.testCases, ''],
    }));
  };

  const removeTestCase = (index: number) => {
    if (formData.testCases.length > 1) {
      const updatedTestCases = formData.testCases.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        testCases: updatedTestCases,
      }));
    }
  };

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({
      ...prev,
      attachedImages: images,
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.unitTestLabel.trim()) {
      newErrors.unitTestLabel = 'Unit Test Label is required';
    }

    if (!formData.tags || formData.tags.length === 0) {
      newErrors.tags = 'At least one tag is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    const validTestCases = formData.testCases.filter(tc => tc.trim() !== '');
    if (validTestCases.length === 0) {
      newErrors.testCases = 'At least one test case is required';
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
      const taskData = {
        ...formData,
        testCases: formData.testCases.filter(tc => tc.trim() !== ''),
      };

      if (editTask && editTask._id) {
        await updateTask(editTask._id, taskData);
      } else {
        await createTask(taskData);
      }

      // Reset form after successful submission
      if (!editTask) {
        setFormData({
          unitTestLabel: '',
          tags: [],
          description: '',
          testCases: [''],
          notes: '',
          attachedImages: [],
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="unitTestLabel">Unit Test Label</Label>
            <Input
              id="unitTestLabel"
              name="unitTestLabel"
              value={formData.unitTestLabel}
              onChange={handleInputChange}
              placeholder="Enter unique unit test label"
              className={errors.unitTestLabel ? 'border-red-500' : ''}
            />
            {errors.unitTestLabel && (
              <p className="text-sm text-red-500">{errors.unitTestLabel}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Unit Test Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter task description..."
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <MultiSelectTags
              selectedTags={formData.tags}
              onTagsChange={handleTagsChange}
              placeholder="Select or add tags..."
              error={errors.tags}
            />
          </div>

          <div className="space-y-2">
            <Label>Test Cases</Label>
            <div className="space-y-3">
              {formData.testCases.map((testCase, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Test case ${index + 1}`}
                    value={testCase}
                    onChange={(e) => handleTestCaseChange(index, e.target.value)}
                    className="flex-1"
                  />
                  {formData.testCases.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeTestCase(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTestCase}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Test Case
              </Button>
            </div>
            {errors.testCases && (
              <p className="text-sm text-red-500">{errors.testCases}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {loading ? 'Saving...' : editTask ? 'Update Task' : 'Save Task'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}