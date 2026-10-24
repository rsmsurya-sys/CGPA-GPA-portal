const departmentProfiles = {
  CSE: {
    label: 'Computer Science & Engineering',
    codePrefix: 'CS',
  },
  IT: {
    label: 'Information Technology',
    codePrefix: 'IT',
  },
  ECE: {
    label: 'Electronics & Communication Engineering',
    codePrefix: 'EC',
  },
  EEE: {
    label: 'Electrical & Electronics Engineering',
    codePrefix: 'EE',
  },
  MECH: {
    label: 'Mechanical Engineering',
    codePrefix: 'ME',
  },
  CIVIL: {
    label: 'Civil Engineering',
    codePrefix: 'CE',
  },
  AIDS: {
    label: 'Artificial Intelligence & Data Science',
    codePrefix: 'AD',
  },
  AIML: {
    label: 'Artificial Intelligence & Machine Learning',
    codePrefix: 'AM',
  },
  CSBS: {
    label: 'Computer Science & Business Systems',
    codePrefix: 'CB',
  },
  CHEM: {
    label: 'Chemical Engineering',
    codePrefix: 'CH',
  },
  AERO: {
    label: 'Aeronautical Engineering',
    codePrefix: 'AE',
  },
  BIOTECH: {
    label: 'Biotechnology',
    codePrefix: 'BT',
  },
};

const semesterThemes = [
  ['Engg. Foundations', 'Math I', 'Comm. Skills', 'Engg. Physics'],
  ['Prog. Fundamentals', 'DSA', 'Digital Logic', 'Engg. Chemistry'],
  ['DBMS', 'Algorithms', 'CN', 'Signals & Systems'],
  ['OS', 'SE', 'Microprocessors', 'Power Systems'],
  ['ML', 'Compiler Design', 'Embedded Systems', 'Thermodynamics'],
  ['Cloud Computing', 'Distributed Systems', 'VLSI', 'Manufacturing Tech'],
  ['Project Mgmt', 'Adv. AI', 'Industrial Auto', 'Structural Analysis'],
  ['Capstone', 'Research Methods', 'Innovation', 'Internship Prep'],
];

export const departmentOptions = Object.entries(departmentProfiles).map(([value, data]) => ({
  value,
  label: data.label,
}));

export const semesterOptions = Array.from({ length: 8 }, (_, index) => ({
  value: `Semester ${index + 1}`,
  label: `Semester ${index + 1}`,
}));

export function getTemplateRows(department, semester) {
  const profile = departmentProfiles[department] || departmentProfiles.CSE;
  const semNumber = Number((semester || '').match(/\d+/)?.[0] || 1);
  const themes = semesterThemes[Math.min(semNumber - 1, semesterThemes.length - 1)] || semesterThemes[0];

  return themes.map((theme, index) => ({
    code: `${profile.codePrefix}${String(semNumber).padStart(2, '0')}${String(index + 1).padStart(2, '0')}`,
    course: theme,
    credits: [3, 4, 3, 4][index % 4],
    grade: 'B',
  }));
}
