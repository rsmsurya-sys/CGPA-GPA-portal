export class AcademicRegulationProtocol {
  getName() {
    throw new Error("Method 'getName()' must be implemented.");
  }

  getGradeDetails() {
    throw new Error("Method 'getGradeDetails()' must be implemented.");
  }

  validateGrade(grade) {
    return Object.prototype.hasOwnProperty.call(this.getGradeDetails(), grade);
  }

  getPoints(grade) {
    const details = this.getGradeDetails();
    return details[grade] ? details[grade].points : 0;
  }

  isArrear(grade) {
    throw new Error("Method 'isArrear()' must be implemented.");
  }

  getClassification(cgpa, arrearsCount) {
    throw new Error("Method 'getClassification()' must be implemented.");
  }
}
