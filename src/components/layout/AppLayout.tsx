import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { ToastContainer } from '../common/ToastContainer';

export const AppLayout: React.FC = () => {
  return (
    <div className="ag-app-shell">
      <Sidebar />
      <div className="ag-main-wrapper">
        <Navbar />
        <main className="ag-main-content">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};
