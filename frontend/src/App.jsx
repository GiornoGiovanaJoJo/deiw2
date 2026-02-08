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



import { AuthProvider } from '@/context/AuthContext';

import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
          </Route>

          {/* Admin Routes with Layout */}
          <Route element={<ProtectedRoute allowedRoles={['Admin', 'Projektleiter', 'Gruppenleiter', 'Büro', 'Worker']} />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/warehouse" element={<Waren />} />
              <Route path="/terminal" element={<Terminal />} />
              <Route path="/time-tracking" element={<Zeiterfassung />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/subcontractors" element={<Subcontractors />} />
              {/* <Route path="/projects" element={<Projects />} /> */}




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
