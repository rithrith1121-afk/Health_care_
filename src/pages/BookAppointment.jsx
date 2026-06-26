import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getLoggedInUser, getDB, setDB, DB_KEYS } from '../utils/db';
import { Calendar, Clock, MessageSquare, ShieldCheck, Stethoscope, ChevronRight, AlertCircle, CalendarCheck2 } from 'lucide-react';

export default function BookAppointment() {
  const navigate = useNavigate();
  const location = useLocation();
  const patient = getLoggedInUser();

  const departments = getDB(DB_KEYS.DEPARTMENTS).filter(d => d.status === 'Active');
  const doctors = getDB(DB_KEYS.DOCTORS).filter(d => d.status === 'Available');
  const schedules = getDB(DB_KEYS.SCHEDULES).filter(s => s.status === 'Active');
  const appointments = getDB(DB_KEYS.APPOINTMENTS);

  const initialDept = location.state?.preselectedDept || '';
  const initialDoctorId = location.state?.preselectedDoctorId || '';

  // Form states
  const [selectedDept, setSelectedDept] = useState(initialDept);
  const [selectedDoctorId, setSelectedDoctorId] = useState(initialDoctorId);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');

  // UI States
  const [availableSlots, setAvailableSlots] = useState([]);
  const [validationError, setValidationError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [createdApt, setCreatedApt] = useState(null);

  // Filtered doctors based on selected department
  const filteredDoctors = doctors.filter(doc => doc.department === selectedDept);

  // Keep track of previous selections to trigger resets only on active manual changes
  const prevDeptRef = useRef(initialDept);
  const prevDoctorRef = useRef(initialDoctorId);

  // Reset states when selections change manually
  useEffect(() => {
    if (prevDeptRef.current !== selectedDept) {
      setSelectedDoctorId('');
      setSelectedDate('');
      setSelectedSlot('');
      setAvailableSlots([]);
      setValidationError('');
      prevDeptRef.current = selectedDept;
    }
  }, [selectedDept]);

  useEffect(() => {
    if (prevDoctorRef.current !== selectedDoctorId) {
      setSelectedDate('');
      setSelectedSlot('');
      setAvailableSlots([]);
      setValidationError('');
      prevDoctorRef.current = selectedDoctorId;
    }
  }, [selectedDoctorId]);


  // Compute available slots whenever Doctor or Date changes
  useEffect(() => {
    if (!selectedDoctorId || !selectedDate) {
      setAvailableSlots([]);
      return;
    }

    setValidationError('');

    // 1. Find schedule for selected doctor
    const docSchedule = schedules.find(s => s.doctorId === selectedDoctorId);
    if (!docSchedule) {
      setValidationError('No active schedule configuration found for this doctor.');
      setAvailableSlots([]);
      return;
    }

    // 2. Check if selected date corresponds to an available day
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const [year, month, day] = selectedDate.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const selectedDayName = daysOfWeek[dateObj.getDay()];

    const isAvailableDay = docSchedule.availableDays.includes(selectedDayName);
    if (!isAvailableDay) {
      setValidationError(`Doctor is not scheduled to work on ${selectedDayName}s. Please choose another date.`);
      setAvailableSlots([]);
      return;
    }

    // 3. Generate slots
    const generated = [];
    let [startHour, startMin] = docSchedule.startTime.split(':').map(Number);
    let [endHour, endMin] = docSchedule.endTime.split(':').map(Number);

    let current = new Date();
    current.setHours(startHour, startMin, 0, 0);

    const end = new Date();
    end.setHours(endHour, endMin, 0, 0);

    while (current < end) {
      const formattedSlot = current.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      // Check if slot is already booked for this doctor on this date
      const isBooked = appointments.some(
        (apt) => 
          apt.doctorId === selectedDoctorId && 
          apt.appointmentDate === selectedDate && 
          apt.timeSlot === formattedSlot && 
          apt.status !== 'Cancelled'
      );

      // Check if slot is in the past (if date is today)
      let isPastSlot = false;
      const todayStr = new Date().toISOString().split('T')[0];
      if (selectedDate === todayStr) {
        const now = new Date();
        const slotTime = new Date();
        slotTime.setHours(current.getHours(), current.getMinutes(), 0, 0);
        if (slotTime < now) {
          isPastSlot = true;
        }
      }

      generated.push({
        time: formattedSlot,
        isBooked,
        isPast: isPastSlot
      });

      current.setMinutes(current.getMinutes() + docSchedule.slotDuration);
    }

    setAvailableSlots(generated);
  }, [selectedDoctorId, selectedDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!selectedDept || !selectedDoctorId || !selectedDate || !selectedSlot || !reason.trim()) {
      setValidationError('Please fill in all details, select a time slot, and specify a reason.');
      return;
    }

    // Ensure date is not in the past
    const todayStr = new Date().toISOString().split('T')[0];
    if (selectedDate < todayStr) {
      setValidationError('Cannot book appointments on past dates.');
      return;
    }

    // Prevent duplicate booking (same patient, same doctor, same date, same slot)
    const isDuplicate = appointments.some(
      (apt) => 
        apt.patientId === patient.id &&
        apt.doctorId === selectedDoctorId &&
        apt.appointmentDate === selectedDate &&
        apt.timeSlot === selectedSlot &&
        apt.status !== 'Cancelled'
    );

    if (isDuplicate) {
      setValidationError('You already have an appointment booked with this doctor at this specific time.');
      return;
    }

    const doctorObj = doctors.find(d => d.doctorId === selectedDoctorId);

    const newAppointment = {
      appointmentId: 'apt' + Date.now(),
      patientId: patient.id,
      patientName: patient.name,
      doctorId: selectedDoctorId,
      doctorName: doctorObj.doctorName,
      department: selectedDept,
      appointmentDate: selectedDate,
      timeSlot: selectedSlot,
      reasonForVisit: reason.trim(),
      status: 'Pending'
    };

    // Save to DB
    const updatedApts = [...appointments, newAppointment];
    setDB(DB_KEYS.APPOINTMENTS, updatedApts);

    setCreatedApt(newAppointment);
    setShowConfirmModal(true);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 font-display">Book Medical Appointment</h1>
        <p className="text-slate-500 mt-1">Select clinic details, doctor availability, and reserve your consultation session.</p>
      </div>

      <div className="bg-white rounded-3xl border border-teal-100/40 shadow-sm overflow-hidden p-6 md:p-8">
        {validationError && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 flex items-start gap-2.5 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
            <span className="font-semibold">{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Select Department */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              1. Clinic / Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full py-3 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 font-medium transition-all bg-white"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.departmentId} value={dept.departmentName}>
                  {dept.departmentName}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Select Doctor */}
          {selectedDept && (
            <div className="animate-fadeIn">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                2. Select Consulting Physician
              </label>
              {filteredDoctors.length === 0 ? (
                <p className="text-sm text-slate-400 bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                  No available doctors in this department currently.
                </p>
              ) : (
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full py-3 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 font-medium transition-all bg-white"
                >
                  <option value="">Select Doctor</option>
                  {filteredDoctors.map((doc) => (
                    <option key={doc.doctorId} value={doc.doctorId}>
                      {doc.doctorName} ({doc.specialization}) - {doc.availableTime}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Step 3: Select Date */}
          {selectedDoctorId && (
            <div className="animate-fadeIn">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                3. Choose Appointment Date
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Calendar className="w-5 h-5" />
                </span>
                <input
                  type="date"
                  value={selectedDate}
                  min={todayStr}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSlot('');
                  }}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 font-medium transition-all"
                />
              </div>
            </div>
          )}

          {/* Step 4: Available Time Slots */}
          {selectedDate && availableSlots.length > 0 && (
            <div className="animate-fadeIn">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                4. Select Time Slot
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {availableSlots.map((slot) => {
                  const isDisabled = slot.isBooked || slot.isPast;
                  const isSelected = selectedSlot === slot.time;
                  
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => setSelectedSlot(slot.time)}
                      className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center gap-1 ${
                        isSelected 
                          ? 'bg-medTeal text-white border-medTeal shadow-md shadow-teal-700/10'
                          : isDisabled
                            ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed line-through'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-medTeal hover:bg-teal-50/20'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{slot.time}</span>
                      {slot.isBooked && <span className="text-[9px] font-semibold text-rose-400">Booked</span>}
                      {slot.isPast && <span className="text-[9px] font-semibold text-amber-500">Past</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 5: Reason for Visit */}
          {selectedSlot && (
            <div className="animate-fadeIn">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                5. Reason for Visit
              </label>
              <div className="relative">
                <span className="absolute top-3.5 left-3.5 text-slate-400 pointer-events-none">
                  <MessageSquare className="w-5 h-5" />
                </span>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe your symptoms or reason for consulting the doctor..."
                  rows="3"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 font-medium transition-all"
                />
              </div>
            </div>
          )}

          {/* Submit */}
          {selectedSlot && (
            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-medTeal to-medDarkTeal text-white font-bold hover:shadow-lg hover:shadow-teal-700/15 focus:outline-none active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" /> Confirm Appointment Reservation
            </button>
          )}
        </form>
      </div>

      {/* Confirmation Success Modal */}
      {showConfirmModal && createdApt && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 md:p-8 text-center border border-teal-50 animate-scaleUp">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-4 border border-emerald-100">
              <CalendarCheck2 className="w-8 h-8" />
            </div>
            
            <h3 className="text-xl font-extrabold text-slate-800 mb-1">Appointment Confirmed!</h3>
            <p className="text-slate-400 text-xs tracking-wider uppercase font-semibold mb-6">ID: {createdApt.appointmentId}</p>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left text-sm space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-400">Doctor:</span>
                <span className="font-bold text-slate-800">{createdApt.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Clinic:</span>
                <span className="font-semibold text-slate-700">{createdApt.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date:</span>
                <span className="font-semibold text-slate-700">{createdApt.appointmentDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Time Slot:</span>
                <span className="font-bold text-medTeal">{createdApt.timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="px-2 py-0.5 bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold rounded">
                  {createdApt.status}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  navigate('/my-appointments');
                }}
                className="w-full py-3 bg-medTeal hover:bg-medDarkTeal text-white font-bold rounded-xl transition-all shadow-sm"
              >
                Go to My Appointments
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedDept('');
                  setSelectedDoctorId('');
                  setSelectedDate('');
                  setSelectedSlot('');
                  setReason('');
                }}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all"
              >
                Book Another Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
