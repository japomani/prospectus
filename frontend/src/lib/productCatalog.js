/** Shared product and add-on definitions for cover, prospectus, and pricing UI. */

export const MODULES = [
  {
    key: 'core',
    color: 'var(--dl-green)',
    name: 'Delphinium Core',
    includedLabel: 'Included in every plan',
    summary: 'See every student and act on it, seamless Canvas integration, and full support.',
    quote: {
      text: 'The control tower\u2026 I can see with color my students\u2019 progress, see their points, their percentages \u2014 to tell me where a student is very quickly.',
      attr: 'Natalie Niederhauser, HS Math Teacher, Davis Connect',
    },
    sections: [
      {
        title: 'Control Tower',
        lead: 'See everything for each student, and act on it without leaving the page.',
        items: [
          'All of a student\'s Canvas data in one place: engagement, progress, performance, full message history',
          'Early-warning at a glance: every student Red / Yellow / Green',
          'Class and assignment stats at a glance',
          'One-click access to act on what you see',
          'Standard communication tools',
        ],
        imageAfter: '/delphinium-core-control-tower.png',
        imageAfterAlt: 'Control Tower student roster with status indicators and student detail panel',
        imageAfterWidth: '75%',
      },
      {
        title: 'Seamless Canvas integration',
        lead: 'No rebuild, no new tool to learn. Turn it on and your existing courses become Delphinium in minutes.',
        items: [
          'Builds on the Canvas courses you already have — nothing to recreate',
          'Edits in Canvas (due dates, modules, new assignments, etc.) flow through automatically — never maintain two systems',
          'Works inside the Canvas student and parent apps, on any device',
          'One layer over Canvas, not a second platform to manage',
        ],
      },
      {
        title: 'Support',
        lead: 'Help everywhere you need it, for students, parents, teachers, and admins alike.',
        items: [
          'Just-in-time training: embedded instructions, tooltips, and links to tutorials right in the interface',
          'A dynamic, guided walkthrough tour',
          'Detailed training modules',
          'An active community forum',
          'Train-the-trainer model plus ticket system for support requests',
        ],
      },
    ],
    features: [],
    included: true,
    quoteKey: null,
    headerClass: null,
  },
  {
    key: 'cb',
    color: 'var(--dl-indigo)',
    name: 'Community Builder',
    summary: 'Reach the right families at the right moment, without the manual email.',
    quote: {
      text: 'Jared, you just saved me hours of mail merging\u2026 this saves teachers so much time.',
      attr: 'Sarah LaBarge, Curriculum Director, Davis Connect',
    },
    heroSubtitle: 'Message Center • Templates & blocks • Auto-translation',
    imageBottom: '/community-builder-message-center.png',
    imageBottomAlt: 'Message Center with scheduled messages and personalized student outreach compose window',
    imageBottomWidth: '75%',
    features: ['Message Center: scheduled & targeted', 'Templates, blocks, banners', 'Auto-translation, 160 languages'],
    quoteKey: 'communityBuilder',
    headerClass: 'doc-module-header-yellow',
    priceKey: 'cbPrice',
  },
  {
    key: 'eb',
    color: 'var(--dl-blue)',
    name: 'Engagement Builder',
    summary: 'Turn the gray wall of text into a course students actually want to open.',
    quote: {
      text: 'Students have redone a quiz they did poorly on just to earn more points for their avatar\u2026 engagement and work completion went up.',
      attr: 'Tiffany Dance, Instructional Coach, Davis Connect',
    },
    sections: [
      {
        title: 'Makeover',
        lead: 'A Canvas that finally looks as good as the teaching behind it, consistent across every class.',
        items: [
          'Transform Canvas\' gray wall of text into a clean, engaging, on-brand experience',
          'Keep one consistent look and feel across all your courses',
          'Use Layout Editor to build your own look and make it unmistakably your school\'s',
        ],
        imageAfter: '/engagement-builder-dashboard.png',
        imageAfterAlt: 'Which class would you rather take — standard Canvas vs Canvas with Delphinium',
        imageAfterWidth: '75%',
      },
      {
        title: 'Self-regulated Trajectory',
        lead: 'Students always know where they stand and where they\'re headed, so they own the climb.',
        items: [
          'Color-coded progress, quality, and performance at a glance',
          'Students set, track, and take ownership of their own goals',
        ],
      },
      {
        title: 'Nudges',
        lead: 'Drive student engagement and reward momentum.',
        items: [
          'Success signals — notifications and celebrations — that mark wins as they happen',
          'Tags that focus student attention on the assignments that matter most right now',
          'Gamification that makes progress feel rewarding, not a chore — avatars, prize boxes, achievements, who\'s near me?',
        ],
        imageAfter: '/engagement-builder-gamification.png',
        imageAfterAlt: 'Gamification widgets: Who\'s Near Me, prize boxes, avatar, progress trackers, and achievements',
        imageAfterWidth: '75%',
      },
      {
        title: 'Social Support',
        lead: 'Parent view and Periscope mode give every student the champions they need.',
        items: [
          'Families can see how their student is really doing and offer support',
          'Teachers see exactly what a student sees, so they can step in fast',
        ],
      },
    ],
    features: [],
    quoteKey: 'engagementBuilder',
    headerClass: 'doc-module-header-blue',
    priceKey: 'ebPrice',
  },
  {
    key: 'ctu',
    color: 'var(--dl-magenta)',
    name: 'Control Tower Ultra',
    summary: 'School-wide visibility across every course, for principals, counselors, and admins.',
    benefit: 'Cross-course visibility for students, parents, teachers, and admins.',
    quote: {
      text: 'There\u2019s a lot of data in Canvas. It\u2019s getting it out in a usable way \u2014 that\u2019s what we need.',
      attr: 'Ryan Hansen, Digital Learning Director, Davis School District',
    },
    features: ['Cross-course visibility', 'Students, parents, teachers, admins', 'Research access'],
    quoteKey: 'controlTowerUltra',
    headerClass: 'doc-module-header-magenta',
    priceKey: 'ctuPrice',
  },
];

