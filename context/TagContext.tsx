'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import axios from 'axios';

interface Tag {
  _id: string;
  name: string;
  createdBy: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface TagState {
  tags: string[];
  allTags: Tag[];
  loading: boolean;
  error: string | null;
}

type TagAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TAGS'; payload: string[] }
  | { type: 'SET_ALL_TAGS'; payload: Tag[] }
  | { type: 'ADD_TAG'; payload: string };

const initialState: TagState = {
  tags: [],
  allTags: [],
  loading: false,
  error: null,
};

function tagReducer(state: TagState, action: TagAction): TagState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_TAGS':
      return { ...state, tags: action.payload, loading: false, error: null };
    case 'SET_ALL_TAGS':
      return { ...state, allTags: action.payload, loading: false, error: null };
    case 'ADD_TAG':
      return { 
        ...state, 
        tags: [...state.tags, action.payload], 
        loading: false, 
        error: null 
      };
    default:
      return state;
  }
}

interface TagContextType extends TagState {
  getTags: () => Promise<void>;
  getAllTags: () => Promise<void>;
  createTag: (tagName: string) => Promise<string>;
  getTagsByTaskId: (taskId: string) => Promise<string[]>;
}

const TagContext = createContext<TagContextType | undefined>(undefined);

export function TagProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tagReducer, initialState);

  const getTags = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await axios.get('/api/tags');
      
      if (response.data.success) {
        dispatch({ type: 'SET_TAGS', payload: response.data.data });
      } else {
        throw new Error(response.data.error || 'Failed to fetch tags');
      }
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.error || error.message 
        : 'An unexpected error occurred';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const getAllTags = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await axios.get('/api/tags/all');
      
      if (response.data.success) {
        dispatch({ type: 'SET_ALL_TAGS', payload: response.data.data });
      } else {
        throw new Error(response.data.error || 'Failed to fetch all tags');
      }
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.error || error.message 
        : 'An unexpected error occurred';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const createTag = async (tagName: string): Promise<string> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const response = await axios.post('/api/tags', { tag: tagName });
      
      if (response.data.success) {
        dispatch({ type: 'ADD_TAG', payload: response.data.data });
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to create tag');
      }
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.error || error.message 
        : 'An unexpected error occurred';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const getTagsByTaskId = async (taskId: string): Promise<string[]> => {
    try {
      const response = await axios.get(`/api/tasks/${taskId}`);
      
      if (response.data.success) {
        return response.data.data.tags || [];
      } else {
        throw new Error(response.data.error || 'Failed to fetch task tags');
      }
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.error || error.message 
        : 'An unexpected error occurred';
      throw new Error(errorMessage);
    }
  };

  const contextValue: TagContextType = {
    tags: state.tags,
    allTags: state.allTags,
    loading: state.loading,
    error: state.error,
    getTags,
    getAllTags,
    createTag,
    getTagsByTaskId,
  };

  return (
    <TagContext.Provider value={contextValue}>
      {children}
    </TagContext.Provider>
  );
}

export function useTag() {
  const context = useContext(TagContext);
  if (context === undefined) {
    throw new Error('useTag must be used within a TagProvider');
  }
  return context;
}