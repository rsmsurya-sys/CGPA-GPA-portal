import { CoursePrototype } from './CoursePrototype';

export class SemesterPrototype {
  constructor(semesterName, courses = []) {
    this.semesterName = semesterName;
    this.courses = courses.map((c) => (c instanceof CoursePrototype ? c : new CoursePrototype(c)));
  }

  addCourse(courseData) {
    const course = courseData instanceof CoursePrototype ? courseData : new CoursePrototype(courseData);
    this.courses.push(course);
    return course;
  }

  removeCourse(courseId) {
    this.courses = this.courses.filter((c) => c.id !== courseId);
  }

  updateCourse(courseId, key, value) {
    this.courses = this.courses.map((c) => {
      if (c.id === courseId) {
        const updated = c.clone();
        updated[key] = value;
        return updated;
      }
      return c;
    });
  }

  getTotalCredits() {
    return this.courses.reduce((sum, c) => sum + Number(c.credits || 0), 0);
  }

  getQualityPoints(protocol) {
    return this.courses.reduce((sum, c) => sum + c.getQualityPoints(protocol), 0);
  }

  getGPA(protocol) {
    const credits = this.getTotalCredits();
    return credits ? this.getQualityPoints(protocol) / credits : 0;
  }

  getArrearsCount(protocol) {
    return this.courses.filter((c) => c.isArrear(protocol)).length;
  }

  clone() {
    return new SemesterPrototype(
      this.semesterName,
      this.courses.map((c) => c.clone())
    );
  }

  serialize() {
    return this.courses.map((c) => c.serialize());
  }
}
