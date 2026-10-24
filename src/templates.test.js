import { describe, expect, it } from 'vitest';
import { departmentOptions, getTemplateRows, semesterOptions } from './templates';

describe('department semester templates', () => {
  it('loads built-in subjects and codes for a selected department and semester', () => {
    const rows = getTemplateRows('CSE', 'Semester 5');

    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0]).toMatchObject({
      code: 'CS0501',
      credits: 3,
      grade: 'B',
    });
    expect(rows[0].course).toBeDefined();
  });

  it('exposes all department and semester choices', () => {
    expect(departmentOptions.length).toBeGreaterThan(5);
    expect(semesterOptions).toHaveLength(8);
  });
});
