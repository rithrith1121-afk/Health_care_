import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDB, DB_KEYS, getLoggedInUser } from '../utils/db';
import { 
  Building, 
  Layers, 
  CheckCircle, 
  X, 
  Users, 
  Clock, 
  Activity, 
  ShieldCheck, 
  Calendar, 
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';

export default function Departments() {
  const navigate = useNavigate();
  const user = getLoggedInUser();
  const departments = getDB(DB_KEYS.DEPARTMENTS);
  const doctors = getDB(DB_KEYS.DOCTORS);
  const schedules = getDB(DB_KEYS.SCHEDULES);

  const [selectedDept, setSelectedDept] = useState(null);
  const [expandedDocId, setExpandedDocId] = useState(null); // Inline profile toggle

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedDept(null);
        setExpandedDocId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleBookClick = (docId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'patient') {
      alert('Only registered Patients can book appointments.');
      return;
    }
    setSelectedDept(null);
    setExpandedDocId(null);
    navigate('/book-appointment', {
      state: {
        preselectedDept: selectedDept.departmentName,
        preselectedDoctorId: docId
      }
    });
  };

  // Compute modal statistics for chosen department
  const getDeptStats = (deptName) => {
    const deptDocs = doctors.filter(doc => doc.department === deptName);
    const totalDocs = deptDocs.length;
    const availableDocs = deptDocs.filter(doc => doc.status === 'Available').length;
    
    const deptSchedules = schedules.filter(sch => sch.department === deptName && sch.status === 'Active');
    
    // Find hours range
    let hoursText = '09:00 AM - 05:00 PM';
    if (deptSchedules.length > 0) {
      const startTimes = deptSchedules.map(s => s.startTime).sort();
      const endTimes = deptSchedules.map(s => s.endTime).sort();
      
      const formatTime12 = (time24) => {
        const [h, m] = time24.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 || 12;
        return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
      };
      
      hoursText = `${formatTime12(startTimes[0])} - ${formatTime12(endTimes[endTimes.length - 1])}`;
    }

    // Average duration
    const avgDuration = deptSchedules.length > 0
      ? Math.round(deptSchedules.reduce((acc, curr) => acc + curr.slotDuration, 0) / deptSchedules.length)
      : 30;

    return {
      totalDocs,
      availableDocs,
      hoursText,
      avgDuration
    };
  };

  // Get list of doctors for the chosen department
  const getDeptDoctors = (deptName) => {
    return doctors.filter(doc => doc.department === deptName);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 font-display">Hospital Departments</h1>
        <p className="text-slate-500 mt-3 text-sm sm:text-base leading-relaxed">
          Discover our specialized clinics. Click on any department card to explore consulting hours, view assigned medical practitioners, and reserve a session directly.
        </p>
      </div>

      {departments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-teal-100/40 p-12 text-center text-slate-500">
          <Layers className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="font-semibold text-lg">No departments found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => {
            const stats = getDeptStats(dept.departmentName);
            return (
              <div 
                key={dept.departmentId} 
                onClick={() => setSelectedDept(dept)}
                className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md hover:scale-[1.01] hover:border-teal-200/50 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-teal-50 text-medTeal group-hover:bg-medTeal group-hover:text-white transition-all duration-300 shadow-sm shadow-teal-600/5">
                      <Building className="w-6 h-6" />
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                      dept.status === 'Active' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      {dept.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2 font-display">{dept.departmentName}</h3>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-4">{dept.description}</p>
                </div>
                
                <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span className="text-medTeal group-hover:underline">Explore Department & Doctors →</span>
                  <span>{stats.totalDocs} Doctors</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modern Center Modal Overlay */}
      {selectedDept && (() => {
        const stats = getDeptStats(selectedDept.departmentName);
        const deptDocs = getDeptDoctors(selectedDept.departmentName);

        return (
          <div 
            onClick={() => {
              setSelectedDept(null);
              setExpandedDocId(null);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn"
          >
            {/* Modal Box */}
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6 md:p-8 border border-teal-50/20 relative animate-scaleUp"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setSelectedDept(null);
                  setExpandedDocId(null);
                }}
                className="absolute right-4 top-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                aria-label="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="mb-8 pr-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-teal-50 text-medTeal shadow-sm">
                    <Building className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-800 font-display">{selectedDept.departmentName}</h2>
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full">
                    {selectedDept.status}
                  </span>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">{selectedDept.description}</p>
              </div>

              {/* Department Statistics Section */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 shadow-sm text-center">
                  <Users className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-slate-800">{stats.totalDocs}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Doctors</p>
                </div>
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 shadow-sm text-center">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-slate-800">{stats.availableDocs}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Available Today</p>
                </div>
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 shadow-sm text-center">
                  <Clock className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-700 truncate" title={stats.hoursText}>{stats.hoursText}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Consulting Hours</p>
                </div>
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 shadow-sm text-center">
                  <Activity className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-slate-800">{stats.avgDuration}m</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Avg Session Size</p>
                </div>
              </div>

              {/* Doctors List Title */}
              <h3 className="text-base font-bold text-slate-800 mb-4 font-display flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Sparkles className="w-4 h-4 text-medTeal animate-pulse" /> Consulting Physicians ({deptDocs.length})
              </h3>

              {/* Doctors Content */}
              {deptDocs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 bg-slate-50/40 rounded-3xl border border-slate-100">
                  <AlertCircle className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-500">No doctors are currently assigned to this department.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {deptDocs.map((doc) => {
                    const isExpanded = expandedDocId === doc.doctorId;
                    
                    return (
                      <div 
                        key={doc.doctorId}
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md hover:border-teal-100/40 transition-all duration-300"
                      >
                        {/* Summary View */}
                        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-medTeal to-medDarkTeal flex items-center justify-center text-white font-extrabold shadow-sm flex-shrink-0">
                              {doc.doctorName ? doc.doctorName.split(' ').pop()[0] : 'D'}
                            </div>

                            {/* Main Details */}
                            <div>
                              <div className="flex items-center gap-2.5">
                                <h4 className="font-bold text-slate-800 text-sm sm:text-base">{doc.doctorName}</h4>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  doc.status === 'Available' 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                    : 'bg-rose-50 text-rose-700 border border-rose-100'
                                }`}>
                                  {doc.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                {doc.specialization} • {doc.qualification}
                              </p>
                              
                              {/* Timing Sub-details */}
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500 font-medium">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  {Array.isArray(doc.availableDays) ? doc.availableDays.join(', ') : doc.availableDays}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  {doc.availableTime}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Quick CTA Actions */}
                          <div className="flex items-center gap-2 md:self-center">
                            <button
                              onClick={() => setExpandedDocId(isExpanded ? null : doc.doctorId)}
                              className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-medTeal hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5 transition-colors"
                            >
                              <Info className="w-3.5 h-3.5" />
                              <span>Details</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              disabled={doc.status !== 'Available'}
                              onClick={() => handleBookClick(doc.doctorId)}
                              className={`px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-1 ${
                                doc.status === 'Available'
                                  ? 'bg-medTeal hover:bg-medDarkTeal text-white shadow-teal-700/5 active:scale-[0.98]'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/50'
                              }`}
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Book Slot</span>
                            </button>
                          </div>
                        </div>

                        {/* Collapsible Detail Panel */}
                        {isExpanded && (
                          <div className="px-5 pb-5 pt-3 border-t border-slate-50 bg-slate-50/20 text-xs text-slate-500 space-y-2.5 animate-fadeIn">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Academic Credentials</span>
                                <p className="font-semibold text-slate-700 mt-0.5">{doc.qualification}</p>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Clinical Experience</span>
                                <p className="font-semibold text-slate-700 mt-0.5">{doc.experience} Years Active Practice</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Professional Email</span>
                                <p className="font-semibold text-slate-700 mt-0.5">{doc.email}</p>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Contact Phone</span>
                                <p className="font-semibold text-slate-700 mt-0.5">{doc.phone}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
