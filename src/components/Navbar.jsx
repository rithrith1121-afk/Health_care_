import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Stethoscope, LogOut, User, LayoutDashboard, ChevronDown, Settings } from 'lucide-react';
import { getLoggedInUser, setLoggedInUser } from '../utils/db';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getLoggedInUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Do not show navbar on Login or Register pages
  if (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/access-denied') {
    return null;
  }

  const handleLogout = () => {
    setLoggedInUser(null);
    setDropdownOpen(false);
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin-dashboard';
    if (user.role === 'doctor') return '/doctor-dashboard';
    return '/patient-dashboard';
  };

  const getProfileLink = () => {
    if (!user) return '/login';
    if (user.role === 'doctor') return '/doctor-profile';
    return '/patient-profile';
  };

  const linkStyle = ({ isActive }) =>
    `px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ease-out flex items-center gap-1.5 ${
      isActive
        ? 'bg-medTeal/10 text-medDarkTeal shadow-sm shadow-teal-700/5 font-bold scale-[1.02]'
        : 'text-slate-600 hover:bg-slate-50 hover:text-medTeal hover:scale-[1.01] active:scale-[0.99]'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-teal-100/60 shadow-sm h-20 flex items-center">
      <div className="max-w-[1600px] mx-auto px-8 lg:px-10 w-full flex items-center justify-between">
        
        {/* Brand Section: Moved far left */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link to="/home" className="flex items-center gap-2.5 hover:opacity-95 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-medTeal to-medDarkTeal flex items-center justify-center text-white shadow-md shadow-teal-700/20">
              <Stethoscope className="w-6 h-6" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-medDarkTeal font-display">
              Health Care <span className="text-medTeal">System</span>
            </span>
          </Link>
        </div>

        {/* Navigation Links: Centered and Spaced */}
        {user && (
          <nav className="hidden md:flex items-center space-x-3 lg:space-x-5 px-6">
            <NavLink to="/home" className={linkStyle}>
              Home
            </NavLink>

            {user.role === 'patient' && (
              <>
                <NavLink to="/patient-dashboard" className={linkStyle}>
                  Dashboard
                </NavLink>
                <NavLink to="/departments" className={linkStyle}>
                  Departments
                </NavLink>
                <NavLink to="/doctors" className={linkStyle}>
                  Doctors
                </NavLink>
                <NavLink to="/schedule" className={linkStyle}>
                  Schedule
                </NavLink>
                <NavLink to="/book-appointment" className={linkStyle}>
                  Book Appointment
                </NavLink>
                <NavLink to="/my-appointments" className={linkStyle}>
                  My Appointments
                </NavLink>
              </>
            )}
          </nav>
        )}

        {/* User Profile Section: Moved far right */}
        <div className="flex items-center gap-3 relative flex-shrink-0">
          {user ? (
            <>
              {/* Compact profile section trigger */}
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 p-1.5 pr-3 rounded-xl border border-slate-100 hover:border-teal-200/60 hover:bg-teal-50/20 transition-all duration-300 focus:outline-none"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-medTeal to-medDarkTeal border border-white/20 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {user.name ? user.name[0] : 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-700 leading-none">{user.name}</p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">{user.role}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu Backdrop close helper */}
              {dropdownOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
              )}

              {/* Dropdown Menu Content */}
              <div
                className={`absolute right-0 top-14 w-56 rounded-2xl bg-white border border-teal-100/50 shadow-xl py-2 z-50 transform origin-top-right transition-all duration-200 ${
                  dropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                }`}
              >
                <div className="px-4 py-2 border-b border-slate-50 text-left">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Account Details</p>
                  <p className="text-sm font-bold text-slate-800 mt-1 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
                
                <div className="p-1 space-y-0.5">
                  {/* Dashboard */}
                  <Link
                    to={getDashboardLink()}
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-medTeal transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>{user.role === 'admin' ? 'Admin' : user.role === 'doctor' ? 'Doctor' : 'Patient'} Dashboard</span>
                  </Link>

                  {/* My Profile */}
                  {user.role !== 'admin' && (
                    <Link
                      to={getProfileLink()}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-medTeal transition-all"
                    >
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </Link>
                  )}

                  {/* Settings placeholder */}
                  <button
                    onClick={() => {
                      alert('Settings panel is currently configured as a placeholder for demonstration.');
                      setDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-medTeal transition-all text-left"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Account Settings</span>
                  </button>
                </div>

                <div className="h-px bg-slate-50 my-1"></div>

                <div className="p-1">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl bg-medTeal text-white font-bold hover:bg-medDarkTeal transition-all-300 text-sm shadow-sm"
            >
              Login
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}
