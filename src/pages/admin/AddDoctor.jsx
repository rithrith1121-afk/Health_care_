import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { getDB, setDB, DB_KEYS, encodePassword } from '../../utils/db';
import { ArrowLeft, UserPlus, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AddDoctor() {
  const navigate = useNavigate();
  const departments = getDB(DB_KEYS.DEPARTMENTS).filter(d => d.status === 'Active');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState('');
  const [availableDays, setAvailableDays] = useState([]);
  const [availableTime, setAvailableTime] = useState('09:00 AM - 01:00 PM');
  const [status, setStatus] = useState('Available');
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

    if (!name || !email || !phone || !department || !specialization || !qualification || !experience) {
      setError('Please fill in all details.');
      return;
    }

    if (availableDays.length === 0) {
      setError('Please select at least one available day.');
      return;
    }

    const doctors = getDB(DB_KEYS.DOCTORS);
    const users = getDB(DB_KEYS.USERS);

    // Check if email already registered
    const emailExists = doctors.some(d => d.email.toLowerCase() === email.trim().toLowerCase()) ||
                        users.some(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (emailExists) {
      setError('This email is already registered in the system.');
      return;
    }

    const newDocId = 'doc' + Date.now();

    // 1. Create doctor profile
    const newDoctor = {
      doctorId: newDocId,
      doctorName: 'Dr. ' + name.replace(/^Dr\.\s*/i, ''), // Ensure Dr. prefix
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      department,
      specialization: specialization.trim(),
      qualification: qualification.trim(),
      experience: experience.trim(),
      availableDays,
      availableTime,
      status
    };

    // 2. Create login user credentials
    const newDoctorUser = {
      id: newDocId,
      name: newDoctor.doctorName,
      email: newDoctor.email,
      role: 'doctor',
      password: encodePassword('doctor123'), // Default credentials for QA review
      phone: newDoctor.phone
    };

    // 3. Create default active schedule configuration
    const newSchedule = {
      scheduleId: 'sch_' + newDocId,
      doctorId: newDocId,
      doctorName: newDoctor.doctorName,
      department: newDoctor.department,
      availableDays: newDoctor.availableDays,
      startTime: "09:00",
      endTime: "17:00",
      slotDuration: 30,
      status: "Active"
    };

    // Save to localStorage
    const updatedDocs = [...doctors, newDoctor];
    const updatedUsers = [...users, newDoctorUser];
    const schedules = getDB(DB_KEYS.SCHEDULES);
    const updatedSchedules = [...schedules, newSchedule];

    setDB(DB_KEYS.DOCTORS, updatedDocs);
    setDB(DB_KEYS.USERS, updatedUsers);
    setDB(DB_KEYS.SCHEDULES, updatedSchedules);

    // Redirect to doctors list
    navigate('/admin/manage-doctors');
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-medBg">
      <Sidebar role="admin" />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/manage-doctors')}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 font-display">Add Physician Profile</h1>
            <p className="text-slate-500 mt-1">Register a new medical practitioner and initialize credentials in the database.</p>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Doctor Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Physician Name (Excluding 'Dr.')
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ravi Kumar"
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ravi@hospital.com"
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
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="123-456-7890"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 text-sm font-medium"
                />
              </div>

              {/* Clinic / Department Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Clinic Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 text-sm font-medium bg-white"
                >
                  <option value="">Select Department</option>
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
                  Clinical Specialty
                </label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="Family Medicine"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 text-sm font-medium"
                />
              </div>

              {/* Qualification */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Academic Qualifications
                </label>
                <input
                  type="text"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="MBBS, MD"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 text-sm font-medium"
                />
              </div>

              {/* Experience */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Active Experience (Years)
                </label>
                <input
                  type="number"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="10"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 text-sm font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Available Time block */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Availability Time Block
                </label>
                <input
                  type="text"
                  value={availableTime}
                  onChange={(e) => setAvailableTime(e.target.value)}
                  placeholder="e.g. 09:00 AM - 01:00 PM"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 text-sm font-medium"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Practitioner Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 text-sm font-medium bg-white"
                >
                  <option value="Available">Available</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </div>
            </div>

            {/* Available Days checkboxes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Consultation Days
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

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100/60 text-xs text-slate-400 mt-2">
              ⚠️ Note: Adding this doctor creates a patient-accessible record AND initializes user credentials: 
              email <span className="font-bold text-slate-600">{email || 'N/A'}</span> with default password <span className="font-bold text-slate-600">doctor123</span>.
            </div>

            <button
              type="submit"
              className="w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-medTeal to-medDarkTeal text-white font-bold hover:shadow-lg hover:shadow-teal-700/10 focus:outline-none active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" /> Save and Publish Doctor Profile
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
