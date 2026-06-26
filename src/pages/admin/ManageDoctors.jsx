import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { getDB, setDB, DB_KEYS } from '../../utils/db';
import { Search, Plus, Trash2, Edit2, Stethoscope, Mail, Phone, Calendar, Clock, X, AlertCircle } from 'lucide-react';

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState(getDB(DB_KEYS.DOCTORS));
  const departments = getDB(DB_KEYS.DEPARTMENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDoc, setEditingDoc] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Filter
  const filtered = doctors.filter((doc) => {
    return (
      doc.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleDelete = (docId) => {
    if (window.confirm('Are you sure you want to delete this doctor? Their schedules will be deleted and all appointments will be cancelled.')) {
      const updated = doctors.filter((d) => d.doctorId !== docId);
      // Also delete from users login list
      const users = getDB(DB_KEYS.USERS);
      const updatedUsers = users.filter((u) => u.id !== docId);
      
      setDB(DB_KEYS.DOCTORS, updated);
      setDB(DB_KEYS.USERS, updatedUsers);
      setDoctors(updated);

      // Remove schedules
      const schedules = getDB(DB_KEYS.SCHEDULES);
      const updatedSchedules = schedules.filter((s) => s.doctorId !== docId);
      setDB(DB_KEYS.SCHEDULES, updatedSchedules);

      // Cancel appointments
      const appointments = getDB(DB_KEYS.APPOINTMENTS);
      const updatedAppointments = appointments.map((apt) => {
        if (apt.doctorId === docId) {
          return { ...apt, status: 'Cancelled' };
        }
        return apt;
      });
      setDB(DB_KEYS.APPOINTMENTS, updatedAppointments);
    }
  };

  const handleEditClick = (doc) => {
    setEditingDoc({ ...doc });
    setShowEditModal(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingDoc) return;

    // Get original doctor details
    const originalDoc = doctors.find((d) => d.doctorId === editingDoc.doctorId);
    if (!originalDoc) return;

    // Update doctors database
    const updated = doctors.map((d) => {
      if (d.doctorId === editingDoc.doctorId) {
        return editingDoc;
      }
      return d;
    });

    // Also sync the name/email in the users database
    const users = getDB(DB_KEYS.USERS);
    const updatedUsers = users.map((u) => {
      if (u.id === editingDoc.doctorId) {
        return {
          ...u,
          name: editingDoc.doctorName,
          email: editingDoc.email,
          phone: editingDoc.phone
        };
      }
      return u;
    });

    setDB(DB_KEYS.DOCTORS, updated);
    setDB(DB_KEYS.USERS, updatedUsers);
    setDoctors(updated);

    // Sync changes to Schedules if Name or Department changed
    if (originalDoc.doctorName !== editingDoc.doctorName || originalDoc.department !== editingDoc.department || JSON.stringify(originalDoc.availableDays) !== JSON.stringify(editingDoc.availableDays)) {
      const schedules = getDB(DB_KEYS.SCHEDULES);
      const updatedSchedules = schedules.map((s) => {
        if (s.doctorId === editingDoc.doctorId) {
          return {
            ...s,
            doctorName: editingDoc.doctorName,
            department: editingDoc.department,
            availableDays: editingDoc.availableDays
          };
        }
        return s;
      });
      setDB(DB_KEYS.SCHEDULES, updatedSchedules);
    }

    // Sync changes to Appointments if Name or Department changed
    if (originalDoc.doctorName !== editingDoc.doctorName || originalDoc.department !== editingDoc.department) {
      const appointments = getDB(DB_KEYS.APPOINTMENTS);
      const updatedAppointments = appointments.map((apt) => {
        if (apt.doctorId === editingDoc.doctorId) {
          return {
            ...apt,
            doctorName: editingDoc.doctorName,
            department: editingDoc.department
          };
        }
        return apt;
      });
      setDB(DB_KEYS.APPOINTMENTS, updatedAppointments);
    }

    setShowEditModal(false);
    setEditingDoc(null);
  };

  const handleCheckboxChange = (day) => {
    if (!editingDoc) return;
    let days = [...(editingDoc.availableDays || [])];
    if (days.includes(day)) {
      days = days.filter(d => d !== day);
    } else {
      days.push(day);
    }
    setEditingDoc({ ...editingDoc, availableDays: days });
  };

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-medBg">
      <Sidebar role="admin" />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 font-display">Manage Physicians</h1>
            <p className="text-slate-500 mt-1">Add, edit, search, and delete medical practitioners in the hospital database.</p>
          </div>
          <Link
            to="/admin/add-doctor"
            className="flex items-center gap-1.5 px-5 py-3 rounded-xl bg-medTeal text-white font-bold text-sm hover:bg-medDarkTeal transition-all shadow-md shadow-teal-700/10 active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" /> Add New Doctor
          </Link>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-2xl border border-teal-100/40 p-5 shadow-sm mb-6">
          <div className="relative max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by physician name or department..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 text-sm transition-all"
            />
          </div>
        </div>

        {/* Doctors Table */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-teal-100/40 p-12 text-center text-slate-500">
            <Stethoscope className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="font-semibold text-lg">No physicians found matching parameters.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-teal-100/40 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Physician</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Clinic / Specialty</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Academic Credentials</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Consultation Schedule</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100 text-slate-700 text-sm">
                  {filtered.map((doc) => (
                    <tr key={doc.doctorId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{doc.doctorName}</div>
                        <div className="text-xs text-slate-400 font-medium">{doc.email}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{doc.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-50 text-medDarkTeal border border-teal-100/30">
                          {doc.department}
                        </span>
                        <div className="text-xs text-slate-400 mt-1">{doc.specialization}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-700">{doc.qualification}</div>
                        <div className="text-xs text-slate-400 font-medium">{doc.experience} Years Experience</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-slate-600 font-semibold flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{Array.isArray(doc.availableDays) ? doc.availableDays.join(', ') : doc.availableDays}</span>
                        </div>
                        <div className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{doc.availableTime}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                          doc.status === 'Available' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(doc)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-medTeal hover:bg-slate-50 transition-colors"
                            title="Edit Doctor Details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.doctorId)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Doctor"
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
        )}
      </main>

      {/* Edit Doctor Details Modal */}
      {showEditModal && editingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl p-6 md:p-8 border border-teal-50 my-8 animate-scaleUp">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 font-display">Edit Doctor Profile</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingDoc(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Doctor Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Physician Name
                  </label>
                  <input
                    type="text"
                    value={editingDoc.doctorName}
                    onChange={(e) => setEditingDoc({ ...editingDoc, doctorName: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 text-sm font-medium"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editingDoc.email}
                    onChange={(e) => setEditingDoc({ ...editingDoc, email: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editingDoc.phone}
                    onChange={(e) => setEditingDoc({ ...editingDoc, phone: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 text-sm font-medium"
                  />
                </div>

                {/* Clinic / Department */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Department
                  </label>
                  <select
                    value={editingDoc.department}
                    onChange={(e) => setEditingDoc({ ...editingDoc, department: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 text-sm font-medium bg-white"
                  >
                    {departments.map((dept) => (
                      <option key={dept.departmentId} value={dept.departmentName}>
                        {dept.departmentName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Specialization */}
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Speciality
                  </label>
                  <input
                    type="text"
                    value={editingDoc.specialization}
                    onChange={(e) => setEditingDoc({ ...editingDoc, specialization: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 text-sm font-medium"
                  />
                </div>

                {/* Qualification */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Qualifications
                  </label>
                  <input
                    type="text"
                    value={editingDoc.qualification}
                    onChange={(e) => setEditingDoc({ ...editingDoc, qualification: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 text-sm font-medium"
                  />
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    value={editingDoc.experience}
                    onChange={(e) => setEditingDoc({ ...editingDoc, experience: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 text-sm font-medium"
                  />
                </div>
              </div>

              {/* Consultation Timings */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Consultation Hours (e.g. 09:00 AM - 01:00 PM)
                </label>
                <input
                  type="text"
                  value={editingDoc.availableTime}
                  onChange={(e) => setEditingDoc({ ...editingDoc, availableTime: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 text-sm font-medium"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Availability Status
                </label>
                <select
                  value={editingDoc.status}
                  onChange={(e) => setEditingDoc({ ...editingDoc, status: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 text-sm font-medium bg-white"
                >
                  <option value="Available">Available</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </div>

              {/* Available Days Checkbox Grid */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Weekly Operating Days
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {weekDays.map((day) => (
                    <label key={day} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-600 hover:bg-teal-50 hover:text-medDarkTeal cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingDoc.availableDays?.includes(day)}
                        onChange={() => handleCheckboxChange(day)}
                        className="rounded border-slate-300 text-medTeal focus:ring-medTeal"
                      />
                      <span>{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingDoc(null);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-medTeal hover:bg-medDarkTeal text-white text-sm font-bold transition-all shadow-sm shadow-teal-700/10 active:scale-[0.98]"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
