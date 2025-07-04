'use client';

import React, { useEffect, useState } from 'react';
import { useTestExecution } from '@/context/TestExecutionContext';
import { useTask } from '@/context/TaskContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, History, Search, Filter, RefreshCw, FileText, Calendar, User, Target, Tag, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { TestExecution } from '@/types/testExecution';
import MultiSelectTags from './MultiSelectTags';

interface TestExecutionTableProps {
  onEditTestExecution: (testExecution: TestExecution) => void;
  onShowHistory: (taskId: string) => void;
}

export default function TestExecutionTable({ onEditTestExecution, onShowHistory }: TestExecutionTableProps) {
  const { testExecutions, loading, error, getTestExecutions, deleteTestExecution } = useTestExecution();
  const { tasks, getTasks } = useTask();
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    tags: [] as string[],
    status: '',
    label: '',
  });

  // Available options for filters
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableLabels, setAvailableLabels] = useState<string[]>([]);

  useEffect(() => {
    // Load initial data
    getTasks();
    getTestExecutions();
  }, []);

  useEffect(() => {
    // Extract unique tags and labels from tasks
    if (tasks.length > 0) {
      const allTags = tasks.flatMap(task => task.tags);
      const uniqueTags = [...new Set(allTags)];
      setAvailableTags(uniqueTags);

      const allLabels = tasks.map(task => task.unitTestLabel);
      setAvailableLabels(allLabels);
    }
  }, [tasks]);

  const handleDelete = async (id: string) => {
    if (!id) return;
    
    try {
      setDeleteLoading(id);
      await deleteTestExecution(id);
    } catch (error) {
      console.error('Error deleting test execution:', error);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearch = () => {
    // Apply filters to get filtered test executions
    getTestExecutions(filters);
  };

  const handleClearFilters = () => {
    setFilters({
      tags: [],
      status: '',
      label: '',
    });
    // Reload all data
    getTestExecutions();
  };

  const handleRefresh = () => {
    getTestExecutions(filters);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'pass':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
      case 'fail':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPassRate = (passed: number, total: number) => {
    if (total === 0) return '0%';
    return `${Math.round((passed / total) * 100)}%`;
  };

  if (loading && testExecutions.length === 0) {
    return (
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="flex items-center space-x-2 text-xl font-bold text-gray-900">
            <FileText className="h-6 w-6 text-blue-600" />
            <span>Test Executions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16">
            <RefreshCw className="h-12 w-12 text-blue-400 animate-spin mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Loading Test Executions</h3>
            <p className="text-gray-500">Please wait while we fetch your data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b">
          <CardTitle className="flex items-center space-x-2 text-xl font-bold text-gray-900">
            <FileText className="h-6 w-6 text-red-600" />
            <span>Test Executions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md text-center">
              <div className="bg-red-100 rounded-full p-3 w-fit mx-auto mb-4">
                <FileText className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-red-800 font-semibold mb-2 text-lg">Error Loading Data</h3>
              <p className="text-red-600 text-sm mb-6">{error}</p>
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                className="text-red-700 border-red-300 hover:bg-red-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Test Executions</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={loading}
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <div className="flex items-center space-x-2 text-sm text-gray-600 bg-white px-3 py-1 rounded-lg border">
              <Filter className="h-4 w-4" />
              <span>{testExecutions.length} total executions</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Enhanced Filters */}
        <div className="mb-8 space-y-6 bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tags Filter */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center space-x-2">
                <Tag className="h-4 w-4" />
                <span>Filter by Tags</span>
              </label>
              <MultiSelectTags
                selectedTags={filters.tags}
                onTagsChange={(tags) => handleFilterChange('tags', tags)}
                placeholder="Select tags to filter..."
              />
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Filter by Status</span>
              </label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
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
                  <SelectItem value="completed">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Completed</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="failed">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span>Failed</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Label Filter */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Filter by Unit Test Label</span>
              </label>
              <Select
                value={filters.label}
                onValueChange={(value) => handleFilterChange('label', value)}
              >
                <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Select unit test label" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Labels</SelectItem>
                  {availableLabels.map((label) => (
                    <SelectItem key={label} value={label}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Use filters above to narrow down test executions
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={handleClearFilters}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Clear Filters
              </Button>
              <Button 
                onClick={handleSearch}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6"
              >
                <Search className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

        {testExecutions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-12 max-w-lg text-center">
              <div className="bg-blue-100 rounded-full p-4 w-fit mx-auto mb-6">
                <History className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-blue-800 font-bold text-xl mb-3">No Test Executions Found</h3>
              <p className="text-blue-600 mb-6 leading-relaxed">
                {(filters.tags.length > 0 || filters.status || filters.label) 
                  ? 'No test executions match your current filters. Try adjusting your search criteria.'
                  : 'Create your first test execution using the Add button above!'
                }
              </p>
              {(filters.tags.length > 0 || filters.status || filters.label) && (
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-gray-200">
                  <TableHead className="font-bold text-gray-800 py-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>Test ID</span>
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-800">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4" />
                      <span>Unit Test Label</span>
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-800">
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4" />
                      <span>Tags</span>
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-800">Status</TableHead>
                  <TableHead className="font-bold text-gray-800">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Tester</span>
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-800">Feedback</TableHead>
                  <TableHead className="font-bold text-gray-800">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Executed At</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-right font-bold text-gray-800">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testExecutions.map((execution, index) => (
                  <TableRow key={execution._id} className="hover:bg-blue-50/50 transition-colors border-b border-gray-100">
                    <TableCell className="font-mono text-sm font-medium text-blue-700 py-4">
                      {execution.testId}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="font-medium text-blue-700">
                        {(execution as any).taskId?.unitTestLabel || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {((execution as any).taskId?.tags || []).slice(0, 3).map((tag: string, tagIndex: number) => (
                          <Badge
                            key={tagIndex}
                            variant="secondary"
                            className="text-xs bg-blue-100 text-blue-800"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {((execution as any).taskId?.tags || []).length > 3 && (
                          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                            +{((execution as any).taskId?.tags || []).length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(execution.status)}
                        <Badge className={`text-xs font-medium ${getStatusColor(execution.status)}`}>
                          {execution.status.toUpperCase()}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-gray-700">
                      {execution.testerName}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-700 truncate" title={execution.feedback}>
                          {execution.feedback.length > 50 
                            ? execution.feedback.substring(0, 50) + '...' 
                            : execution.feedback}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {execution.createdAt && formatDate(execution.createdAt.toString())}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditTestExecution(execution)}
                          className="h-8 w-8 p-0 border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const taskId = typeof execution?.taskId === 'object' && '_id' in execution.taskId 
                              ? (execution.taskId as any)._id 
                              : "";
                            if (taskId) onShowHistory(taskId);
                          }}
                          className="h-8 w-8 p-0 border-green-200 text-green-700 hover:bg-green-50"
                        >
                          <History className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 border-red-200 text-red-700 hover:bg-red-50"
                              disabled={deleteLoading === execution._id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Test Execution</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this test execution? This action cannot be undone and will remove all associated data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => execution._id && handleDelete(execution._id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {deleteLoading === execution._id ? 'Deleting...' : 'Delete'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}