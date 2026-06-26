import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { getDB, setDB, DB_KEYS } from '../../utils/db';
import { PlusCircle, ArrowLeft, CalendarDays, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

export default function CreateSchedule() {
  const navigate = useNavigate();
  const doctors = getDB(DB_KEYS.DOCTORS).filter(d => d.status === 'Available');

  // Form states
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [availableDays, setAvailableDays] = useState([]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [slotDuration, setSlotDuration] = useState('30');
  const [status, setStatus] = useState('Active');
  const [error, setError] = useState('');

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleDayToggle = (day) => {
    let days = [...availableDays];
    if (days.includes(day)) {
      days = days.filter(d => d !== day);
    } else {
      days.push(day);
    }
    setAvailableDays(days);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!selectedDoctorId) {
      setError('Please select a doctor.');
      return;
    }

    if (availableDays.length === 0) {
      setError('Please select at least one available day.');
      return;
    }

    if (startTime >= endTime) {
      setError('End time must be after start time.');
      return;
    }

    const doctorObj = doctors.find((d) => d.doctorId === selectedDoctorId);
    const schedules = getDB(DB_KEYS.SCHEDULES);

    const hasSchedule = schedules.some((s) => s.doctorId === selectedDoctorId);
    if (hasSchedule) {
      setError('A schedule configuration already exists for this doctor. Please edit the existing schedule in Manage Schedules instead.');
      return;
    }

    const newSchedule = {
      scheduleId: 'sch' + Date.now(),
      doctorId: selectedDoctorId,
      doctorName: doctorObj.doctorName,
      department: doctorObj.department,
      availableDays,
      startTime,
      endTime,
      slotDuration: parseInt(slotDuration),
      status
    };

    // Save to DB
    const updated = [...schedules, newSchedule];
    setDB(DB_KEYS.SCHEDULES, updated);

    // Redirect to schedules list
    navigate('/admin/manage-schedules');
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-medBg">
      <Sidebar role="admin" />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/manage-schedules')}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 font-display">Create Schedule</h1>
            <p className="text-slate-500 mt-1">Register a new weekly availability template for a physician.</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl border border-teal-100/40 p-6 md:p-8 shadow-sm max-w-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 flex items-start gap-2.5 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Doctor Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                1. Select Physician
              </label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                required
                className="w-full py-3 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 font-medium transition-all bg-white"
              >
                <option value="">Select Doctor</option>
                {doctors.map((doc) => (
                  <option key={doc.doctorId} value={doc.doctorId}>
                    {doc.doctorName} ({doc.department} | {doc.specialization})
                  </option>
                ))}
              </select>
            </div>

            {/* Operating Times */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  2. Start Time (24h)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Clock className="w-4 h-4" />
                  </span>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 text-sm font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  3. End Time (24h)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Clock className="w-4 h-4" />
                  </span>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 text-sm font-medium transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Durations & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  4. Slot Duration
                </label>
                <select
                  value={slotDuration}
                  onChange={(e) => setSlotDuration(e.target.value)}
                  className="w-full py-3 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 font-medium transition-all bg-white"
                >
                  <option value="15">15 mins</option>
                  <option value="20">20 mins</option>
                  <option value="30">30 mins</option>
                  <option value="45">45 mins</option>
                  <option value="60">60 mins</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  5. Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full py-3 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 font-medium transition-all bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Weekly Days selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                6. Weekly Operating Days
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {weekDays.map((day) => (
                  <label key={day} className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-600 hover:bg-teal-50 hover:text-medDarkTeal cursor-pointer">
                    <input
                      type="checkbox"
                      checked={availableDays.includes(day)}
                      onChange={() => handleDayToggle(day)}
                      className="rounded border-slate-300 text-medTeal focus:ring-medTeal"
                    />
                    <span>{day}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-medTeal to-medDarkTeal text-white font-bold hover:shadow-lg hover:shadow-teal-700/10 focus:outline-none active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" /> Save and Publish Schedule
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
