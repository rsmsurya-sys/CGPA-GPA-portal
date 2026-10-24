export const ValidationStage = (context) => {
  const { transcript, protocol } = context;
  const invalidCourses = [];
  let totalCoursesValidated = 0;

  Object.entries(transcript.semesters).forEach(([semName, semProto]) => {
    semProto.courses.forEach((course) => {
      totalCoursesValidated++;
      if (!course.code || course.code.trim() === '') {
        invalidCourses.push({ semester: semName, courseId: course.id, courseCode: course.code, reason: 'Empty subject code' });
      }
      if (course.credits <= 0 || isNaN(course.credits)) {
        invalidCourses.push({ semester: semName, courseId: course.id, courseCode: course.code, reason: 'Invalid credit value' });
      }
      if (!protocol.validateGrade(course.grade)) {
        invalidCourses.push({
          semester: semName,
          courseId: course.id,
          courseCode: course.code,
          reason: `Invalid grade '${course.grade}' for ${protocol.getName()}`,
        });
      }
    });
  });

  context.results.validation = {
    isValid: invalidCourses.length === 0,
    totalValidated: totalCoursesValidated,
    errors: invalidCourses,
  };
};
