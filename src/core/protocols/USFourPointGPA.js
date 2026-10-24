import { AcademicRegulationProtocol } from './AcademicRegulationProtocol';

export class USFourPointGPA extends AcademicRegulationProtocol {
  getName() {
    return 'US Standard 4.0 GPA';
  }

  getGradeDetails() {
    return {
      'A': { points: 4, description: 'Excellent', range: '90–100', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/30' },
      'B': { points: 3, description: 'Good', range: '80–89', color: 'text-blue-400 bg-blue-400/10 border-blue-500/30' },
      'C': { points: 2, description: 'Satisfactory', range: '70–79', color: 'text-indigo-400 bg-indigo-400/10 border-indigo-500/30' },
      'D': { points: 1, description: 'Passing', range: '60–69', color: 'text-amber-400 bg-amber-400/10 border-amber-500/30' },
      'F': { points: 0, description: 'Fail', range: 'below 60', color: 'text-rose-400 bg-rose-400/10 border-rose-500/30' },
    };
  }

  isArrear(grade) {
    return grade === 'F';
  }

  getClassification(cgpa, arrearsCount) {
    if (arrearsCount > 0) return { label: 'Academic Probation (Failures)', badge: 'bg-rose-500/10 text-rose-300 border-rose-500/30', class: 'arrear' };
    if (cgpa >= 3.8) return { label: 'Summa Cum Laude (Distinction)', badge: 'bg-gradient-to-r from-amber-400/20 to-yellow-500/20 text-amber-300 border-amber-400/40 glow-amber', class: 'distinction' };
    if (cgpa >= 3.5) return { label: 'Magna Cum Laude', badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 glow-emerald', class: 'first' };
    if (cgpa >= 3.0) return { label: 'Cum Laude', badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30', class: 'second' };
    if (cgpa >= 2.0) return { label: 'Good Standing', badge: 'bg-blue-500/10 text-blue-300 border-blue-500/30', class: 'pass' };
    return { label: 'Academic Probation', badge: 'bg-slate-800 text-slate-400 border-slate-700', class: 'low' };
  }
}
