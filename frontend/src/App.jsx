import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Home from '@/pages/Home';
import Profile from '@/pages/Profile';
import Dashboard from '@/pages/Dashboard';
import UserManagement from '@/pages/UserManagement';
import Categories from '@/pages/Categories';
import Customers from '@/pages/Customers';
import ProjectDetails from '@/pages/ProjectDetails';
import Waren from '@/pages/Waren';
import Terminal from '@/pages/Terminal';
import Zeiterfassung from '@/pages/Zeiterfassung';
import Finance from '@/pages/Finance';
import Subcontractors from '@/pages/Subcontractors';
import Projects from '@/pages/Projects';
import ProjectNew from '@/pages/ProjectNew';
import ProjectDetailsAdmin from '@/pages/ProjectDetailsAdmin';
import ProjectDetailsUser from '@/pages/ProjectDetailsUser';
import Tasks from '@/pages/Tasks';
import Support from '@/pages/Support';
import ProductLogs from '@/pages/ProductLogs';
import CashRegister from '@/pages/CashRegister';
import ContentManagement from '@/pages/ContentManagement';



import { AuthProvider } from '@/context/AuthContext';

import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';


import Requests from '@/pages/Requests';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<Home />} />
          <Route path="/portfolio/:id" element={<ProjectDetails />} />
          <Route path="/my-projects/:id" element={<ProjectDetailsUser />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Admin Routes with Layout */}
          <Route element={<ProtectedRoute allowedRoles={['Admin', 'Projektleiter', 'Gruppenleiter', 'Büro', 'Worker']} />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/support" element={<Support />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/warehouse" element={<Waren />} />
              <Route path="/warehouse/logs" element={<ProductLogs />} />
              <Route path="/warehouse/cash-register" element={<CashRegister />} />
              <Route path="/content" element={<ContentManagement />} />
              <Route path="/terminal" element={<Terminal />} />
              <Route path="/time-tracking" element={<Zeiterfassung />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/subcontractors" element={<Subcontractors />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/new" element={<ProjectNew />} />
              <Route path="/projects/:id" element={<ProjectDetailsAdmin />} />
              <Route path="/projects/:id/edit" element={<ProjectNew />} />




              <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
                <Route path="/users" element={<UserManagement />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
