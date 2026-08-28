import React from 'react';
import { Card } from '../../components/ui/Card';

export const AdminResourcesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">CMS Resource Articles</h1>
        <p className="text-xs text-slate-400">Publish career insights, tech articles, and developer guides.</p>
      </div>

      <Card className="p-16 text-center bg-slate-950 border-slate-800 text-slate-400">
        <p className="text-base font-bold text-white">Resource CMS Manager Ready.</p>
      </Card>
    </div>
  );
};
