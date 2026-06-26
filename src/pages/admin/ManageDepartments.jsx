import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { getDB, setDB, DB_KEYS } from '../../utils/db';
import { Building, Plus, Trash2, Edit2, CheckCircle, X, AlertCircle, Sparkles } from 'lucide-react';

export default function ManageDepartments() {
  const [departments, setDepartments] = useState(getDB(DB_KEYS.DEPARTMENTS));
  
  // Add Department state
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newStatus, setNewStatus] = useState('Active');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Edit Department state
  const [editingDept, setEditingDept] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleAddDepartment = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newName.trim() || !newDesc.trim()) {
      setError('Please provide department name and description.');
      return;
    }

    // Check duplicate
    const exists = departments.some(
      (d) => d.departmentName.toLowerCase() === newName.trim().toLowerCase()
    );
    if (exists) {
      setError('A department with this name already exists.');
      return;
    }

    const newDept = {
      departmentId: 'dep' + Date.now(),
      departmentName: newName.trim(),
      description: newDesc.trim(),
      status: newStatus
    };

    const updated = [...departments, newDept];
    setDB(DB_KEYS.DEPARTMENTS, updated);
    setDepartments(updated);
    
    // Clear inputs
    setNewName('');
    setNewDesc('');
    setNewStatus('Active');
    setSuccess('Department added successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDelete = (deptId) => {
    if (window.confirm('Are you sure you want to delete this department? All assigned doctors, schedules, and active appointments will be removed or cancelled.')) {
      const deptToDelete = departments.find(d => d.departmentId === deptId);
      if (!deptToDelete) return;

      const deptName = deptToDelete.departmentName;

      // Filter departments
      const updatedDepts = departments.filter((d) => d.departmentId !== deptId);
      setDB(DB_KEYS.DEPARTMENTS, updatedDepts);
      setDepartments(updatedDepts);

      // Delete assigned doctors
      const allDoctors = getDB(DB_KEYS.DOCTORS);
      const doctorsToDelete = allDoctors.filter(doc => doc.department === deptName);
      const updatedDoctors = allDoctors.filter(doc => doc.department !== deptName);
      setDB(DB_KEYS.DOCTORS, updatedDoctors);

      // Delete doctor logins from users
      const allUsers = getDB(DB_KEYS.USERS);
      const doctorIdsToDelete = doctorsToDelete.map(d => d.doctorId);
      const updatedUsers = allUsers.filter(u => !doctorIdsToDelete.includes(u.id));
      setDB(DB_KEYS.USERS, updatedUsers);

      // Delete schedules belonging to the department or those doctors
      const allSchedules = getDB(DB_KEYS.SCHEDULES);
      const updatedSchedules = allSchedules.filter(sch => sch.department !== deptName && !doctorIdsToDelete.includes(sch.doctorId));
      setDB(DB_KEYS.SCHEDULES, updatedSchedules);

      // Cancel appointments in that department or with those doctors
      const allAppointments = getDB(DB_KEYS.APPOINTMENTS);
      const updatedAppointments = allAppointments.map(apt => {
        if (apt.department === deptName || doctorIdsToDelete.includes(apt.doctorId)) {
          return { ...apt, status: 'Cancelled' };
        }
        return apt;
      });
      setDB(DB_KEYS.APPOINTMENTS, updatedAppointments);
    }
  };

  const handleEditClick = (dept) => {
    setEditingDept({ ...dept });
    setShowEditModal(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingDept) return;

    const originalDept = departments.find(d => d.departmentId === editingDept.departmentId);
    if (!originalDept) return;

    const oldName = originalDept.departmentName;
    const newName = editingDept.departmentName.trim();

    // Save department
    const updated = departments.map((d) => {
      if (d.departmentId === editingDept.departmentId) {
        return { ...editingDept, departmentName: newName };
      }
      return d;
    });

    setDB(DB_KEYS.DEPARTMENTS, updated);
    setDepartments(updated);

    // If department name was changed, sync changes to other tables
    if (oldName !== newName) {
      // Sync Doctors
      const allDoctors = getDB(DB_KEYS.DOCTORS);
      const updatedDoctors = allDoctors.map(doc => {
        if (doc.department === oldName) {
          return { ...doc, department: newName };
        }
        return doc;
      });
      setDB(DB_KEYS.DOCTORS, updatedDoctors);

      // Sync Schedules
      const allSchedules = getDB(DB_KEYS.SCHEDULES);
      const updatedSchedules = allSchedules.map(sch => {
        if (sch.department === oldName) {
          return { ...sch, department: newName };
        }
        return sch;
      });
      setDB(DB_KEYS.SCHEDULES, updatedSchedules);

      // Sync Appointments
      const allAppointments = getDB(DB_KEYS.APPOINTMENTS);
      const updatedAppointments = allAppointments.map(apt => {
        if (apt.department === oldName) {
          return { ...apt, department: newName };
        }
        return apt;
      });
      setDB(DB_KEYS.APPOINTMENTS, updatedAppointments);
    }

    setShowEditModal(false);
    setEditingDept(null);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-medBg">
      <Sidebar role="admin" />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 font-display">Manage Departments</h1>
          <p className="text-slate-500 mt-1">Configure clinical services, diagnostic departments, and service status codes.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Department Form */}
          <div className="bg-white rounded-3xl border border-teal-100/40 p-6 shadow-sm self-start">
            <h3 className="text-base font-bold text-slate-800 mb-4 font-display flex items-center gap-1.5">
              <Plus className="w-5 h-5 text-medTeal" /> Add Department
            </h3>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 flex items-start gap-2 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-100 text-green-700 flex items-start gap-2 text-xs">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleAddDepartment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Department Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ophthalmology"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Description
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Clinical functions summary..."
                  rows="3"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Service Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 text-sm font-medium bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-medTeal hover:bg-medDarkTeal text-white font-bold text-sm transition-all shadow-sm shadow-teal-700/10 active:scale-[0.98]"
              >
                Create Department
              </button>
            </form>
          </div>

          {/* Departments Directory Table */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-teal-100/40 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Department</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Description</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100 text-slate-700 text-sm">
                  {departments.map((dept) => (
                    <tr key={dept.departmentId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-medTeal">
                            <Building className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">{dept.departmentName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">ID: {dept.departmentId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs text-xs leading-relaxed text-slate-500 truncate" title={dept.description}>
                        {dept.description}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                          dept.status === 'Active' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          {dept.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEditClick(dept)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-medTeal hover:bg-slate-50 transition-colors"
                            title="Edit Department"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(dept.departmentId)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Department"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Department Modal */}
      {showEditModal && editingDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 md:p-8 border border-teal-50 animate-scaleUp">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 font-display">Edit Department Details</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingDept(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Department Name
                </label>
                <input
                  type="text"
                  value={editingDept.departmentName}
                  onChange={(e) => setEditingDept({ ...editingDept, departmentName: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Description
                </label>
                <textarea
                  value={editingDept.description}
                  onChange={(e) => setEditingDept({ ...editingDept, description: e.target.value })}
                  required
                  rows="3"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Service Status
                </label>
                <select
                  value={editingDept.status}
                  onChange={(e) => setEditingDept({ ...editingDept, status: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 text-sm font-medium bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingDept(null);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-medTeal hover:bg-medDarkTeal text-white text-sm font-semibold transition-all shadow-sm active:scale-[0.98]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
