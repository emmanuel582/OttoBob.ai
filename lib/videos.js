// ============================================
// OttoBob.ai — Core Video Catalog
// ~10 pre-created video definitions for Bob
// These map to files uploaded to Supabase Storage "videos" bucket
// ============================================

export const CORE_VIDEOS = [
  {
    id: 'welcome',
    title: 'Welcome to Otto University',
    description: 'Introduction video for new student applicants explaining the program vision.',
    category: 'onboarding',
    fileName: 'welcome-to-otto-university.mp4',
    duration: '2:30',
    recommended_for: ['applied'],
  },
  {
    id: 'mac-mini',
    title: 'Your Mac Mini Setup Guide',
    description: 'Step-by-step guide on receiving and setting up the financed Mac Mini.',
    category: 'onboarding',
    fileName: 'mac-mini-setup-guide.mp4',
    duration: '4:15',
    recommended_for: ['approved', 'active'],
  },
  {
    id: 'meet-bob',
    title: 'Meet Bob — Your AI Agent',
    description: 'Full walkthrough of Bob, the AI agent that runs 95% of operations.',
    category: 'training',
    fileName: 'meet-bob-ai-agent.mp4',
    duration: '3:45',
    recommended_for: ['approved', 'active'],
  },
  {
    id: 'local-biz',
    title: 'Finding Local Business Clients',
    description: 'How to identify and approach non-tech local businesses in your area.',
    category: 'training',
    fileName: 'finding-local-business-clients.mp4',
    duration: '5:00',
    recommended_for: ['active'],
  },
  {
    id: 'pricing',
    title: '$99 Setup + $49/Month — What You Get',
    description: 'Transparent breakdown of the investment and what students receive.',
    category: 'conversion',
    fileName: 'pricing-breakdown.mp4',
    duration: '2:00',
    recommended_for: ['applied', 'contacted'],
  },
  {
    id: 'success-stories',
    title: 'Student Success Stories',
    description: 'Real examples of students helping local businesses grow revenue.',
    category: 'conversion',
    fileName: 'student-success-stories.mp4',
    duration: '3:30',
    recommended_for: ['contacted', 'interviewing'],
  },
  {
    id: 'revenue-model',
    title: 'How the 5% Network Fee Works',
    description: 'Explains the perpetual 5% revenue share model and passive income potential.',
    category: 'conversion',
    fileName: 'revenue-model-explained.mp4',
    duration: '2:45',
    recommended_for: ['interviewing', 'approved'],
  },
  {
    id: 'onboarding-checklist',
    title: 'Your First 7 Days Checklist',
    description: 'Day-by-day action plan for the first week after approval.',
    category: 'onboarding',
    fileName: 'first-7-days-checklist.mp4',
    duration: '3:00',
    recommended_for: ['approved'],
  },
  {
    id: 'bob-dashboard',
    title: 'Navigating the Bob Dashboard',
    description: 'Complete tour of the Bob AI dashboard and all its features.',
    category: 'training',
    fileName: 'bob-dashboard-tour.mp4',
    duration: '4:30',
    recommended_for: ['active'],
  },
  {
    id: 'faq',
    title: 'Frequently Asked Questions',
    description: 'Answers to the most common questions from prospective students.',
    category: 'conversion',
    fileName: 'frequently-asked-questions.mp4',
    duration: '3:15',
    recommended_for: ['applied', 'contacted'],
  },
];

export const VIDEO_CATEGORIES = {
  onboarding: { label: 'Onboarding', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  training: { label: 'Training', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  conversion: { label: 'Conversion', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
};

/**
 * Bob's Smart Video Recommendation Engine
 * Returns sorted list of recommended videos based on student status
 */
export function getRecommendedVideos(studentStatus) {
  // Prioritize videos recommended for the current status
  const primary = CORE_VIDEOS.filter(v => v.recommended_for.includes(studentStatus));
  const secondary = CORE_VIDEOS.filter(v => !v.recommended_for.includes(studentStatus));
  return [...primary, ...secondary];
}

/**
 * Determine whether Bob should recommend HeyGen or pre-created
 * Only trigger HeyGen on STRONG conversion signals
 */
export function getBobRecommendation(studentStatus) {
  const strongSignals = ['interviewing', 'approved'];

  if (strongSignals.includes(studentStatus)) {
    return {
      type: 'heygen',
      reason: 'Strong conversion signal — student is in the decision stage. A personalized HeyGen video will significantly increase close rate.',
      confidence: 92,
    };
  }

  if (studentStatus === 'active') {
    return {
      type: 'pre-created',
      reason: 'Student is already active. Training and dashboard videos are best served pre-created for consistency.',
      confidence: 88,
    };
  }

  return {
    type: 'pre-created',
    reason: 'Early-stage student — pre-created videos build trust and educate at scale. Save personalized HeyGen for decision stage.',
    confidence: 85,
  };
}
