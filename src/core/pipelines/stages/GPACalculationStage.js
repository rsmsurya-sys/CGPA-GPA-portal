export const GPACalculationStage = (context) => {
  const { transcript, protocol } = context;
  const semesterSummaries = {};

  Object.entries(transcript.semesters).forEach(([semName, semProto]) => {
    const totalCredits = semProto.getTotalCredits();
    const qualityPoints = semProto.getQualityPoints(protocol);
    const gpa = semProto.getGPA(protocol);
    const arrears = semProto.getArrearsCount(protocol);

    semesterSummaries[semName] = {
      semester: semName,
      totalCredits,
      qualityPoints,
      gpa,
      arrears,
      courses: semProto.courses,
    };
  });

  context.results.semesterSummaries = semesterSummaries;
};
