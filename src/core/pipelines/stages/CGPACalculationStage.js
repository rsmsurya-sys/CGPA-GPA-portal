export const CGPACalculationStage = (context) => {
  const { results } = context;
  const summaries = Object.values(results.semesterSummaries || {});

  let totalQualityPoints = 0;
  let totalCredits = 0;

  summaries.forEach((summary) => {
    totalQualityPoints += summary.qualityPoints;
    totalCredits += summary.totalCredits;
  });

  const cgpa = totalCredits ? totalQualityPoints / totalCredits : 0;

  context.results.cgpa = cgpa;
  context.results.totalCredits = totalCredits;
  context.results.totalQualityPoints = totalQualityPoints;
};
