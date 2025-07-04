'use client';

import React, { useState } from 'react';
import TestExecutionForm from '@/components/TestExecutionForm';
import TestExecutionTable from '@/components/TestExecutionTable';
import TestHistorySidebar from '@/components/TestHistorySidebar';
import { TestExecution } from '@/types/testExecution';

export default function TestTaskPage() {
  const [editingTestExecution, setEditingTestExecution] = useState<TestExecution | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const handleEditTestExecution = (testExecution: TestExecution) => {
    setEditingTestExecution(testExecution);
    // Scroll to top to show form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShowHistory = (taskId: string) => {
    setSelectedTaskId(taskId);
    setShowHistory(true);
  };

  const handleSuccess = () => {
    setEditingTestExecution(null);
  };

  const handleCloseHistory = () => {
    setShowHistory(false);
    setSelectedTaskId(null);
  };

  return (
    <div className="space-y-8 relative">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          {editingTestExecution ? 'Edit Test Execution' : 'Test Task Execution'}
        </h1>
        <TestExecutionForm 
          editTestExecution={editingTestExecution} 
          onSuccess={handleSuccess}
        />
        {editingTestExecution && (
          <div className="mt-4">
            <button
              onClick={() => setEditingTestExecution(null)}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Cancel editing and create new test execution
            </button>
          </div>
        )}
      </div>

      <TestExecutionTable 
        onEditTestExecution={handleEditTestExecution}
        onShowHistory={handleShowHistory}
      />

      <TestHistorySidebar
        isOpen={showHistory}
        onClose={handleCloseHistory}
        taskId={selectedTaskId}
      />
    </div>
  );
}