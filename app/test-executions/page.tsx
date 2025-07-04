'use client';

import React, { useState } from 'react';
import TestExecutionTable from '@/components/TestExecutionTable';
import TestExecutionForm from '@/components/TestExecutionForm';
import TestHistorySidebar from '@/components/TestHistorySidebar';
import { TestExecution } from '@/types/testExecution';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

export default function TestExecutionsPage() {
  const [editingTestExecution, setEditingTestExecution] = useState<TestExecution | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();
  const handleEditTestExecution = (testExecution: TestExecution) => {
    setEditingTestExecution(testExecution);
    setShowForm(true);
  };

  const handleShowHistory = (taskId: string) => {
    setSelectedTaskId(taskId);
    setShowHistory(true);
  };

  const handleSuccess = () => {
    setEditingTestExecution(null);
    setShowForm(false);
  };

  const handleCloseHistory = () => {
    setShowHistory(false);
    setSelectedTaskId(null);
  };

  const handleAddNew = () => {
    setEditingTestExecution(null);
    setShowForm(true);
    // router.push('/test-task'); // Redirect to new execution page
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTestExecution(null);
  };

  return (
    <div className="space-y-8 relative">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          UTC Executions
        </h1>
        <Button
          onClick={handleAddNew}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Execution
        </Button>
      </div>

      <TestExecutionTable 
        onEditTestExecution={handleEditTestExecution}
        onShowHistory={handleShowHistory}
      />

      <Dialog open={showForm} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTestExecution ? 'Edit Test Execution' : 'Create Test Execution'}
            </DialogTitle>
          </DialogHeader>
          <TestExecutionForm 
            editTestExecution={editingTestExecution} 
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>

      <TestHistorySidebar
        isOpen={showHistory}
        onClose={handleCloseHistory}
        taskId={selectedTaskId}
      />
    </div>
  );
}