'use client';

import React, { useState } from 'react';
import TaskForm from '@/components/TaskForm';
import TaskTable from '@/components/TaskTable';
import { Task } from '@/types/task';

export default function Home() {
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
   
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSuccess = () => {
    setEditingTask(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          {editingTask ? 'Edit QA Testing Task' : 'Create QA Testing Task'}
        </h1>
        <TaskForm 
          editTask={editingTask} 
          onSuccess={handleSuccess}
        />
        {editingTask && (
          <div className="mt-4">
            <button
              onClick={() => setEditingTask(null)}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Cancel editing and create new task
            </button>
          </div>
        )}
      </div>

      <TaskTable onEditTask={handleEditTask} />
    </div>
  );
}