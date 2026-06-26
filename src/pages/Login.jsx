import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Stethoscope, Eye, EyeOff, KeyRound, Mail, ShieldAlert } from 'lucide-react';
import { getDB, setLoggedInUser, DB_KEYS, decodePassword } from '../utils/db';

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState('patient'); // Default to Patient
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Clear any existing session when accessing Login
  useEffect(() => {
    setLoggedInUser(null);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    const users = getDB(DB_KEYS.USERS);
    const matchedUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.role === role
    );

    if (!matchedUser) {
      setError(`No registered ${role} found with this email.`);
      return;
    }

    if (decodePassword(matchedUser.password) !== password && matchedUser.password !== password) {
      setError('Incorrect password. Please try again.');
      return;
    }

    // Success login
    const userSession = {
      id: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
      role: matchedUser.role,
      isLoggedIn: true
    };
    
    setLoggedInUser(userSession);

    // Redirect based on role
    if (role === 'patient') {
      navigate('/patient-dashboard');
    } else if (role === 'doctor') {
      navigate('/doctor-dashboard');
    } else if (role === 'admin') {
      navigate('/admin-dashboard');
    }
  };

  // Helper for quick logins during demo testing
  const handleQuickLogin = (demoRole) => {
    setRole(demoRole);
    if (demoRole === 'admin') {
      setEmail('admin@hospital.com');
      setPassword('admin123');
    } else if (demoRole === 'doctor') {
      setEmail('ravi@hospital.com');
      setPassword('doctor123');
    } else if (demoRole === 'patient') {
      setEmail('alex@patient.com');
      setPassword('patient123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-medBg via-[#EBF6F6] to-medSoftBlue/30 px-4 py-12">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-medTeal to-medDarkTeal items-center justify-center text-white shadow-lg shadow-teal-700/20 mb-3">
            <Stethoscope className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Health Care <span className="text-medTeal">System</span>
          </h1>
          <p className="text-slate-500 mt-1">Hospital Management & Booking Portal</p>
        </div>

        {/* Card wrapper */}
        <div className="bg-white rounded-2xl shadow-xl border border-teal-100/50 overflow-hidden">
          {/* Role selector tabs */}
          <div className="flex border-b border-slate-100 bg-slate-50/50 p-1">
            {['patient', 'doctor', 'admin'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setRole(r);
                  setError('');
                }}
                className={`flex-1 py-3 text-center text-sm font-semibold capitalize rounded-xl transition-all-300 ${
                  role === r
                    ? 'bg-white text-medDarkTeal shadow-sm border border-slate-100 font-bold'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6">
              Sign In as <span className="text-medTeal capitalize">{role}</span>
            </h2>

            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-start gap-2.5 text-sm animate-shake">
                <ShieldAlert className="w-5 h-5 flex-shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Mail className="w-5 h-5" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={`e.g., ${role === 'admin' ? 'admin' : role === 'doctor' ? 'doctor' : 'patient'}@hospital.com`}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 transition-all-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <KeyRound className="w-5 h-5" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 transition-all-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-medTeal to-medDarkTeal text-white font-bold hover:shadow-lg hover:shadow-teal-700/10 focus:outline-none active:scale-[0.98] transition-all"
              >
                Sign In
              </button>
            </form>

            {role === 'patient' && (
              <p className="text-center text-sm text-slate-500 mt-6">
                New patient?{' '}
                <Link to="/register" className="text-medTeal font-bold hover:underline">
                  Create an account
                </Link>
              </p>
            )}
          </div>
        </div>

        {/* Demo login shortcuts for tester convenience */}
        <div className="mt-8 bg-white border border-teal-100/40 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3 text-center">
            Developer / QA Demo Logins
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickLogin('patient')}
              className="py-2 px-1 text-xs font-semibold rounded-lg bg-teal-50 text-medDarkTeal border border-teal-100/30 hover:bg-teal-100 transition-colors"
            >
              Patient Demo
            </button>
            <button
              onClick={() => handleQuickLogin('doctor')}
              className="py-2 px-1 text-xs font-semibold rounded-lg bg-teal-50 text-medDarkTeal border border-teal-100/30 hover:bg-teal-100 transition-colors"
            >
              Doctor Demo
            </button>
            <button
              onClick={() => handleQuickLogin('admin')}
              className="py-2 px-1 text-xs font-semibold rounded-lg bg-teal-50 text-medDarkTeal border border-teal-100/30 hover:bg-teal-100 transition-colors"
            >
              Admin Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
