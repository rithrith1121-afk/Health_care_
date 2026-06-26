import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Stethoscope, User, Mail, KeyRound, Phone, Calendar, Heart, ShieldCheck, ShieldAlert } from 'lucide-react';
import { getDB, setDB, DB_KEYS, encodePassword } from '../utils/db';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic Validation
    if (!name || !email || !password || !phone || !dob) {
      setError('Please fill in all fields.');
      return;
    }

    const users = getDB(DB_KEYS.USERS);
    
    // Check if email already exists
    const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      setError('This email is already registered.');
      return;
    }

    // Register Patient
    const newPatientUser = {
      id: 'pat' + Date.now(),
      name,
      email: email.toLowerCase(),
      role: 'patient',
      password: encodePassword(password),
      phone,
      gender,
      dob
    };

    const updatedUsers = [...users, newPatientUser];
    setDB(DB_KEYS.USERS, updatedUsers);

    setSuccess('Registration successful! Redirecting to login...');
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-medBg via-[#EBF6F6] to-medSoftBlue/30 px-4 py-12">
      <div className="max-w-lg w-full">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-medTeal to-medDarkTeal items-center justify-center text-white shadow-lg shadow-teal-700/20 mb-3">
            <Stethoscope className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Health Care <span className="text-medTeal">System</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Create a New Patient Account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-teal-100/50 p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Patient Registration</h2>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-start gap-2.5 text-sm">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3 rounded-xl bg-green-50 border border-green-100 text-green-600 flex items-start gap-2.5 text-sm">
              <ShieldCheck className="w-5 h-5 flex-shrink-0 text-green-500" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 transition-all"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="123-456-7890"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Date of Birth
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 transition-all"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Gender
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Heart className="w-4 h-4" />
                  </span>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medTeal/20 focus:border-medTeal text-slate-700 transition-all bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-medTeal to-medDarkTeal text-white font-bold hover:shadow-lg hover:shadow-teal-700/10 focus:outline-none active:scale-[0.98] transition-all"
            >
              Create Account
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-medTeal font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
