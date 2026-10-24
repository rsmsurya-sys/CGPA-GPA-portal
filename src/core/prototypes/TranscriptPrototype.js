import { SemesterPrototype } from './SemesterPrototype';

export class TranscriptPrototype {
  constructor(data = {}) {
    this.studentName = data.studentName || '';
    this.registerNo = data.registerNo || '';
    this.collegeName = data.collegeName || '';
    this.degreeName = data.degreeName || '';
    this.academicYear = data.academicYear || '';
    this.department = data.department || 'CSE';

    this.semesters = {};
    if (data.semesters) {
      Object.entries(data.semesters).forEach(([semName, courses]) => {
        this.semesters[semName] = new SemesterPrototype(semName, courses);
      });
    }
  }

  getSemester(semName) {
    if (!this.semesters[semName]) {
      this.semesters[semName] = new SemesterPrototype(semName);
    }
    return this.semesters[semName];
  }

  setSemesterCourses(semName, courses) {
    this.semesters[semName] = new SemesterPrototype(semName, courses);
  }

  clone() {
    const semestersClone = {};
    Object.entries(this.semesters).forEach(([semName, semProto]) => {
      semestersClone[semName] = semProto.serialize();
    });

    return new TranscriptPrototype({
      studentName: this.studentName,
      registerNo: this.registerNo,
      collegeName: this.collegeName,
      degreeName: this.degreeName,
      academicYear: this.academicYear,
      department: this.department,
      semesters: semestersClone,
    });
  }

  serialize() {
    const semestersData = {};
    Object.entries(this.semesters).forEach(([semName, semProto]) => {
      semestersData[semName] = semProto.serialize();
    });

    return {
      studentName: this.studentName,
      registerNo: this.registerNo,
      collegeName: this.collegeName,
      degreeName: this.degreeName,
      academicYear: this.academicYear,
      department: this.department,
      semesters: semestersData,
    };
  }
}
