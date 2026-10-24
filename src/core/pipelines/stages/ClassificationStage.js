export const ClassificationStage = (context) => {
  const { protocol, results } = context;
  const summaries = Object.values(results.semesterSummaries || {});

  let totalArrears = 0;
  summaries.forEach((summary) => {
    totalArrears += summary.arrears;
  });

  const cgpa = results.cgpa || 0;
  const standing = protocol.getClassification(cgpa, totalArrears);

  context.results.totalArrears = totalArrears;
  context.results.standing = standing;
};
