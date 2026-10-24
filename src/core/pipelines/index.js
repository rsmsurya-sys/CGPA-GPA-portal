import { AnalysisPipeline } from './AnalysisPipeline';
import { ValidationStage } from './stages/ValidationStage';
import { GPACalculationStage } from './stages/GPACalculationStage';
import { CGPACalculationStage } from './stages/CGPACalculationStage';
import { ClassificationStage } from './stages/ClassificationStage';
import { WhatIfPredictionStage } from './stages/WhatIfPredictionStage';
import { AnalyticsStage } from './stages/AnalyticsStage';
import { AdvisorStage } from './stages/AdvisorStage';

export { AnalysisPipeline } from './AnalysisPipeline';

export const createStandardPipeline = () => {
  return new AnalysisPipeline()
    .addStage('Input Validation', ValidationStage)
    .addStage('GPA Engine', GPACalculationStage)
    .addStage('CGPA Calculator', CGPACalculationStage)
    .addStage('Academic Classifier', ClassificationStage)
    .addStage('What-If Target Projector', WhatIfPredictionStage)
    .addStage('Analytics Aggregator', AnalyticsStage)
    .addStage('Academic Advisor Engine', AdvisorStage);
};
