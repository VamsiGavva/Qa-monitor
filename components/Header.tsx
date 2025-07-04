'use client';

import React from 'react';
import Link from 'next/link';
import { Bug } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bug className="h-6 w-6 text-red-500" />
          <span className="text-xl font-semibold text-gray-900">QAMonitorTool</span>
        </div>
        
        <nav className="flex items-center space-x-8">
          <Link 
            href="/create-task" 
            className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Create Task
          </Link>
          <Link 
            href="/test-task" 
            className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Test Task
          </Link>
          <Link 
            href="/task-history" 
            className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Task History
          </Link>
        </nav>
      </div>
    </header>
  );
}