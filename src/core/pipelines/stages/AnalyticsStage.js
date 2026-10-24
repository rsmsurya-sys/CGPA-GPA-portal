export const AnalyticsStage = (context) => {
  const { transcript, protocol } = context;
  const gradeCounts = {};

  const gradeDetails = protocol.getGradeDetails();
  Object.keys(gradeDetails).forEach((g) => {
    gradeCounts[g] = 0;
  });

  // Calculate overall grade counts across all semesters
  Object.values(transcript.semesters).forEach((semProto) => {
    semProto.courses.forEach((course) => {
      if (gradeCounts[course.grade] !== undefined) {
        gradeCounts[course.grade]++;
      }
    });
  });

  context.results.analytics = {
    gradeCounts,
  };
};
