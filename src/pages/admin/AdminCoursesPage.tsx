import React, { useState } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export const AdminCoursesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Course Catalog Manager</h1>
          <p className="text-xs text-slate-400">Manage course modules, video links, and lesson syllabus structures.</p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
          Create Course
        </Button>
      </div>

      <Card className="p-16 text-center bg-slate-950 border-slate-800 text-slate-400 space-y-3">
        <BookOpen className="w-10 h-10 text-sky-500 mx-auto" />
        <h3 className="text-base font-bold text-white">No custom courses created yet.</h3>
        <p className="text-xs max-w-sm mx-auto">
          Add new individual courses or map course IDs to AWS S3 video assets.
        </p>
      </Card>
    </div>
  );
};
