export function calculateINAPScore(totalQuestions: number, correctCount: number, wrongCount: number) {
  const pointsPerCorrect = 1.0;
  const pointsPerWrong = -0.33;
  
  const netPoints = (correctCount * pointsPerCorrect) + (wrongCount * pointsPerWrong);
  const maxPossible = totalQuestions * pointsPerCorrect;
  
  const officialGrade = Math.max(0.0, (netPoints / maxPossible) * 10.0);
  
  return {
    netPoints,
    maxPossible,
    officialGrade
  };
}
