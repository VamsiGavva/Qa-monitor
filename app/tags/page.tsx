'use client';

import React, { useState, useEffect } from 'react';
import { useTag } from '@/context/TagContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Tag, Search, Loader2, CheckCircle } from 'lucide-react';

export default function TagsPage() {
  const { tags, loading, error, getTags, createTag } = useTag();
  const [newTagName, setNewTagName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    getTags();
  }, []);

  const filteredTags = tags.filter(tag =>
    tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTagName.trim()) {
      setCreateError('Tag name is required');
      return;
    }

    try {
      setCreateLoading(true);
      setCreateError('');
      setSuccessMessage('');
      
      await createTag(newTagName.trim());
      setNewTagName('');
      setSuccessMessage('Tag created successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setCreateError('Failed to create tag');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <Tag className="h-8 w-8 text-blue-600" />
            <span>Tags Management</span>
          </h1>
          <p className="text-gray-600 mt-2">Create and manage tags for your test cases</p>
        </div>
      </div>

      {/* Create New Tag */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-xl font-bold text-gray-900">
            <Plus className="h-6 w-6 text-blue-600" />
            <span>Create New Tag</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateTag} className="space-y-4">
            {createError && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {createError}
                </AlertDescription>
              </Alert>
            )}
            
            {successMessage && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="tagName" className="text-sm font-semibold text-gray-700">
                  Tag Name
                </Label>
                <Input
                  id="tagName"
                  value={newTagName}
                  onChange={(e) => {
                    setNewTagName(e.target.value);
                    setCreateError('');
                  }}
                  placeholder="Enter tag name..."
                  className="mt-1 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  disabled={createLoading}
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="submit"
                  disabled={createLoading || !newTagName.trim()}
                  className="h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6"
                >
                  {createLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Tag
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Search and Tags List */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="h-6 w-6 text-gray-600" />
              <span className="text-xl font-bold text-gray-900">All Tags</span>
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                {filteredTags.length} tags
              </Badge>
            </div>
          </CardTitle>
          <div className="mt-4">
            <Input
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-12 w-12 text-blue-400 animate-spin mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Loading Tags</h3>
              <p className="text-gray-500">Please wait while we fetch your tags...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md text-center">
                <div className="bg-red-100 rounded-full p-3 w-fit mx-auto mb-4">
                  <Tag className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-red-800 font-semibold mb-2 text-lg">Error Loading Tags</h3>
                <p className="text-red-600 text-sm mb-6">{error}</p>
                <Button 
                  onClick={getTags} 
                  variant="outline" 
                  className="text-red-700 border-red-300 hover:bg-red-50"
                >
                  <Loader2 className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          ) : filteredTags.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-12 max-w-lg text-center">
                <div className="bg-blue-100 rounded-full p-4 w-fit mx-auto mb-6">
                  <Tag className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-blue-800 font-bold text-xl mb-3">
                  {searchTerm ? 'No Tags Found' : 'No Tags Created Yet'}
                </h3>
                <p className="text-blue-600 mb-6 leading-relaxed">
                  {searchTerm 
                    ? `No tags match "${searchTerm}". Try adjusting your search.`
                    : 'Create your first tag using the form above to get started!'
                  }
                </p>
                {searchTerm && (
                  <Button
                    onClick={() => setSearchTerm('')}
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredTags.map((tag, index) => (
                <div
                  key={index}
                  className="group p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-gray-500 group-hover:text-blue-600" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 truncate">
                      {tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}