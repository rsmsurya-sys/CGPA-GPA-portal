import { describe, expect, it } from 'vitest';
import { getProtocol } from './protocols';
import { CoursePrototype, TranscriptPrototype } from './prototypes';
import { createStandardPipeline } from './pipelines';

describe('Academic Core Framework', () => {
  describe('Protocols', () => {
    it('should validate and score grades correctly under AU 2021', () => {
      const p = getProtocol('AU_2021');
      expect(p.getName()).toContain('2021');
      expect(p.validateGrade('O')).toBe(true);
      expect(p.validateGrade('INVALID')).toBe(false);
      expect(p.getPoints('O')).toBe(10);
      expect(p.getPoints('U')).toBe(0);
      expect(p.isArrear('U')).toBe(true);
      expect(p.isArrear('O')).toBe(false);
    });

    it('should validate and score grades correctly under US 4.0 GPA', () => {
      const p = getProtocol('US_4_0');
      expect(p.getName()).toContain('4.0');
      expect(p.validateGrade('A')).toBe(true);
      expect(p.validateGrade('U')).toBe(false);
      expect(p.getPoints('A')).toBe(4);
      expect(p.isArrear('F')).toBe(true);
    });
  });

  describe('Prototypes & Domain Models', () => {
    it('should compute Course quality points', () => {
      const p = getProtocol('AU_2021');
      const c = new CoursePrototype({ code: 'CS101', course: 'Test', credits: 4, grade: 'A+' });
      expect(c.getQualityPoints(p)).toBe(36);
    });

    it('should compute Semester credit totals and GPA', () => {
      const p = getProtocol('AU_2021');
      const t = new TranscriptPrototype({
        studentName: 'Test Student',
        semesters: {
          'Semester 1': [
            { code: 'C1', credits: 3, grade: 'O' },
            { code: 'C2', credits: 4, grade: 'A+' },
          ]
        }
      });
      const sem = t.getSemester('Semester 1');
      expect(sem.getTotalCredits()).toBe(7);
      expect(sem.getGPA(p)).toBeCloseTo(9.43, 2);
    });
  });

  describe('Calculation Pipeline', () => {
    it('should execute all stages successfully and analyze transcript', () => {
      const p = getProtocol('AU_2021');
      const transcript = new TranscriptPrototype({
        studentName: 'Suraj',
        semesters: {
          'Semester 1': [
            { code: 'CS101', credits: 4, grade: 'O' }, // 40 pts
            { code: 'CS102', credits: 3, grade: 'A' }, // 24 pts
          ],
          'Semester 2': [
            { code: 'CS201', credits: 4, grade: 'B' }, // 24 pts
            { code: 'CS202', credits: 2, grade: 'U' }, // 0 pts
          ]
        }
      });

      const pipeline = createStandardPipeline();
      const output = pipeline.execute(transcript, p, { targetGoal: 8.0, futureCreditsInput: 20 });

      expect(output.logs.length).toBe(7);
      expect(output.results.validation.isValid).toBe(true);
      expect(output.results.totalCredits).toBe(13);
      expect(output.results.cgpa).toBeCloseTo(88 / 13, 2); // 88 points / 13 credits = 6.77
      expect(output.results.totalArrears).toBe(1);
      expect(output.results.standing.label).toBe('Reappearance Required');
      expect(output.results.whatIf.isPossible).toBe(true);

      // Verify Advisor Stage
      expect(output.results.advisor).toBeDefined();
      expect(output.results.advisor.tierKey).toBe('ARREAR_RISK');
      expect(output.results.advisor.actionableTips.length).toBeGreaterThan(0);
      expect(output.results.advisor.courseImpactList.length).toBeGreaterThan(0);
    });
  });
});
