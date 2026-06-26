import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Departments from './pages/Departments';
import Doctors from './pages/Doctors';
import Schedule from './pages/Schedule';
import BookAppointment from './pages/BookAppointment';
import AccessDenied from './pages/AccessDenied';

// Patient Dashboard & Subpages
import PatientDashboard from './pages/PatientDashboard';
import MyAppointments from './pages/MyAppointments';
import PatientProfile from './pages/PatientProfile';

// Doctor Dashboard & Subpages
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorAppointments from './pages/DoctorAppointments';
import DoctorSchedule from './pages/DoctorSchedule';
import DoctorProfile from './pages/DoctorProfile';

// Admin Dashboard & Subpages
import AdminDashboard from './pages/AdminDashboard';
import ManageDoctors from './pages/admin/ManageDoctors';
import ManageDepartments from './pages/admin/ManageDepartments';
import ManageSchedules from './pages/admin/ManageSchedules';
import ManageAppointments from './pages/admin/ManageAppointments';
import ViewPatients from './pages/admin/ViewPatients';
import CreateSchedule from './pages/admin/CreateSchedule';
import AddDoctor from './pages/admin/AddDoctor';

import { getLoggedInUser } from './utils/db';

// Component to handle default redirect for root "/"
function RootRedirect() {
  const user = getLoggedInUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role === 'admin') {
    return <Navigate to="/admin-dashboard" replace />;
  }
  if (user.role === 'doctor') {
    return <Navigate to="/doctor-dashboard" replace />;
  }
  return <Navigate to="/patient-dashboard" replace />;
}

function AppContent() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-medBg flex flex-col font-sans">
      <Navbar />
      <div key={location.pathname} className="flex-1 flex flex-col animate-fadeInUp">
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/access-denied" element={<AccessDenied />} />

          {/* Root Route Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* General Logged-In Common Protected Routes */}
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/departments" 
            element={
              <ProtectedRoute>
                <Departments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctors" 
            element={
              <ProtectedRoute>
                <Doctors />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/schedule" 
            element={
              <ProtectedRoute>
                <Schedule />
              </ProtectedRoute>
            } 
          />

          {/* Patient Protected Routes */}
          <Route 
            path="/patient-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/book-appointment" 
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <BookAppointment />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-appointments" 
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <MyAppointments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient-profile" 
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientProfile />
              </ProtectedRoute>
            } 
          />

          {/* Doctor Protected Routes */}
          <Route 
            path="/doctor-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctor-appointments" 
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorAppointments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctor-schedule" 
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorSchedule />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctor-profile" 
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorProfile />
              </ProtectedRoute>
            } 
          />

          {/* Admin Protected Routes */}
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/manage-doctors" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageDoctors />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/manage-departments" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageDepartments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/manage-schedules" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageSchedules />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/manage-appointments" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageAppointments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/view-patients" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ViewPatients />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/create-schedule" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CreateSchedule />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/add-doctor" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AddDoctor />
              </ProtectedRoute>
            } 
          />

          {/* Fallback to Root Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
