export const AdvisorStage = (context) => {
  const { transcript, protocol, results } = context;

  const cgpa = results.cgpa || 0;
  const arrears = results.totalArrears || 0;
  const totalCredits = results.totalCredits || 1;
  const isUSScale = protocol.getName().includes('4.0');

  // 1. Determine Performance Tier
  let tierKey = 'DISTINCTION';
  let tierHeadline = 'Outstanding Academic Standing';
  let badgeColor = 'bg-amber-400/10 text-amber-300 border-amber-400/30';
  let summaryMessage = 'You are performing exceptionally well! You are on track for First Class with Distinction.';

  if (arrears > 0) {
    tierKey = 'ARREAR_RISK';
    tierHeadline = 'Reappearance Backlog Warning';
    badgeColor = 'bg-rose-500/10 text-rose-300 border-rose-500/30';
    summaryMessage = `You have ${arrears} active backlog arrear(s). Prioritize clearing arrears to maintain placement eligibility and academic standing.`;
  } else if (isUSScale) {
    if (cgpa >= 3.8) {
      tierKey = 'DISTINCTION';
      tierHeadline = 'Summa Cum Laude Track';
      badgeColor = 'bg-amber-400/10 text-amber-300 border-amber-400/30';
      summaryMessage = 'Exceptional 4.0 scale standing! You qualify for highest honors.';
    } else if (cgpa >= 3.5) {
      tierKey = 'FIRST_CLASS';
      tierHeadline = 'Magna Cum Laude Track';
      badgeColor = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      summaryMessage = 'Great GPA! You are close to the Summa Cum Laude (3.8+) honor threshold.';
    } else if (cgpa >= 3.0) {
      tierKey = 'SECOND_CLASS';
      tierHeadline = 'Cum Laude Standing';
      badgeColor = 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
      summaryMessage = 'Consistent performance. Aim for A grades in 4-credit courses to push your GPA above 3.5.';
    } else {
      tierKey = 'IMPROVEMENT_NEEDED';
      tierHeadline = 'Academic Recovery Track';
      badgeColor = 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
      summaryMessage = 'Target key foundation subjects to boost your score above the 3.0 threshold.';
    }
  } else {
    if (cgpa >= 8.5) {
      tierKey = 'DISTINCTION';
      tierHeadline = 'First Class with Distinction';
      badgeColor = 'bg-amber-400/10 text-amber-300 border-amber-400/30';
      summaryMessage = 'Outstanding 10.0 scale performance! You maintain First Class with Distinction standing.';
    } else if (cgpa >= 7.5) {
      tierKey = 'FIRST_CLASS';
      tierHeadline = 'First Class Honors Track';
      badgeColor = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      summaryMessage = `Strong performance! You are only ${(8.5 - cgpa).toFixed(2)} CGPA points away from First Class with Distinction.`;
    } else if (cgpa >= 6.0) {
      tierKey = 'SECOND_CLASS';
      tierHeadline = 'Second Class Standing';
      badgeColor = 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
      summaryMessage = `You are ${(7.5 - cgpa).toFixed(2)} CGPA points away from the 7.5 First Class cutoff required by top placement recruiters.`;
    } else {
      tierKey = 'IMPROVEMENT_NEEDED';
      tierHeadline = 'Pass Standing & GPA Push';
      badgeColor = 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
      summaryMessage = 'Focus on high-credit core theory and laboratory modules to lift your overall CGPA above 6.0.';
    }
  }

  // 2. Generate Actionable Tips & Suggestions
  const actionableTips = [];

  if (tierKey === 'DISTINCTION') {
    actionableTips.push({
      category: 'Placement & Career',
      title: 'Target Top Tier 1 Companies & Research',
      priority: 'HIGH',
      icon: 'Award',
      description: 'Your GPA qualifies you for Tier 1 campus drives (FAANG / Product Firms). Focus on DSA, System Design, and Github projects.',
    });
    actionableTips.push({
      category: 'Academic Strategy',
      title: 'Maintain Consistency in Core Labs & Electives',
      priority: 'MEDIUM',
      icon: 'Target',
      description: 'Keep your laboratory and project grades at O/A+ as they carry high weight with low exam pressure.',
    });
    actionableTips.push({
      category: 'Higher Studies',
      title: 'GATE / GRE / CAT Competitive Exams',
      priority: 'MEDIUM',
      icon: 'BookOpen',
      description: 'Your strong GPA foundation puts you in a great position for top IIMs, IITs, or abroad universities.',
    });
  } else if (tierKey === 'FIRST_CLASS') {
    actionableTips.push({
      category: 'GPA Growth',
      title: 'Push to 8.5+ Distinction Cutoff',
      priority: 'HIGH',
      icon: 'TrendingUp',
      description: 'Focus on 4-credit core theory subjects where you currently scored B or B+. Elevating them to A+ yields the fastest CGPA increase.',
    });
    actionableTips.push({
      category: 'Placement Readiness',
      title: 'Eligible for 90%+ Placement Drives',
      priority: 'HIGH',
      icon: 'CheckCircle2',
      description: 'Your CGPA satisfies almost all company eligibility criteria (>7.5). Hone technical interview coding skills.',
    });
    actionableTips.push({
      category: 'Course Strategy',
      title: 'Maximize Elective & Lab Quality Points',
      priority: 'MEDIUM',
      icon: 'Sparkles',
      description: 'Ensure 100% submission score in internals to secure O/A+ grades in upcoming semester electives.',
    });
  } else if (tierKey === 'SECOND_CLASS') {
    actionableTips.push({
      category: 'Crucial Milestone',
      title: 'Reach 7.5 Cutoff for Mass & Core Placements',
      priority: 'HIGH',
      icon: 'ShieldAlert',
      description: 'Many corporate campus recruiters enforce a strict 7.5 CGPA filter. Prioritize high-credit subjects next semester.',
    });
    actionableTips.push({
      category: 'Study Habit',
      title: 'Practice Anna University Past Question Papers',
      priority: 'HIGH',
      icon: 'FileText',
      description: 'Analyzing past 5-year semester exam questions can guarantee 15-20% higher internal and end-sem evaluation scores.',
    });
    actionableTips.push({
      category: 'Peer Collaboration',
      title: 'Form Targeted Group Study Batches',
      priority: 'MEDIUM',
      icon: 'UserCheck',
      description: 'Partner with top-performing peers for complex subjects like Data Structures, DBMS, and Mathematics.',
    });
  } else {
    actionableTips.push({
      category: 'Immediate Action',
      title: arrears > 0 ? 'Clear Backlog Arrears First' : 'Raise CGPA Above 6.0 Cutoff',
      priority: 'URGENT',
      icon: 'ShieldAlert',
      description: arrears > 0 
        ? 'Arrears lock you out of company registration. Allocate 60% of your daily study time to arrear subject preparation.'
        : 'Focus on securing minimum A/B+ grades in all 3 & 4 credit theory papers to cross 6.0 CGPA.',
    });
    actionableTips.push({
      category: 'Faculty Guidance',
      title: 'Meet Course Coordinators for Internal Marks Booster',
      priority: 'HIGH',
      icon: 'HelpCircle',
      description: 'Request additional assignment tasks or re-tests from department staff to maximize internal assessment scores.',
    });
    actionableTips.push({
      category: 'Attendance & Exam Prep',
      title: 'Maintain 85%+ Attendance Standard',
      priority: 'HIGH',
      icon: 'Calendar',
      description: 'High attendance prevents exam detention (SA) and boosts internal attendance bonus points.',
    });
  }

  // 3. Compute Subject Impact Analyzer (Which courses give biggest CGPA boost if improved)
  const courseImpactList = [];
  const topGrade = isUSScale ? 'A' : 'O';
  const maxPoints = protocol.getPoints(topGrade);

  Object.entries(transcript.semesters).forEach(([semName, semProto]) => {
    semProto.courses.forEach((course) => {
      const currentPoints = protocol.getPoints(course.grade);
      const isArrear = protocol.isArrear(course.grade);

      if (currentPoints < maxPoints || isArrear) {
        const potentialPoints = maxPoints;
        const pointGain = (potentialPoints - currentPoints) * course.credits;
        const cgpaBoost = totalCredits > 0 ? pointGain / totalCredits : 0;

        courseImpactList.push({
          semester: semName,
          code: course.code,
          course: course.course,
          credits: course.credits,
          currentGrade: course.grade,
          currentPoints,
          targetGrade: topGrade,
          targetPoints: potentialPoints,
          pointGain,
          cgpaBoost,
          isArrear,
        });
      }
    });
  });

  // Sort impact list by biggest CGPA boost first
  courseImpactList.sort((a, b) => b.cgpaBoost - a.cgpaBoost);

  context.results.advisor = {
    tierKey,
    tierHeadline,
    badgeColor,
    summaryMessage,
    actionableTips,
    courseImpactList: courseImpactList.slice(0, 6), // Top 6 highest impact courses
  };
};
