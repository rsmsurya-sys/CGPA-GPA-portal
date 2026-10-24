import { useEffect, useMemo, useState } from 'react';
import {
  Award,
  BarChart3,
  BookOpen,
  Building2,
  Calculator,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Download,
  FileCheck,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  HelpCircle,
  Layers,
  Lightbulb,
  Plus,
  Printer,
  RotateCcw,
  Send,
  ShieldAlert,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  UserCheck,
  Lock,
} from 'lucide-react';
import { departmentOptions, getTemplateRows, semesterOptions } from './templates';
import { getProtocol, createStandardPipeline, TranscriptPrototype } from './core';
import AdminPanel from './components/AdminPanel';
import { api } from './services/api';

const initialRows = [
  { id: 1, code: 'CS501', course: 'Advanced Data Structures & Algorithms', credits: 4, grade: 'O' },
  { id: 2, code: 'CS502', course: 'Full Stack Web Architecture', credits: 4, grade: 'A+' },
  { id: 3, code: 'CS503', course: 'Machine Learning & Neural Networks', credits: 3, grade: 'A+' },
  { id: 4, code: 'CS504', course: 'Cloud Computing & DevOps Lab', credits: 2, grade: 'O' },
];

function App() {
  const [headerView, setHeaderView] = useState('overview'); // 'overview' | 'insights' | 'whatif' | 'transcript'
  const [activeTab, setActiveTab] = useState('semester');
  const [department, setDepartment] = useState('CSE');
  const [semester, setSemester] = useState('Semester 1');
  
  // Regulation Protocol state
  const [regulationKey, setRegulationKey] = useState('AU_2021');

  // Student Profile details for official transcript
  const [studentName, setStudentName] = useState('SURAJ R');
  const [registerNo, setRegisterNo] = useState('710023104001');
  const [collegeName, setCollegeName] = useState('Anna University Affiliated Autonomous Campus');
  const [degreeName, setDegreeName] = useState('Bachelor of Engineering (B.E.)');
  const [academicYear, setAcademicYear] = useState('2023 - 2027');
  const [transcriptMode, setTranscriptMode] = useState('current'); // 'current' | 'cumulative'
  
  // Admin Route Detection for /admin and #admin
  const [isAdminView, setIsAdminView] = useState(() => {
    return window.location.pathname === '/admin' || window.location.hash === '#admin';
  });

  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdminView(window.location.pathname === '/admin' || window.location.hash === '#admin');
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateToAdmin = () => {
    window.history.pushState({}, '', '/admin');
    setIsAdminView(true);
  };

  const navigateToStudentPortal = () => {
    window.history.pushState({}, '', '/');
    setIsAdminView(false);
  };

  // Semester Store: Holds course rows per semester with LocalStorage fallback
  const [semestersData, setSemestersData] = useState(() => {
    const backup = api.getLocalBackup();
    if (backup && backup.semestersData) {
      return backup.semestersData;
    }
    const initialStore = {};
    semesterOptions.forEach((sem) => {
      initialStore[sem.value] = getTemplateRows('CSE', sem.value).map((r, i) => ({ ...r, id: Date.now() + i }));
    });
    initialStore['Semester 1'] = initialRows;
    return initialStore;
  });

  // Auto-backup to localStorage whenever state changes
  useEffect(() => {
    api.saveLocalBackup({
      semestersData,
      studentName,
      registerNo,
      collegeName,
      degreeName,
      academicYear,
      department,
      regulationKey,
    });
  }, [semestersData, studentName, registerNo, collegeName, degreeName, academicYear, department, regulationKey]);

  const handleLoadCloudTranscript = (transcript) => {
    if (transcript.student_name) setStudentName(transcript.student_name);
    if (transcript.register_no) setRegisterNo(transcript.register_no);
    if (transcript.college_name) setCollegeName(transcript.college_name);
    if (transcript.degree_name) setDegreeName(transcript.degree_name);
    if (transcript.academic_year) setAcademicYear(transcript.academic_year);
    if (transcript.department) setDepartment(transcript.department);
    if (transcript.regulation_key) setRegulationKey(transcript.regulation_key);
    if (transcript.semesters && Object.keys(transcript.semesters).length > 0) {
      setSemestersData(transcript.semesters);
    }
  };

  // What-If Simulator Inputs
  const [targetGoal, setTargetGoal] = useState(8.5);
  const [futureCreditsInput, setFutureCreditsInput] = useState(24);

  // Active semester rows
  const currentRows = useMemo(() => semestersData[semester] || [], [semestersData, semester]);

  const updateCurrentRow = (id, key, value) => {
    setSemestersData((prev) => ({
      ...prev,
      [semester]: (prev[semester] || []).map((row) => (row.id === id ? { ...row, [key]: value } : row)),
    }));
  };

  const addRowToCurrent = (credits = 3, courseName = 'New Course', codePrefix = 'SUB') => {
    setSemestersData((prev) => {
      const list = prev[semester] || [];
      return {
        ...prev,
        [semester]: [
          ...list,
          {
            id: Date.now() + Math.random(),
            code: `${codePrefix}${list.length + 101}`,
            course: courseName,
            credits,
            grade: regulationKey === 'US_4_0' ? 'B' : 'B',
          },
        ],
      };
    });
  };

  const removeRowFromCurrent = (id) => {
    setSemestersData((prev) => ({
      ...prev,
      [semester]: (prev[semester] || []).filter((r) => r.id !== id),
    }));
  };

  const loadTemplateForSemester = () => {
    const templateRows = getTemplateRows(department, semester).map((row, index) => ({
      id: Date.now() + index,
      ...row,
    }));
    setSemestersData((prev) => ({
      ...prev,
      [semester]: templateRows,
    }));
  };

  // Pipeline Execution
  const pipelineOutput = useMemo(() => {
    const protocol = getProtocol(regulationKey);
    const transcript = new TranscriptPrototype({
      studentName,
      registerNo,
      collegeName,
      degreeName,
      academicYear,
      department,
      semesters: semestersData,
    });
    const pipeline = createStandardPipeline();
    const output = pipeline.execute(transcript, protocol, {
      targetGoal,
      futureCreditsInput,
    });
    return {
      output,
      protocol,
    };
  }, [
    semestersData,
    regulationKey,
    studentName,
    registerNo,
    collegeName,
    degreeName,
    academicYear,
    department,
    targetGoal,
    futureCreditsInput,
  ]);

  const { output: pipelineResult, protocol: activeProtocol } = pipelineOutput;
  const { results, logs: pipelineLogs } = pipelineResult;

  // Overall Cumulative metrics derived from pipeline
  const overallMetrics = useMemo(() => {
    return {
      cgpa: results.cgpa || 0,
      totalCredits: results.totalCredits || 0,
      totalArrears: results.totalArrears || 0,
      standing: results.standing || { label: 'Good Standing', badge: 'bg-slate-800 text-slate-400 border-slate-700', class: 'low' },
    };
  }, [results]);

  // Current active semester metrics derived from pipeline
  const currentMetrics = useMemo(() => {
    const currentSummary = results.semesterSummaries?.[semester] || {
      gpa: 0,
      totalCredits: 0,
      arrears: 0,
    };
    const maxGPA = regulationKey === 'US_4_0' ? 4.0 : 10.0;
    const progress = Math.min((currentSummary.gpa / maxGPA) * 100, 100);
    return {
      gpa: currentSummary.gpa,
      totalCredits: currentSummary.totalCredits,
      arrears: currentSummary.arrears,
      progress,
    };
  }, [results, semester, regulationKey]);

  // Semester summaries mapped to template expectations
  const semesterSummaries = useMemo(() => {
    return semesterOptions.map((sem) => {
      const summary = results.semesterSummaries?.[sem.value] || {
        semester: sem.value,
        courses: [],
        totalCredits: 0,
        gpa: 0,
        arrears: 0,
      };
      return {
        semester: sem.value,
        rows: summary.courses,
        totalCredits: summary.totalCredits,
        gpa: summary.gpa,
        arrears: summary.arrears,
      };
    });
  }, [results]);

  // What-If analysis target outcomes
  const whatIfAnalysis = useMemo(() => {
    return results.whatIf || {
      neededAverageGPA: 0,
      suggestedGrade: 'B',
      isPossible: true,
    };
  }, [results]);

  // Grade Distribution Counts
  const gradeDistribution = useMemo(() => {
    return results.analytics?.gradeCounts || {};
  }, [results]);

  const resetAllData = () => {
    const resetStore = {};
    semesterOptions.forEach((sem) => {
      resetStore[sem.value] = getTemplateRows(department, sem.value).map((r, i) => ({ ...r, id: Date.now() + i }));
    });
    resetStore['Semester 1'] = initialRows;
    setSemestersData(resetStore);
    setSemester('Semester 1');
  };

  const handlePrint = (targetView = 'transcript') => {
    if (headerView !== targetView) {
      setHeaderView(targetView);
    }
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const exportCSV = () => {
    let csv = `Official Academic Transcript Statement\nStudent Name,"${studentName}"\nRegister No,"${registerNo}"\nInstitution,"${collegeName}"\nDegree,"${degreeName}"\nDepartment,"${departmentOptions.find((d) => d.value === department)?.label || department}"\nCumulative CGPA,${overallMetrics.cgpa.toFixed(2)}\n\n`;
    csv += 'Semester,Subject Code,Course Title,Credits,Grade,Points\n';

    semesterSummaries.forEach((s) => {
      s.rows.forEach((r) => {
        csv += `"${s.semester}","${r.code}","${r.course}",${r.credits},"${r.grade}",${activeProtocol.getPoints(r.grade)}\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Official_Transcript_${registerNo || 'Academic'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const StandingIcon = useMemo(() => {
    const className = overallMetrics.standing?.class;
    switch (className) {
      case 'arrear':
        return ShieldAlert;
      case 'distinction':
        return Award;
      case 'first':
        return CheckCircle2;
      case 'second':
        return UserCheck;
      case 'pass':
        return BookOpen;
      default:
        return HelpCircle;
    }
  }, [overallMetrics.standing]);

  // Reusable 3D Printable Academic Sheet Paper Component
  const renderTranscriptPaper = (isPrintContainer = false) => (
    <div className="p-2 sm:p-3 rounded-[2.5rem] bg-gradient-to-r from-cyan-500 via-indigo-600 to-emerald-400 shadow-2xl print:p-0 print:bg-none print:shadow-none">
      <div className={`relative overflow-hidden rounded-[2.2rem] bg-gradient-to-b from-slate-50 via-white to-slate-50 p-6 sm:p-10 text-slate-900 border-2 border-slate-300/80 print-3d-card ${isPrintContainer ? 'w-full print:p-8' : ''}`}>
        {/* 3D Security Microprint Ribbon */}
        <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-2 text-[8px] font-mono font-bold uppercase tracking-widest text-slate-400 select-none print:text-slate-600">
          <span>FORSAKEN ACADEMIC PORTAL • SECURE ENCRYPTED TRANSCRIPT</span>
          <span className="hidden sm:inline">AUTHENTICATED VIA ANNA UNIVERSITY / US GPA PROTOCOLS</span>
          <span>DOCUMENT REF #{registerNo || '710023'}</span>
        </div>

        {/* 3D Diagonal Watermark Overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.035] select-none print:opacity-[0.04]">
          <span className="text-6xl sm:text-8xl font-black uppercase tracking-widest text-slate-900 -rotate-45">
            FORSAKEN OFFICIAL TRANSCRIPT
          </span>
        </div>

        {/* 3D Institutional Letterhead Header Bar */}
        <div className="relative rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 p-6 text-white shadow-xl border-2 border-indigo-500/40 print-header-gradient flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative rounded-2xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-emerald-400 p-4 text-slate-950 shadow-xl shadow-cyan-500/30 ring-4 ring-cyan-400/20">
              <GraduationCap className="h-9 w-9 text-slate-950" />
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 ring-2 ring-slate-950 font-black text-[9px] text-slate-950">★</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                  Official Academic Performance Statement
                </h3>
              </div>
              <p className="text-xs font-black text-cyan-300 uppercase tracking-wider mt-0.5">
                {collegeName}
              </p>
              <p className="text-[11px] font-medium text-slate-300">
                Choice Based Credit System (CBCS) • {regulationKey === 'US_4_0' ? '4.0' : '10.0'} Scale Standard
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right flex flex-col items-start sm:items-end gap-1.5 border-l-2 sm:border-l-0 border-cyan-400/40 pl-3 sm:pl-0">
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-400/40 bg-slate-950/90 px-4 py-1.5 text-xs font-mono font-black text-cyan-300 shadow-inner">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              REG: {registerNo || '710023104001'}
            </span>
            <p className="text-[11px] font-semibold text-slate-400">
              Issued: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Student & Degree Metadata Box with 3D Inset */}
        <div className="my-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 rounded-2xl border-2 border-indigo-100 bg-gradient-to-br from-white via-slate-50 to-indigo-50/50 p-5 text-xs shadow-sm print:bg-slate-50">
          <div>
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Candidate Name:</p>
            <p className="font-extrabold text-slate-950 text-sm mt-0.5">{studentName || 'STUDENT ACADEMIC RECORD'}</p>
          </div>
          <div>
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Register / Roll No:</p>
            <p className="font-black font-mono text-indigo-900 text-sm mt-0.5">{registerNo || '710023104001'}</p>
          </div>
          <div>
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Department / Discipline:</p>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{departmentOptions.find((d) => d.value === department)?.label || department}</p>
          </div>
          <div>
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Degree Program:</p>
            <p className="font-bold text-slate-900 mt-0.5">{degreeName}</p>
          </div>
          <div>
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Academic Batch:</p>
            <p className="font-bold text-slate-900 mt-0.5">{academicYear}</p>
          </div>
          <div>
            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Classification Standing:</p>
            <p className="font-black text-emerald-700 text-sm mt-0.5">{overallMetrics.standing.label}</p>
          </div>
        </div>

        {/* Mode Selection Badge inside Document header (Hidden during print) */}
        {!isPrintContainer && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/80 p-3 shadow-sm no-print">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-950">
              <FileText className="h-4 w-4 text-indigo-600" />
              <span>Transcript Report Format:</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                className={`rounded-xl px-3.5 py-1.5 text-xs font-extrabold transition ${
                  transcriptMode === 'current'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                }`}
                onClick={() => setTranscriptMode('current')}
              >
                Current Term ({semester})
              </button>
              <button
                className={`rounded-xl px-3.5 py-1.5 text-xs font-extrabold transition ${
                  transcriptMode === 'cumulative'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                }`}
                onClick={() => setTranscriptMode('cumulative')}
              >
                Cumulative Full Academic (All Semesters)
              </button>
            </div>
          </div>
        )}

        {/* Transcript Course Tables */}
        {transcriptMode === 'current' ? (
          <div className="overflow-x-auto print-avoid-break">
            <div className="mb-3 flex items-center justify-between border-b-2 border-indigo-600 pb-1.5">
              <h4 className="text-sm font-black uppercase tracking-wider text-slate-950">
                {semester} Course Evaluation Statement
              </h4>
              <span className="text-xs font-bold text-slate-700">
                Term GPA: <strong className="text-indigo-700 font-black text-sm">{currentMetrics.gpa.toFixed(2)}</strong>
              </span>
            </div>
            <table className="w-full text-left text-xs border-collapse print-table">
              <thead>
                <tr className="bg-slate-950 text-white text-[11px] font-black uppercase tracking-wider">
                  <th className="py-3.5 px-4 rounded-tl-xl">Subject Code</th>
                  <th className="py-3.5 px-4">Course Title</th>
                  <th className="py-3.5 px-4 text-center">Credits</th>
                  <th className="py-3.5 px-4 text-center">Grade Obtained</th>
                  <th className="py-3.5 px-4 text-right rounded-tr-xl">Grade Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {currentRows.map((r) => (
                  <tr key={r.id} className="hover:bg-indigo-50/30 transition">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-950">{r.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{r.course}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">{r.credits}</td>
                    <td className="py-3 px-4 text-center font-black text-emerald-700">{r.grade}</td>
                    <td className="py-3 px-4 text-right font-black text-slate-950">{activeProtocol.getPoints(r.grade)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Cumulative Full Academic Record Table across all Semesters */
          <div className="space-y-6">
            {semesterSummaries.map((s) => (
              <div key={s.semester} className="overflow-x-auto print-avoid-break">
                <div className="mb-2 flex items-center justify-between border-b-2 border-slate-950 pb-1">
                  <h4 className="text-xs font-black uppercase tracking-wide text-slate-950">
                    {s.semester} Result Statement
                  </h4>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="font-semibold text-slate-600">Earned Credits: <strong className="text-slate-900">{s.totalCredits}</strong></span>
                    <span className="font-black text-slate-950">GPA: <strong className="text-indigo-700">{s.gpa.toFixed(2)}</strong></span>
                  </div>
                </div>
                <table className="w-full text-left text-xs border-collapse print-table">
                  <thead>
                    <tr className="bg-slate-950 text-white text-[10px] font-black uppercase tracking-wider">
                      <th className="py-2.5 px-3.5 rounded-tl-lg">Code</th>
                      <th className="py-2.5 px-3.5">Course Title</th>
                      <th className="py-2.5 px-3.5 text-center">Credits</th>
                      <th className="py-2.5 px-3.5 text-center">Grade</th>
                      <th className="py-2.5 px-3.5 text-right rounded-tr-lg">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {s.rows.map((r) => (
                      <tr key={r.id} className="hover:bg-indigo-50/30 transition">
                        <td className="py-2.5 px-3.5 font-mono font-bold text-slate-950">{r.code}</td>
                        <td className="py-2.5 px-3.5 font-semibold text-slate-800">{r.course}</td>
                        <td className="py-2.5 px-3.5 text-center font-bold">{r.credits}</td>
                        <td className="py-2.5 px-3.5 text-center font-black text-emerald-700">{r.grade}</td>
                        <td className="py-2.5 px-3.5 text-right font-black text-slate-950">{activeProtocol.getPoints(r.grade)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}

        {/* Official Summary & Verification Box */}
        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-2xl border-2 border-indigo-200 bg-gradient-to-r from-slate-50 via-white to-indigo-50/60 p-5 gap-6 print-avoid-break shadow-sm">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-slate-700">
              Total Earned Credits: <strong className="text-slate-950 font-black text-sm">{overallMetrics.totalCredits} Credits</strong>
            </p>
            <p className="text-xs font-semibold text-slate-700">
              Backlog Arrears Status:{' '}
              <strong className={`font-black ${overallMetrics.totalArrears > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {overallMetrics.totalArrears > 0 ? `${overallMetrics.totalArrears} Pending Reappearance(s)` : '0 Active Arrears (Clear Pass)'}
              </strong>
            </p>
            <p className="text-xs font-semibold text-slate-700">
              Classification Honor: <strong className="text-indigo-950 font-black">{overallMetrics.standing.label}</strong>
            </p>
          </div>

          <div className="text-left sm:text-right rounded-2xl border-2 border-slate-900 bg-slate-950 p-4 text-white shadow-lg">
            <p className="text-[10px] font-black uppercase tracking-widest text-cyan-300">Cumulative Grade Point Average</p>
            <p className="text-3xl font-black text-white mt-1">
              {overallMetrics.cgpa.toFixed(2)} <span className="text-xs font-bold text-slate-400">/ {regulationKey === 'US_4_0' ? '4.0' : '10.0'} CGPA</span>
            </p>
          </div>
        </div>

        {/* Signature & 3D Digital Security Seal Authorization Block */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t-2 border-slate-950 pt-6 print-avoid-break items-end">
          <div>
            <div className="h-10 border-b-2 border-dashed border-slate-400"></div>
            <p className="mt-2 text-[11px] font-black uppercase text-slate-950">Signature of Head of Department</p>
            <p className="text-[10px] font-semibold text-slate-500">Department of {department}</p>
          </div>

          {/* 3D Digital Authenticity Seal Stamp Emblem */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative flex items-center justify-center w-24 h-24 rounded-full border-4 border-double border-indigo-600 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 shadow-lg print-seal-3d">
              <div className="absolute inset-1 rounded-full border border-dashed border-indigo-400"></div>
              <div className="flex flex-col items-center justify-center">
                <Award className="h-6 w-6 text-indigo-700" />
                <span className="text-[7px] font-black uppercase tracking-tighter text-indigo-950 mt-0.5">OFFICIAL SEAL</span>
                <span className="text-[6px] font-mono font-bold text-cyan-800">VERIFIED 10.0</span>
              </div>
            </div>
            <p className="text-[9px] font-mono font-bold text-slate-600 mt-1">SECURE ID: #{registerNo || '710023'}</p>
          </div>

          <div className="text-right sm:text-right">
            <div className="h-10 border-b-2 border-dashed border-slate-400"></div>
            <p className="mt-2 text-[11px] font-black uppercase text-slate-950">Controller of Examinations</p>
            <p className="text-[10px] font-semibold text-slate-500">Official Digital Authenticity Stamp</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Admin Console if URL matches /admin or #admin
  if (isAdminView) {
    return <AdminPanel onExitAdmin={navigateToStudentPortal} />;
  }

  return (
    <div className="relative min-h-screen bg-slate-950 bg-grid-pattern text-slate-100 font-sans selection:bg-indigo-500 selection:text-white overflow-hidden">
      {/* Floating Ambient Glow Orbs */}
      <div className="gradient-orb-1 no-print" />
      <div className="gradient-orb-2 no-print" />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
        
        {/* Header / Brand Bar */}
        <header className="glass-panel card-3d-hover rounded-3xl p-4 sm:p-6 shadow-2xl no-print">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 p-3 shadow-lg shadow-indigo-500/20">
                <GraduationCap className="h-7 w-7 text-white" />
                <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-400 ring-2 ring-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-bold tracking-tight sm:text-2xl text-white">
                    Forsaken <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">Academic Portal</span>
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-300">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    LIVE PIPELINE
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Advanced GPA & CGPA Calculator • Target Predictor • Official Transcript Generator
                </p>
              </div>
            </div>

            {/* Navigation View Switcher Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-800 bg-slate-950/60 p-1.5 backdrop-blur-md">
              <button
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                  headerView === 'overview'
                    ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
                onClick={() => setHeaderView('overview')}
              >
                <Calculator className="h-4 w-4" />
                Overview
              </button>
              <button
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                  headerView === 'insights'
                    ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
                onClick={() => setHeaderView('insights')}
              >
                <BarChart3 className="h-4 w-4" />
                Insights
              </button>
              <button
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                  headerView === 'advisor'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-teal-500/25 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
                onClick={() => setHeaderView('advisor')}
              >
                <Lightbulb className="h-4 w-4 text-amber-300" />
                AI Advisor
              </button>
              <button
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                  headerView === 'whatif'
                    ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-lg shadow-cyan-500/25 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
                onClick={() => setHeaderView('whatif')}
              >
                <Target className="h-4 w-4" />
                What-If Target
              </button>
              <button
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                  headerView === 'transcript'
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
                onClick={() => setHeaderView('transcript')}
              >
                <FileText className="h-4 w-4" />
                Official Report
              </button>
            </div>
          </div>
        </header>

        {/* Top Summary Metrics Strip */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 no-print">
          {/* CGPA Card */}
          <article className="glass-panel card-3d-hover relative overflow-hidden rounded-3xl p-5 shadow-xl transition hover:border-cyan-500/30">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Cumulative CGPA</p>
              <div className="rounded-xl bg-cyan-400/10 p-2 text-cyan-300 border border-cyan-400/20">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-white">
              {overallMetrics.cgpa.toFixed(2)} <span className="text-xs font-normal text-slate-500">/ 10.0</span>
            </p>
            <p className="mt-1 text-xs text-cyan-300/80 flex items-center gap-1 font-medium">
              <TrendingUp className="h-3.5 w-3.5" /> Calculated from all completed terms
            </p>
          </article>

          {/* Current Term GPA */}
          <article className="glass-panel card-3d-hover relative overflow-hidden rounded-3xl p-5 shadow-xl transition hover:border-indigo-500/30">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{semester} GPA</p>
              <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-300 border border-indigo-500/20">
                <BookOpen className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-indigo-300">
              {currentMetrics.gpa.toFixed(2)}
            </p>
            <p className="mt-1 text-xs text-slate-400 font-medium">
              {currentMetrics.totalCredits} Earned Credits in {semester}
            </p>
          </article>

          {/* Academic Standing Badge */}
          <article className="glass-panel card-3d-hover relative overflow-hidden rounded-3xl p-5 shadow-xl transition hover:border-emerald-500/30">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Honors & Standing</p>
              <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-300 border border-emerald-500/20">
                <StandingIcon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${overallMetrics.standing.badge}`}>
                <StandingIcon className="h-3.5 w-3.5" />
                {overallMetrics.standing.label}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-400 font-medium">
              {overallMetrics.totalArrears > 0 ? `⚠️ ${overallMetrics.totalArrears} Backlog Arrear(s)` : 'Zero active arrears'}
            </p>
          </article>

          {/* Target Goal Progress */}
          <article className="glass-panel card-3d-hover relative overflow-hidden rounded-3xl p-5 shadow-xl transition hover:border-violet-500/30">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Goal Progress (10.0)</p>
              <div className="rounded-xl bg-violet-500/10 p-2 text-violet-300 border border-violet-500/20">
                <Target className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4 h-2 w-full rounded-full bg-slate-800/80 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${currentMetrics.progress}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">{currentMetrics.progress.toFixed(0)}% Score</span>
              <span className="text-slate-400">Target: {targetGoal}</span>
            </div>
          </article>
        </section>

        {/* VIEW 1: OVERVIEW & CALCULATOR FORM */}
        {headerView === 'overview' && (
          <>
            <section className="glass-panel rounded-3xl p-4 sm:p-6 shadow-2xl no-print">
              {/* Department, Semester & Regulation Toolbar */}
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-800/80 pb-5">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <span>Regulation:</span>
                    <select
                      className="rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs font-semibold text-indigo-300 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                      value={regulationKey}
                      onChange={(e) => setRegulationKey(e.target.value)}
                    >
                      <option value="AU_2021">Anna University 2021 (10.0)</option>
                      <option value="AU_2017">Anna University 2017 (10.0)</option>
                      <option value="US_4_0">US Standard GPA (4.0)</option>
                    </select>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <span>Department:</span>
                    <select
                      className="rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs font-semibold text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    >
                      {departmentOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <span>Semester:</span>
                    <select
                      className="rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs font-semibold text-cyan-300 outline-none transition focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                    >
                      {semesterOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-110"
                    onClick={loadTemplateForSemester}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Load Curriculum Subjects
                  </button>
                </div>
              </div>

              {/* Course Input Table */}
              <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950/60">
                <div className="grid grid-cols-[0.8fr_1.8fr_0.7fr_1.1fr_0.3fr] border-b border-slate-800/80 bg-slate-900/90 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Subject Code</span>
                  <span>Course Title</span>
                  <span>Credits</span>
                  <span>Grade</span>
                  <span className="text-right">Action</span>
                </div>

                <div className="divide-y divide-slate-800/60">
                  {currentRows.map((row) => (
                    <div key={row.id} className="grid grid-cols-[0.8fr_1.8fr_0.7fr_1.1fr_0.3fr] items-center gap-3 px-4 py-3 transition hover:bg-slate-900/40">
                      <input
                        className="rounded-xl border border-slate-800/80 bg-slate-900/80 px-3 py-2 text-xs font-mono font-semibold text-cyan-300 outline-none focus:border-cyan-400"
                        value={row.code}
                        onChange={(e) => updateCurrentRow(row.id, 'code', e.target.value)}
                        placeholder="CS101"
                      />
                      <input
                        className="rounded-xl border border-slate-800/80 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-100 outline-none focus:border-indigo-400"
                        value={row.course}
                        onChange={(e) => updateCurrentRow(row.id, 'course', e.target.value)}
                        placeholder="Course title"
                      />
                      <input
                        type="number"
                        min="1"
                        max="6"
                        className="rounded-xl border border-slate-800/80 bg-slate-900/80 px-3 py-2 text-xs font-semibold text-violet-300 outline-none focus:border-violet-400"
                        value={row.credits}
                        onChange={(e) => updateCurrentRow(row.id, 'credits', Number(e.target.value))}
                      />
                      <select
                        className={`rounded-xl border px-3 py-2 text-xs font-bold outline-none transition ${(activeProtocol.getGradeDetails()[row.grade] || activeProtocol.getGradeDetails()[Object.keys(activeProtocol.getGradeDetails())[0]])?.color || 'bg-slate-900 text-white'}`}
                        value={row.grade}
                        onChange={(e) => updateCurrentRow(row.id, 'grade', e.target.value)}
                      >
                        {Object.entries(activeProtocol.getGradeDetails()).map(([g, info]) => (
                          <option key={g} value={g} className="bg-slate-900 text-white">
                            {g} - {info.description}
                          </option>
                        ))}
                      </select>
                      <div className="text-right">
                        <button
                          className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-400 transition hover:border-rose-500/50 hover:text-rose-400"
                          onClick={() => removeRowFromCurrent(row.id)}
                          aria-label="Remove subject"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Course Presets & Action Buttons Bar */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400">Quick Add:</span>
                  <button
                    className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 transition hover:bg-indigo-500/20"
                    onClick={() => addRowToCurrent(4, 'Core Theory Subject', 'CORE')}
                  >
                    + 4 Cr Theory
                  </button>
                  <button
                    className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
                    onClick={() => addRowToCurrent(3, 'Professional Elective', 'ELEC')}
                  >
                    + 3 Cr Elective
                  </button>
                  <button
                    className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                    onClick={() => addRowToCurrent(2, 'Laboratory & Practical', 'LAB')}
                  >
                    + 2 Cr Lab
                  </button>
                  <button
                    className="rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-300 transition hover:bg-violet-500/20"
                    onClick={() => addRowToCurrent(1, 'Seminar / Mini Project', 'PROJ')}
                  >
                    + 1 Cr Project
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-400">
                    {semester} GPA: <span className="text-sm font-extrabold text-cyan-300">{currentMetrics.gpa.toFixed(2)}</span>
                  </span>
                </div>
              </div>
            </section>

            {/* Pluggable Grade Reference Table Section */}
            <section className="glass-panel rounded-3xl p-5 shadow-2xl no-print">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Selected Regulation Protocol</p>
                  <h2 className="text-lg font-bold text-white">{activeProtocol.getName()} Scale Reference</h2>
                </div>
                <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
                  {regulationKey === 'US_4_0' ? '4.0 Scale' : '10.0 Scale'}
                </span>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
                <table className="w-full text-left text-xs text-slate-200">
                  <thead className="bg-slate-900/90 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Grade</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Marks Range</th>
                      <th className="px-4 py-3">Grade Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {Object.entries(activeProtocol.getGradeDetails()).map(([g, info]) => (
                      <tr key={g} className="transition hover:bg-slate-900/40">
                        <td className="px-4 py-2.5 font-extrabold text-cyan-400 text-sm">{g}</td>
                        <td className="px-4 py-2.5 font-medium text-slate-300">{info.description}</td>
                        <td className="px-4 py-2.5 text-slate-400">{info.range}</td>
                        <td className="px-4 py-2.5 font-bold text-emerald-400">{info.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* VIEW 2: INSIGHTS & ANALYTICS DASHBOARD */}
        {headerView === 'insights' && (
          <div className="flex flex-col gap-6 no-print">
            <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              {/* Performance Trajectory Graph */}
              <article className="glass-panel rounded-3xl p-5 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Trajectory</p>
                    <h2 className="text-lg font-bold text-white">Semester Progression Graph</h2>
                  </div>
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                    CGPA: {overallMetrics.cgpa.toFixed(2)}
                  </span>
                </div>
                <div className="mt-6 flex flex-col items-center">
                  <svg viewBox="0 0 300 130" className="h-44 w-full overflow-visible">
                    <path d="M15 110 C60 95, 110 70, 160 55 S240 30, 285 20" stroke="url(#trendGlow)" strokeWidth="4" fill="none" strokeLinecap="round" />
                    <path d="M15 110 C60 95, 110 70, 160 55 S240 30, 285 20 L285 130 L15 130 Z" fill="rgba(99, 102, 241, 0.12)" />
                    <defs>
                      <linearGradient id="trendGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <p className="mt-2 text-xs text-slate-400 text-center">
                    Consistent performance across all registered modules
                  </p>
                </div>
              </article>

              {/* Momentum Snapshot */}
              <article className="glass-panel rounded-3xl p-5 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Analytics</p>
                    <h2 className="text-lg font-bold text-white">Momentum Snapshot</h2>
                  </div>
                  <Sparkles className="h-5 w-5 text-indigo-400" />
                </div>
                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Cumulative Score</span>
                    <span className="text-base font-extrabold text-cyan-300">{overallMetrics.cgpa.toFixed(2)} / {regulationKey === 'US_4_0' ? '4.0' : '10.0'}</span>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Active Arrears</span>
                    <span className={`text-base font-extrabold ${overallMetrics.totalArrears > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {overallMetrics.totalArrears}
                    </span>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Recommendation</span>
                    <span className="text-xs font-bold text-indigo-300">
                      {overallMetrics.cgpa >= (regulationKey === 'US_4_0' ? 3.5 : 8.5) ? 'Maintain Distinction Track' : 'Target high grades in Electives'}
                    </span>
                  </div>
                </div>
              </article>
            </section>

            {/* Academic Analysis Pipeline Tracer Panel */}
            <article className="glass-panel rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4 mb-5">
                <div className="rounded-2xl bg-indigo-500/10 p-3 text-indigo-300 border border-indigo-500/20">
                  <Layers className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Academic Analysis Pipeline Tracer</h3>
                  <p className="text-xs text-slate-400">
                    Real-time execution logs of the stage-based calculations processing your transcript data.
                  </p>
                </div>
              </div>

              <div className="relative pl-6 border-l border-slate-800 space-y-6">
                {pipelineLogs.map((log, index) => {
                  const isSuccess = log.status === 'SUCCESS';
                  return (
                    <div key={log.stageName} className="relative group">
                      <div className={`absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 bg-slate-950 transition-all group-hover:scale-125 ${
                        isSuccess 
                          ? 'border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' 
                          : 'border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                      }`} />
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-indigo-400 font-extrabold uppercase tracking-wide">
                            Stage {index + 1}:
                          </span>
                          <h4 className="text-sm font-extrabold text-white">
                            {log.stageName}
                          </h4>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            isSuccess ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {log.status}
                          </span>
                        </div>
                        <span className="font-mono text-xs text-slate-500">
                          ⚡ {log.duration}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400 font-medium">
                        {log.message}
                      </p>

                      {log.stageName === 'Input Validation' && results.validation && (
                        <div className="mt-2 text-[11px] font-mono bg-slate-950/60 rounded-xl border border-slate-800/80 p-3 text-slate-400 space-y-1">
                          <div>Validated courses count: <span className="text-white font-bold">{results.validation.totalValidated}</span></div>
                          <div>Status: <span className={results.validation.isValid ? "text-emerald-400" : "text-rose-400"}>{results.validation.isValid ? "All records valid" : "Validation errors found"}</span></div>
                          {results.validation.errors.length > 0 && (
                            <div className="text-rose-400 mt-1 pl-2 border-l border-rose-500/50">
                              {results.validation.errors.map((err, i) => (
                                <div key={i}>• {err.semester} | {err.courseCode || 'New Course'}: {err.reason}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {log.stageName === 'GPA Engine' && results.semesterSummaries && (
                        <div className="mt-2 text-[11px] font-mono bg-slate-950/60 rounded-xl border border-slate-800/80 p-3 text-slate-400 grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {Object.entries(results.semesterSummaries).map(([sem, sum]) => (
                            <div key={sem} className="p-1 border border-slate-800/50 rounded-lg">
                              <div className="text-[10px] text-slate-500">{sem}</div>
                              <div className="font-bold text-white">{sum.gpa.toFixed(2)} GPA</div>
                              <div className="text-[9px] text-slate-500">{sum.totalCredits} Credits</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {log.stageName === 'CGPA Calculator' && (
                        <div className="mt-2 text-[11px] font-mono bg-slate-950/60 rounded-xl border border-slate-800/80 p-3 text-slate-400 space-y-1">
                          <div>Cumulative CGPA: <span className="text-cyan-300 font-extrabold">{results.cgpa?.toFixed(2)}</span></div>
                          <div>Total Earned Credits: <span className="text-white font-bold">{results.totalCredits} Cr</span></div>
                          <div>Weighted Quality Points: <span className="text-white font-bold">{results.totalQualityPoints}</span></div>
                        </div>
                      )}

                      {log.stageName === 'Academic Classifier' && results.standing && (
                        <div className="mt-2 text-[11px] font-mono bg-slate-950/60 rounded-xl border border-slate-800/80 p-3 text-slate-400 space-y-1">
                          <div>Classification: <span className="text-emerald-400 font-extrabold">{results.standing.label}</span></div>
                          <div>Active arrears: <span className={`font-bold ${results.totalArrears > 0 ? "text-rose-400" : "text-emerald-400"}`}>{results.totalArrears} backlogs</span></div>
                        </div>
                      )}

                      {log.stageName === 'What-If Target Projector' && results.whatIf && (
                        <div className="mt-2 text-[11px] font-mono bg-slate-950/60 rounded-xl border border-slate-800/80 p-3 text-slate-400 space-y-1">
                          <div>Target Goal: <span className="text-cyan-300 font-bold">{results.whatIf.targetGoal.toFixed(2)}</span></div>
                          <div>Required future GPA: <span className={`font-bold ${results.whatIf.isPossible ? "text-emerald-400" : "text-rose-400"}`}>{results.whatIf.neededAverageGPA.toFixed(2)}</span></div>
                          <div>Suggested grade: <span className="text-emerald-400 font-extrabold">{results.whatIf.suggestedGrade}</span></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </article>

            {/* Current Semester Grade Distribution */}
            <section className="glass-panel rounded-3xl p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Distribution</p>
                  <h2 className="text-lg font-bold text-white">{semester} Grade Counts</h2>
                </div>
                <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-300">
                  {currentRows.length} Registered Courses
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {Object.entries(gradeDistribution).map(([g, count]) => (
                  <div key={g} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 transition hover:border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-extrabold text-cyan-300">{g}</span>
                      <span className="text-xs text-slate-500">{activeProtocol.getGradeDetails()[g]?.description || 'Unknown'}</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-white">
                      {count} <span className="text-xs font-normal text-slate-400">subject(s)</span>
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* VIEW 5: AI ACADEMIC ADVISOR & GPA SUGGESTIONS DASHBOARD */}
        {headerView === 'advisor' && (
          <div className="flex flex-col gap-6 no-print">
            {/* Advisor Hero Banner */}
            <section className="glass-panel relative overflow-hidden rounded-3xl p-6 shadow-2xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800/80 pb-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 text-white shadow-xl shadow-purple-500/20">
                    <Lightbulb className="h-8 w-8 text-amber-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-xl font-extrabold text-white">Smart Performance Advisor</h2>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-0.5 text-xs font-extrabold ${results.advisor?.badgeColor || 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'}`}>
                        <Sparkles className="h-3.5 w-3.5" />
                        {results.advisor?.tierHeadline || 'Academic Standing'}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-300 max-w-2xl font-medium leading-relaxed">
                      {results.advisor?.summaryMessage}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-center rounded-2xl border border-slate-800 bg-slate-950/80 p-4 min-w-[180px]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current Standing</span>
                  <span className="text-3xl font-black text-cyan-300 mt-0.5">
                    {overallMetrics.cgpa.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold mt-0.5">
                    {results.totalArrears > 0 ? `⚠️ ${results.totalArrears} Backlog Arrears` : 'Zero Active Arrears'}
                  </span>
                </div>
              </div>

              {/* Actionable Suggestions Cards Grid */}
              <div className="mt-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-400" /> Actionable Performance Recommendations
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {results.advisor?.actionableTips.map((tip, index) => (
                    <div key={index} className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 transition hover:border-slate-700 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                            {tip.category}
                          </span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            tip.priority === 'URGENT' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                            tip.priority === 'HIGH' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' :
                            'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}>
                            {tip.priority}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1.5">{tip.title}</h4>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed">{tip.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Course Impact & Grade Boost Analyzer Table */}
            <section className="glass-panel rounded-3xl p-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-4 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">Course Quality Point & Grade Boost Impact</h3>
                    <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-[10px] font-extrabold text-cyan-300">
                      Strategic Optimizer
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Subjects carrying the highest CGPA improvement potential if re-evaluated or improved to Grade {regulationKey === 'US_4_0' ? 'A' : 'O'}.
                  </p>
                </div>
              </div>

              <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
                <table className="w-full text-left text-xs text-slate-200 border-collapse">
                  <thead className="bg-slate-900/90 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Semester</th>
                      <th className="py-3 px-4">Code & Course Title</th>
                      <th className="py-3 px-4 text-center">Credits</th>
                      <th className="py-3 px-4 text-center">Current Grade</th>
                      <th className="py-3 px-4 text-center">Target Grade</th>
                      <th className="py-3 px-4 text-right">Potential CGPA Boost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {results.advisor?.courseImpactList.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40 transition">
                        <td className="py-3 px-4 font-mono font-semibold text-slate-400">{item.semester}</td>
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-cyan-300">{item.code}</div>
                          <div className="text-xs font-medium text-slate-300">{item.course}</div>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-violet-300">{item.credits} Cr</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold ${item.isArrear ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-200'}`}>
                            {item.currentGrade} ({item.currentPoints} pts)
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-emerald-400">
                          Grade {item.targetGrade} ({item.targetPoints} pts)
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-extrabold text-emerald-300 glow-emerald">
                            + {item.cgpaBoost.toFixed(2)} CGPA
                          </span>
                        </td>
                      </tr>
                    ))}
                    {(!results.advisor?.courseImpactList || results.advisor.courseImpactList.length === 0) && (
                      <tr>
                        <td colSpan="6" className="py-6 text-center text-xs text-slate-400 font-medium">
                          🎉 All courses are at maximum grade! Outstanding academic performance.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* VIEW 3: "WHAT-IF" TARGET SIMULATOR */}
        {headerView === 'whatif' && (
          <section className="glass-panel rounded-3xl p-6 shadow-2xl no-print">
            <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
              <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300 border border-cyan-400/20">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">"What-If" Target CGPA Predictor</h2>
                <p className="text-xs text-slate-400">
                  Calculate the exact average grade required in your upcoming semesters to reach your target CGPA goal.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
                <label className="flex flex-col gap-2 text-xs font-semibold text-slate-300">
                  <span>Target Desired CGPA (0.0 to 10.0):</span>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="5.0"
                      max="10.0"
                      step="0.05"
                      className="w-full accent-cyan-400"
                      value={targetGoal}
                      onChange={(e) => setTargetGoal(Number(e.target.value))}
                    />
                    <span className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 text-base font-extrabold text-cyan-300">
                      {targetGoal.toFixed(2)}
                    </span>
                  </div>
                </label>

                <label className="flex flex-col gap-2 text-xs font-semibold text-slate-300">
                  <span>Remaining Credits to Complete:</span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm font-bold text-indigo-300 outline-none focus:border-indigo-400"
                    value={futureCreditsInput}
                    onChange={(e) => setFutureCreditsInput(Number(e.target.value))}
                  />
                </label>

                <div className="mt-2 rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-xs text-slate-400 space-y-1">
                  <p>Current Earned Credits: <strong className="text-white">{overallMetrics.totalCredits} Cr</strong></p>
                  <p>Current CGPA: <strong className="text-cyan-300">{overallMetrics.cgpa.toFixed(2)}</strong></p>
                </div>
              </div>

              {/* What-If Result Card */}
              <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/40 p-5 glow-indigo">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Required Target Average</p>
                  <div className="mt-3">
                    {whatIfAnalysis.isPossible ? (
                      <p className="text-4xl font-extrabold text-cyan-300">
                        {whatIfAnalysis.neededAverageGPA.toFixed(2)}{' '}
                        <span className="text-xs font-normal text-slate-400">GPA required</span>
                      </p>
                    ) : (
                      <p className="text-2xl font-bold text-rose-400">Target Unreachable (&gt; {regulationKey === 'US_4_0' ? '4.0' : '10.0'})</p>
                    )}
                  </div>

                  <div className="mt-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4">
                    <p className="text-xs font-semibold text-slate-300">Recommended Minimum Average Grade:</p>
                    <p className="mt-1 text-2xl font-extrabold text-emerald-400">
                      Grade {whatIfAnalysis.suggestedGrade} ({activeProtocol.getGradeDetails()[whatIfAnalysis.suggestedGrade]?.description || 'Unknown'})
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Maintain an average of Grade {whatIfAnalysis.suggestedGrade} ({activeProtocol.getGradeDetails()[whatIfAnalysis.suggestedGrade]?.description || 'Unknown'}) across your remaining {futureCreditsInput} credits.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-400">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Calculated automatically based on your {regulationKey === 'US_4_0' ? '4.0' : '10.0'} scale transcript.
                </div>
              </div>
            </div>
          </section>
        )}

        {/* VIEW 4: OFFICIAL PRINTABLE TRANSCRIPT REPORT */}
        {headerView === 'transcript' && (
          <section className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl no-print">
            {/* Printable Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">Official Transcript Generator</h2>
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-400">
                    PDF Export Ready
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Customize student credentials, toggle term modes, and export to official PDF document.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-slate-800 hover:border-slate-600"
                  onClick={exportCSV}
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                  Export Data (CSV)
                </button>
                <button
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-violet-600 to-cyan-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110"
                  onClick={() => handlePrint('transcript')}
                >
                  <Printer className="h-4 w-4" />
                  Export / Print PDF
                </button>
              </div>
            </div>

            {/* Editable Student Details Inputs Grid */}
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-400">
                <span>Student Full Name:</span>
                <input
                  className="rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs font-bold text-white outline-none focus:border-cyan-400"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Student Name"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-400">
                <span>Register / Roll Number:</span>
                <input
                  className="rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs font-mono font-bold text-cyan-300 outline-none focus:border-cyan-400"
                  value={registerNo}
                  onChange={(e) => setRegisterNo(e.target.value)}
                  placeholder="Registration Number"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-400">
                <span>Institution / Campus Name:</span>
                <input
                  className="rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs font-semibold text-white outline-none focus:border-indigo-400"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="Institution Name"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-400">
                <span>Degree & Program:</span>
                <input
                  className="rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs font-semibold text-white outline-none focus:border-indigo-400"
                  value={degreeName}
                  onChange={(e) => setDegreeName(e.target.value)}
                  placeholder="Degree Name"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-400">
                <span>Academic Batch / Years:</span>
                <input
                  className="rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs font-semibold text-white outline-none focus:border-indigo-400"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="e.g. 2023 - 2027"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-400">
                <span>Transcript Type Mode:</span>
                <select
                  className="rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs font-bold text-cyan-300 outline-none focus:border-cyan-400"
                  value={transcriptMode}
                  onChange={(e) => setTranscriptMode(e.target.value)}
                >
                  <option value="current">Active Term ({semester})</option>
                  <option value="cumulative">Full Academic Record (All Semesters)</option>
                </select>
              </label>
            </div>

            {/* Interactive Paper Preview */}
            <div className="mt-8">
              {renderTranscriptPaper(false)}
            </div>
          </section>
        )}

        {/* Global Footer */}
        <footer className="flex flex-col gap-3 rounded-3xl glass-panel p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between no-print">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="rounded-full bg-slate-800 px-3 py-1">Auto-save on change</span>
            <span className="rounded-full bg-slate-800 px-3 py-1">{regulationKey === 'US_4_0' ? '4.0' : '10.0'} Scale Regulation</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950/60 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-rose-500/50 hover:text-rose-400"
              onClick={resetAllData}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Data
            </button>
            <button
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-110"
              onClick={() => handlePrint('transcript')}
            >
              <Download className="h-3.5 w-3.5" />
              Export Transcript PDF
            </button>
            <button
              onClick={navigateToAdmin}
              className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950/60 px-3 py-2 text-[11px] font-semibold text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 transition"
              title="Admin Console (/admin)"
            >
              <Lock className="h-3 w-3" />
              Admin
            </button>
          </div>
        </footer>

      </div>

      {/* Dedicated Print Canvas Container (Hidden on Screen, Rendered during Browser Print/PDF Export) */}
      <div className="hidden print:block print-page-wrapper">
        {renderTranscriptPaper(true)}
      </div>
    </div>
  );
}

export default App;
