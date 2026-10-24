export class CoursePrototype {
  constructor(data = {}) {
    this.id = data.id || Date.now() + Math.random();
    this.code = data.code || '';
    this.course = data.course || '';
    this.credits = Number(data.credits !== undefined ? data.credits : 3);
    this.grade = data.grade || 'B';
  }

  getQualityPoints(protocol) {
    return this.credits * protocol.getPoints(this.grade);
  }

  isArrear(protocol) {
    return protocol.isArrear(this.grade);
  }

  clone() {
    return new CoursePrototype({
      id: this.id,
      code: this.code,
      course: this.course,
      credits: this.credits,
      grade: this.grade,
    });
  }

  serialize() {
    return {
      id: this.id,
      code: this.code,
      course: this.course,
      credits: this.credits,
      grade: this.grade,
    };
  }
}
