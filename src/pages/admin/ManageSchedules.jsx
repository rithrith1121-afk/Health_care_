import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { getDB, setDB, DB_KEYS } from '../../utils/db';
import { Search, Plus, Trash2, Edit2, Calendar, Clock, Filter, X, AlertCircle } from 'lucide-react';

export default function ManageSchedules() {
  const [schedules, setSchedules] = useState(getDB(DB_KEYS.SCHEDULES));
  const departments = getDB(DB_KEYS.DEPARTMENTS);
  const doctors = getDB(DB_KEYS.DOCTORS);

  // Filters
  const [selectedDoctor, setSelectedDoctor] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');

  // Edit State
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Filter schedules
  const filtered = schedules.filter((sch) => {
    const matchesDoc = selectedDoctor === 'All' || sch.doctorName === selectedDoctor;
    const matchesDept = selectedDept === 'All' || sch.department === selectedDept;
    return matchesDoc && matchesDept;
  });

  const handleDelete = (schId) => {
    if (window.confirm('Are you sure you want to delete this schedule configuration? All pending/confirmed appointments for this doctor will be cancelled.')) {
      const schToDelete = schedules.find((s) => s.scheduleId === schId);
      if (!schToDelete) return;

      const updated = schedules.filter((s) => s.scheduleId !== schId);
      setDB(DB_KEYS.SCHEDULES, updated);
      setSchedules(updated);

      // Cancel appointments
      const appointments = getDB(DB_KEYS.APPOINTMENTS);
      const updatedAppointments = appointments.map((apt) => {
        if (apt.doctorId === schToDelete.doctorId && (apt.status === 'Pending' || apt.status === 'Confirmed')) {
          return { ...apt, status: 'Cancelled' };
        }
        return apt;
      });
      setDB(DB_KEYS.APPOINTMENTS, updatedAppointments);
    }
  };

  const handleEditClick = (sch) => {
    setEditingSchedule({ ...sch });
    setShowEditModal(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingSchedule) return;

    const updated = schedules.map((s) => {
      if (s.scheduleId === editingSchedule.scheduleId) {
        return editingSchedule;
      }
      return s;
    });

    setDB(DB_KEYS.SCHEDULES, updated);
    setSchedules(updated);
    setShowEditModal(false);
    setEditingSchedule(null);
  };

  const handleDayToggle = (day) => {
    if (!editingSchedule) return;
    let days = [...(editingSchedule.availableDays || [])];
    if (days.includes(day)) {
      days = days.filter(d => d !== day);
    } else {
      days.push(day);
    }
    setEditingSchedule({ ...editingSchedule, availableDays: days });
  };

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-medBg">
      <Sidebar role="admin" />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 font-display">Manage Schedules</h1>
            <p className="text-slate-500 mt-1">Configure and assign available days, consulting hours, and slot durations for doctors.</p>
          </div>
          <Link
            to="/admin/create-schedule"
            className="flex items-center gap-1.5 px-5 py-3 rounded-xl bg-medTeal text-white font-bold text-sm hover:bg-medDarkTeal transition-all shadow-md shadow-teal-700/10 active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" /> New Schedule
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-teal-100/40 p-5 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
          {/* Doctor filter */}
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Filter Doctor</label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 text-sm bg-white"
            >
              <option value="All">All Doctors</option>
              {doctors.map((d) => (
                <option key={d.doctorId} value={d.doctorName}>
                  {d.doctorName}
                </option>
              ))}
            </select>
          </div>

          {/* Department filter */}
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Filter Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 text-sm bg-white"
            >
              <option value="All">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.departmentId} value={dept.departmentName}>
                  {dept.departmentName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Schedules list */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-teal-100/40 p-12 text-center text-slate-500">
            <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="font-semibold text-lg">No schedules found matching filter metrics.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-teal-100/40 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Doctor</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Department</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Available Days</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Operating Timings</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Slot Duration</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100 text-slate-700 text-sm">
                  {filtered.map((sch) => (
                    <tr key={sch.scheduleId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-800">{sch.doctorName}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-50 text-medDarkTeal border border-teal-100/30">
                          {sch.department}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600">
                        {Array.isArray(sch.availableDays) ? sch.availableDays.join(', ') : sch.availableDays}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-slate-600 font-semibold">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span>{sch.startTime} - {sch.endTime}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-600">{sch.slotDuration} Mins</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                          sch.status === 'Active' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          {sch.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEditClick(sch)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-medTeal hover:bg-slate-50 transition-colors"
                            title="Edit Schedule"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(sch.scheduleId)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Schedule"
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

      {/* Edit Schedule Modal */}
      {showEditModal && editingSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl p-6 md:p-8 border border-teal-50 my-8 animate-scaleUp">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 font-display">Edit Schedule Configuration</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingSchedule(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Doctor Name (Read Only)
                </label>
                <input
                  type="text"
                  value={editingSchedule.doctorName}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 text-sm font-medium cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Start Time */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Start Time (24h)
                  </label>
                  <input
                    type="time"
                    value={editingSchedule.startTime}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, startTime: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 text-sm font-medium"
                  />
                </div>

                {/* End Time */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    End Time (24h)
                  </label>
                  <input
                    type="time"
                    value={editingSchedule.endTime}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, endTime: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Slot Duration */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Slot Size (Minutes)
                  </label>
                  <select
                    value={editingSchedule.slotDuration}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, slotDuration: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 text-sm font-medium bg-white"
                  >
                    <option value="15">15 mins</option>
                    <option value="20">20 mins</option>
                    <option value="30">30 mins</option>
                    <option value="45">45 mins</option>
                    <option value="60">60 mins</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Schedule Status
                  </label>
                  <select
                    value={editingSchedule.status}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 text-sm font-medium bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Available Days Checkbox Grid */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Weekly Consultation Days
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {weekDays.map((day) => (
                    <label key={day} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-600 hover:bg-teal-50 hover:text-medDarkTeal cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingSchedule.availableDays?.includes(day)}
                        onChange={() => handleDayToggle(day)}
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
                    setEditingSchedule(null);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-medTeal hover:bg-medDarkTeal text-white text-sm font-semibold transition-all shadow-sm active:scale-[0.98]"
                >
                  Save Schedule Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
