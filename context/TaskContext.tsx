'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import axios from 'axios';
import { Task, CreateTaskRequest, TaskContextType } from '@/types/task';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

type TaskAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string };

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
};

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload, loading: false, error: null };
    case 'ADD_TASK':
      return { 
        ...state, 
        tasks: [action.payload, ...state.tasks], 
        loading: false, 
        error: null 
      };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task._id === action.payload._id ? action.payload : task
        ),
        loading: false,
        error: null,
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task._id !== action.payload),
        loading: false,
        error: null,
      };
    default:
      return state;
  }
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  const uploadImages = async (files: FileList): Promise<string[]> => {
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to upload images');
      }
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.error || error.message 
        : 'An unexpected error occurred';
      throw new Error(errorMessage);
    }
  };

  const createTask = async (taskData: CreateTaskRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await axios.post('/api/tasks', taskData);
      
      if (response.data.success) {
        dispatch({ type: 'ADD_TASK', payload: response.data.data });
      } else {
        throw new Error(response.data.error || 'Failed to create task');
      }
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.error || error.message 
        : 'An unexpected error occurred';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const getTasks = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await axios.get('/api/tasks');
      
      if (response.data.success) {
        dispatch({ type: 'SET_TASKS', payload: response.data.data });
      } else {
        throw new Error(response.data.error || 'Failed to fetch tasks');
      }
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.error || error.message 
        : 'An unexpected error occurred';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const updateTask = async (id: string, taskData: CreateTaskRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await axios.put(`/api/tasks/${id}`, taskData);
      
      if (response.data.success) {
        dispatch({ type: 'UPDATE_TASK', payload: response.data.data });
      } else {
        throw new Error(response.data.error || 'Failed to update task');
      }
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.error || error.message 
        : 'An unexpected error occurred';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await axios.delete(`/api/tasks/${id}`);
      
      if (response.data.success) {
        dispatch({ type: 'DELETE_TASK', payload: id });
      } else {
        throw new Error(response.data.error || 'Failed to delete task');
      }
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.error || error.message 
        : 'An unexpected error occurred';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const getTaskById = async (id: string): Promise<Task | null> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await axios.get(`/api/tasks/${id}`);
      
      if (response.data.success) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to fetch task');
      }
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.error || error.message 
        : 'An unexpected error occurred';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return null;
    }
  };

  const contextValue: TaskContextType = {
    tasks: state.tasks,
    loading: state.loading,
    error: state.error,
    createTask,
    getTasks,
    updateTask,
    deleteTask,
    getTaskById,
    uploadImages,
  };

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTask() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
}