export const ADDONS = [
  {
    key: 'clever',
    quoteKey: 'clever',
    priceKey: 'cleverFee',
    color: 'var(--dl-blue)',
    name: 'Clever integration',
    summary: 'Expanded parent communication through your existing rostering.',
    description: 'Add-on — expanded parent communication.',
    lead: 'Sync Delphinium with Clever so rostering and parent outreach stay aligned with the systems you already use.',
    features: [
      'Roster sync through your existing Clever connection',
      'Expanded parent communication without duplicate data entry',
      'Per-school pricing — scale as your district grows',
    ],
  },
  {
    key: 'sms',
    quoteKey: 'sms',
    priceKey: 'smsFee',
    color: 'var(--dl-blue)',
    name: 'SMS texting',
    summary: 'Reach families on their phones, where messages actually land.',
    description: 'Add-on — reach families on their phones.',
    lead: 'Send timely nudges and updates by text so families see important messages even when email goes unread.',
    features: [
      'Outbound SMS from your existing Message Center workflows',
      'Reach families on the device they check most often',
      'Pricing tailored to your volume — quoted per agreement',
    ],
  },
];

export function selectedAddons(quote) {
  return ADDONS.filter(a => quote[a.quoteKey]);
}

export const OPTIONAL_MODULES = MODULES.filter(m => !m.included && m.quoteKey);

export function selectedModules(quote) {
  return [...MODULES.filter(m => m.included), ...OPTIONAL_MODULES.filter(m => quote[m.quoteKey])];
}

export function unselectedModules(quote) {
  return OPTIONAL_MODULES.filter(m => !quote[m.quoteKey]);
}

export function unselectedAddons(quote) {
  return ADDONS.filter(a => !quote[a.quoteKey]);
}

export function hasUnselectedProducts(quote) {
  return unselectedModules(quote).length > 0 || unselectedAddons(quote).length > 0;
}
