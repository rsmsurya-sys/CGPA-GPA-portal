export const WhatIfPredictionStage = (context) => {
  const { results, inputs, protocol } = context;
  const targetGoal = inputs.targetGoal || 8.5;
  const futureCreditsInput = inputs.futureCreditsInput || 24;

  const currentCredits = results.totalCredits || 0;
  const currentQualityPoints = results.totalQualityPoints || 0;

  const targetTotalCredits = currentCredits + Number(futureCreditsInput || 1);
  const requiredTotalPoints = Number(targetGoal) * targetTotalCredits;
  const neededFuturePoints = requiredTotalPoints - currentQualityPoints;
  const neededAverageGPA = futureCreditsInput ? neededFuturePoints / Number(futureCreditsInput) : 0;

  // Find a suggested grade from protocol details that is closest/sufficient for this needed GPA
  const gradeDetails = protocol.getGradeDetails();
  const sortedGrades = Object.entries(gradeDetails)
    .map(([grade, info]) => ({ grade, points: info.points, description: info.description }))
    .sort((a, b) => a.points - b.points);

  let suggestedGrade = sortedGrades[sortedGrades.length - 1]?.grade || 'O';
  for (let i = 0; i < sortedGrades.length; i++) {
    if (sortedGrades[i].points >= neededAverageGPA) {
      suggestedGrade = sortedGrades[i].grade;
      break;
    }
  }

  const maxPoints = sortedGrades[sortedGrades.length - 1]?.points || 10;
  const isPossible = neededAverageGPA <= maxPoints && neededAverageGPA >= 0;

  context.results.whatIf = {
    targetGoal,
    futureCreditsInput,
    neededAverageGPA,
    suggestedGrade,
    isPossible,
  };
};
