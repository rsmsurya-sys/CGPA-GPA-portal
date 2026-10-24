import { useState, useEffect } from 'react';
import { 
  Cloud, 
  CloudCheck, 
  Database, 
  Key, 
  Lock, 
  LogOut, 
  Mail, 
  RefreshCw, 
  Server, 
  ShieldCheck, 
  Sparkles, 
  User, 
  X,
  AlertCircle
} from 'lucide-react';
import { api, authStorage } from '../services/api';

export default function CloudSyncModal({ 
  isOpen, 
  onClose, 
  currentTranscriptData, 
  onLoadTranscript 
}) {
  const [currentUser, setCurrentUser] = useState(() => authStorage.getUser());
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [backendStatus, setBackendStatus] = useState({ isOnline: false, checked: false });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [registerNo, setRegisterNo] = useState('');
  const [department, setDepartment] = useState('CSE');

  // Check backend server health on open
  useEffect(() => {
    if (isOpen) {
      checkServerHealth();
      const user = authStorage.getUser();
      setCurrentUser(user);
      setMessage(null);
    }
  }, [isOpen]);

  const checkServerHealth = async () => {
    setLoading(true);
    const health = await api.checkHealth();
    setBackendStatus({ ...health, checked: true });
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.login(email, password);
      setCurrentUser(res.user);
      setMessage({ type: 'success', text: `Welcome back, ${res.user.name}!` });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Login failed. Check your credentials.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.register({
        name,
        email,
        password,
        register_no: registerNo,
        department,
      });
      setCurrentUser(res.user);
      setMessage({ type: 'success', text: `Account created successfully for ${res.user.name}!` });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Registration failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setMessage({ type: 'success', text: 'Logged out successfully.' });
  };

  const handleSaveToCloud = async () => {
    if (!currentUser) {
      setMessage({ type: 'error', text: 'Please log in to sync your transcript to PostgreSQL.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      await api.saveTranscript(currentTranscriptData);
      setMessage({ type: 'success', text: 'Transcript securely saved to PostgreSQL database on AWS!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save to cloud.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadFromCloud = async () => {
    if (!currentUser) {
      setMessage({ type: 'error', text: 'Please log in to retrieve your cloud data.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const transcript = await api.getLatestTranscript();
      if (onLoadTranscript) {
        onLoadTranscript(transcript);
      }
      setMessage({ type: 'success', text: 'Latest transcript loaded from PostgreSQL!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'No saved transcript found.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-700/60 bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-slate-900/95 p-6 sm:p-8 text-white shadow-2xl shadow-cyan-500/10">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-xl border border-slate-700 bg-slate-800/80 p-2 text-slate-400 hover:text-white transition"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 p-3 shadow-lg shadow-cyan-500/20 text-white">
            <Cloud className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Cloud Sync & Database
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                FastAPI + PostgreSQL
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Synchronize your academic records securely via REST APIs & JWT
            </p>
          </div>
        </div>

        {/* Live Status Pill */}
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 text-xs">
          <div className="flex items-center gap-2.5">
            <Server className="h-4 w-4 text-slate-400" />
            <div>
              <span className="font-semibold text-slate-300">Backend Server: </span>
              {backendStatus.isOnline ? (
                <span className="text-emerald-400 font-bold inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  FastAPI Online ({backendStatus.database_status === 'connected' ? 'PostgreSQL Connected' : 'DB Offline'})
                </span>
              ) : (
                <span className="text-amber-400 font-semibold">
                  Offline (Local Storage Mode Active)
                </span>
              )}
            </div>
          </div>
          <button
            onClick={checkServerHealth}
            disabled={loading}
            className="flex items-center gap-1 text-[11px] font-medium text-cyan-400 hover:text-cyan-300 transition"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            Check
          </button>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`mb-5 flex items-center gap-2 rounded-xl p-3 text-xs border ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {message.type === 'success' ? (
              <ShieldCheck className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Content: Logged In vs Auth Forms */}
        {currentUser ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                    {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{currentUser.name}</h4>
                    <p className="text-xs text-slate-400">{currentUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-slate-500">Reg No: </span>
                  <span className="font-mono font-semibold text-cyan-300">{currentUser.register_no || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Dept: </span>
                  <span className="font-semibold text-cyan-300">{currentUser.department || 'CSE'}</span>
                </div>
              </div>
            </div>

            {/* Cloud Sync Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleSaveToCloud}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 hover:opacity-95 transition disabled:opacity-50"
              >
                <Database className="h-4 w-4" />
                Save to PostgreSQL
              </button>

              <button
                onClick={handleLoadFromCloud}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 transition disabled:opacity-50"
              >
                <Cloud className="h-4 w-4 text-cyan-400" />
                Load from Cloud
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Tab switch between Login and Register */}
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 mb-4">
              <button
                onClick={() => setAuthMode('login')}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
                  authMode === 'login'
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In (JWT)
              </button>
              <button
                onClick={() => setAuthMode('register')}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
                  authMode === 'register'
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Student / Institution Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@annauniv.edu"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 hover:opacity-95 transition disabled:opacity-50"
                >
                  <Key className="h-4 w-4" />
                  {loading ? 'Authenticating...' : 'Sign In with JWT'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="SURAJ R"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="suraj@example.com"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Register No
                    </label>
                    <input
                      type="text"
                      value={registerNo}
                      onChange={(e) => setRegisterNo(e.target.value)}
                      placeholder="710023104001"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-2.5 px-3 text-xs text-white placeholder-slate-600 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Department
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-2.5 px-3 text-xs text-white focus:border-cyan-400 focus:outline-none"
                    >
                      <option value="CSE">CSE</option>
                      <option value="IT">IT</option>
                      <option value="ECE">ECE</option>
                      <option value="EEE">EEE</option>
                      <option value="MECH">MECH</option>
                      <option value="AIDS">AI & DS</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Password (min 6 chars)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 hover:opacity-95 transition disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  {loading ? 'Creating Account...' : 'Register Account'}
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
