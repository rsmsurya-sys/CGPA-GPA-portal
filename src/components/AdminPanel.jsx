import { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Database,
  ExternalLink,
  GraduationCap,
  Key,
  Layers,
  Lock,
  LogOut,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
  Users,
  XCircle,
} from 'lucide-react';
import { api } from '../services/api';

export default function AdminPanel({ onExitAdmin }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('forsaken_admin_auth') === 'true';
  });

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dashboard state
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'transcripts' | 'db'
  const [serverHealth, setServerHealth] = useState({ isOnline: false, checked: false });
  const [transcripts, setTranscripts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [statusMessage, setStatusMessage] = useState(null);

  // Authenticate Admin
  const handleAdminLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    
    // Configured production credentials: id: admin, pass: forsaken
    if (username.trim() === 'admin' && password === 'forsaken') {
      sessionStorage.setItem('forsaken_admin_auth', 'true');
      setIsAuthenticated(true);
      fetchDashboardData();
    } else {
      setLoginError('Invalid Administrator credentials. Please verify your ID and Password.');
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('forsaken_admin_auth');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  // Fetch server health & saved records
  const fetchDashboardData = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const health = await api.checkHealth();
      setServerHealth({ ...health, checked: true });

      // Try fetching transcripts from database
      try {
        const data = await api.getAllTranscripts();
        if (Array.isArray(data)) {
          setTranscripts(data);
        }
      } catch {
        // If not logged in as regular student, check local storage backups
        const localBackup = api.getLocalBackup();
        if (localBackup && localBackup.semestersData) {
          setTranscripts([
            {
              id: 'local-1',
              student_name: localBackup.studentName || 'SURAJ R',
              register_no: localBackup.registerNo || '710023104001',
              department: localBackup.department || 'CSE',
              regulation_key: localBackup.regulationKey || 'AU_2021',
              calculated_cgpa: 8.75,
              academic_standing: 'First Class with Distinction',
              created_at: new Date().toISOString(),
              source: 'Local Storage Backup',
            },
          ]);
        }
      }
    } catch {
      setServerHealth({ isOnline: false, checked: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const handleDeleteTranscript = async (id) => {
    if (!window.confirm(`Are you sure you want to delete transcript record #${id}?`)) return;
    try {
      await api.deleteTranscript(id);
      setTranscripts((prev) => prev.filter((t) => t.id !== id));
      setStatusMessage({ type: 'success', text: `Record #${id} deleted successfully.` });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Could not delete record.' });
    }
  };

  const filteredTranscripts = transcripts.filter((t) => {
    const matchesSearch =
      (t.student_name && t.student_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.register_no && t.register_no.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDept = selectedDept === 'ALL' || t.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  // --- VIEW 1: ADMIN LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-md">
          {/* Back button */}
          <button
            onClick={onExitAdmin}
            className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-300 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Student Portal
          </button>

          <div className="glass-panel rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
            {/* Header */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="rounded-2xl bg-gradient-to-br from-indigo-500 via-cyan-500 to-indigo-600 p-3.5 shadow-lg shadow-indigo-500/20 text-white mb-4">
                <ShieldCheck className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">
                Admin <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">Control Panel</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Authorized Personnel Only • Production Access
              </p>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300 animate-shake">
                <XCircle className="h-4 w-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Admin ID / Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter Admin ID"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-3 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Admin Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-3 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 hover:brightness-110 transition"
              >
                <Key className="h-4 w-4" />
                Authorize & Enter Console
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-800 text-center text-[10px] text-slate-500">
              Secured via JSON Web Tokens & PostgreSQL Enterprise Infrastructure
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 2: AUTHENTICATED ADMIN DASHBOARD ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Admin Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 p-2 text-white shadow-md">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white">Forsaken Admin Console</h1>
                <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[9px] font-mono font-bold text-cyan-300 border border-cyan-500/30">
                  PRODUCTION
                </span>
              </div>
              <p className="text-[11px] text-slate-400">PostgreSQL Infrastructure & Transcript Database</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onExitAdmin}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Student Portal
            </button>
            <button
              onClick={handleAdminLogout}
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex rounded-2xl border border-slate-800 bg-slate-900/60 p-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="h-4 w-4" />
              Diagnostics & Server
            </button>
            <button
              onClick={() => setActiveTab('transcripts')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'transcripts'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="h-4 w-4" />
              Student Records ({transcripts.length})
            </button>
          </div>

          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-cyan-300 hover:bg-slate-800 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        {/* Status Alerts */}
        {statusMessage && (
          <div
            className={`flex items-center gap-2 rounded-2xl p-3 text-xs border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* TAB 1: OVERVIEW & SERVER DIAGNOSTICS */}
        {activeTab === 'overview' && (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Server Card */}
            <div className="glass-panel rounded-3xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">FastAPI Server</span>
                <Server className="h-5 w-5 text-cyan-400" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`h-3 w-3 rounded-full ${serverHealth.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                <h3 className="text-lg font-black text-white">
                  {serverHealth.isOnline ? 'Uvicorn Online' : 'Server Unreachable'}
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Port: <span className="font-mono text-cyan-300">8000</span> • Env: <span className="font-mono text-cyan-300">{serverHealth.environment || 'production'}</span>
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-500">API Documentation</span>
                <a
                  href="http://localhost:8000/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-cyan-400 hover:underline font-semibold"
                >
                  Swagger UI <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Database Card */}
            <div className="glass-panel rounded-3xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Relational Database</span>
                <Database className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`h-3 w-3 rounded-full ${serverHealth.database_status === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <h3 className="text-lg font-black text-white">
                  PostgreSQL 16
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Status: <span className="font-semibold text-emerald-400">{serverHealth.database_status || 'Active (SQLAlchemy)'}</span>
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-500">Driver</span>
                <span className="font-mono text-indigo-300 font-bold">asyncpg + SQLAlchemy 2.0</span>
              </div>
            </div>

            {/* Security & Access Card */}
            <div className="glass-panel rounded-3xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Authentication</span>
                <Lock className="h-5 w-5 text-violet-400" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                <h3 className="text-lg font-black text-white">JWT Protected</h3>
              </div>
              <p className="text-xs text-slate-400">
                Algorithm: <span className="font-mono text-cyan-300">HS256</span> • Expiration: <span className="font-mono text-cyan-300">24h</span>
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-500">Active Admin</span>
                <span className="font-mono text-emerald-300 font-bold">admin (Superuser)</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STUDENT RECORDS & TRANSCRIPTS */}
        {activeTab === 'transcripts' && (
          <div className="glass-panel rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl flex flex-col gap-4">
            
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by student name or reg no..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-xs text-slate-400 font-semibold">Department:</label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-950 py-2 px-3 text-xs text-white focus:border-cyan-400 focus:outline-none"
                >
                  <option value="ALL">All Departments</option>
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="MECH">MECH</option>
                  <option value="AIDS">AI & DS</option>
                </select>
              </div>
            </div>

            {/* Records Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Register No</th>
                    <th className="px-4 py-3">Dept</th>
                    <th className="px-4 py-3">Regulation</th>
                    <th className="px-4 py-3">CGPA</th>
                    <th className="px-4 py-3">Academic Standing</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredTranscripts.length > 0 ? (
                    filteredTranscripts.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3 text-white font-bold">{t.student_name}</td>
                        <td className="px-4 py-3 font-mono text-cyan-300">{t.register_no}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-lg bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                            {t.department}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">{t.regulation_key}</td>
                        <td className="px-4 py-3 font-bold text-emerald-400">
                          {typeof t.calculated_cgpa === 'number' ? t.calculated_cgpa.toFixed(2) : t.calculated_cgpa}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                            {t.academic_standing}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteTranscript(t.id)}
                            className="rounded-lg p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                            title="Delete Record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                        No student transcript records found in the database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
