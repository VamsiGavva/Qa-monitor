'use client';

import React from 'react';
import TaskForm from '@/components/TaskForm';

export default function CreateTaskPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Create QA Testing Task
      </h1>
      <TaskForm onSuccess={() => {
        console.log('Task created successfully!');
      }} />
    </div>
  );
}