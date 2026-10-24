import { AcademicRegulationProtocol } from './AcademicRegulationProtocol';

export class AnnaUniversityReg2017 extends AcademicRegulationProtocol {
  getName() {
    return 'Anna University Regulation 2017';
  }

  getGradeDetails() {
    return {
      'O': { points: 10, description: 'Outstanding', range: '91–100', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/30' },
      'A+': { points: 9, description: 'Excellent', range: '81–90', color: 'text-cyan-400 bg-cyan-400/10 border-cyan-500/30' },
      'A': { points: 8, description: 'Very good', range: '71–80', color: 'text-blue-400 bg-blue-400/10 border-blue-500/30' },
      'B+': { points: 7, description: 'Good', range: '66–70', color: 'text-indigo-400 bg-indigo-400/10 border-indigo-500/30' },
      'B': { points: 6, description: 'Above average', range: '61–65', color: 'text-purple-400 bg-purple-400/10 border-purple-500/30' },
      'RA': { points: 0, description: 'Reappearance Required', range: 'below 50', color: 'text-rose-400 bg-rose-400/10 border-rose-500/30' },
      'SA': { points: 0, description: 'Shortage of Attendance', range: 'detained', color: 'text-orange-400 bg-orange-400/10 border-orange-500/30' },
    };
  }

  isArrear(grade) {
    return grade === 'RA' || grade === 'SA';
  }

  getClassification(cgpa, arrearsCount) {
    if (arrearsCount > 0) return { label: 'Reappearance Required', badge: 'bg-rose-500/10 text-rose-300 border-rose-500/30', class: 'arrear' };
    if (cgpa >= 8.5) return { label: 'First Class with Distinction', badge: 'bg-gradient-to-r from-amber-400/20 to-yellow-500/20 text-amber-300 border-amber-400/40 glow-amber', class: 'distinction' };
    if (cgpa >= 7.0) return { label: 'First Class', badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 glow-emerald', class: 'first' };
    if (cgpa >= 6.0) return { label: 'Second Class', badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30', class: 'second' };
    return { label: 'Academic Standing Low', badge: 'bg-slate-800 text-slate-400 border-slate-700', class: 'low' };
  }
}
