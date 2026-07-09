/** Shared product and add-on definitions for cover, prospectus, and pricing UI. */

export const MODULES = [
  {
    key: 'core',
    color: 'var(--dl-green)',
    name: 'Delphinium Core',
    includedLabel: 'Included in every plan',
    summary: "See every student's performance and act on it — with seamless Canvas integration & full support",
    intro: 'Turn Delphinium on and your existing courses become an engagement and early-warning powerhouse in minutes. Teachers are less overloaded and more effective, and earlier intervention reaches every at-risk student.',
    quote: {
      text: "I can see — with color — my students' progress! See their points, their percentages — to tell me where a student is very quickly.",
      attr: 'Natalie Niederhauser, HS Math Teacher, Davis Connect',
    },
    sections: [
      {
        title: 'Control Tower',
        lead: 'Know exactly where every student stands — and act on it without leaving the page.',
        items: [
          "Every student's Canvas data in one view: engagement, progress, performance, and full message history",
          'Red / Yellow / Green flags surface at-risk students at a glance',
          'Class and assignment stats reveal trends, not just individual scores',
          'Act on what you see in one click — intervene on the spot',
          'Use Standard Delphinium communication tools to reach students and families right from the roster',
        ],
        imageAfter: '/delphinium-core-control-tower.png',
        imageAfterAlt: 'Control Tower student roster with status indicators and student detail panel',
        imageAfterWidth: '75%',
      },
      {
        title: 'Seamless Canvas integration',
        lead: "No rebuild, no new tool to learn. Just turn Delphinium on and you're good to go instantly.",
        items: [
          'One layer over Canvas, not a second platform to manage',
          'Runs on the Canvas courses you already have — no need to change your class in any way',
          'Edits in Canvas flow through automatically — never maintain two systems',
          'Works inside the Canvas student and parent apps, on any device',
        ],
      },
      {
        title: 'Support',
        lead: 'Help everywhere you need it, for students, parents, teachers, and admins.',
        items: [
          'Just-in-time help: instructions, tooltips, and links embedded right in the interface',
          'A dynamic, guided walkthrough tour',
          'An active community forum for peer answers and shared best practices',
          'Train-the-trainer model so your staff can scale support internally',
          'Ticket system for direct support from our team',
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
    summary: 'Reach the right students at the right moment, without the manual email',
    intro: 'Reach every student the moment it matters — automatically — so a slipping grade never becomes a failed course. Teachers chase less, families know how to help, and every student feels seen.',
    heroSubtitle: 'Right message, right student • Communicate more, work less • Reach them everywhere',
    quote: {
      text: 'You just saved me hours of mail merging! This saves teachers so much time and really brings that part of personalized learning that we\'re all trying to reach for.',
      attr: 'Sarah LaBarge, Curriculum Director, Davis Connect',
    },
    sections: [
      {
        title: 'Right message, right student',
        lead: 'Stop blasting the whole class. Target exactly the students who need to hear from you — the moment they need you.',
        items: [
          'Message one student, a targeted group, parents, or your whole class',
          'Filter by engagement, scores, status, or group — find exactly the right students in seconds',
          'Reach at-risk students automatically with rules like "if points drop below 50, message them and CC the counselor"',
          "Celebrate students who are thriving, not just rescue those who aren't — and loop parents in on the good news!",
        ],
      },
      {
        title: 'Communicate more, work less',
        lead: 'Stay ahead of every student, without staying late.',
        items: [
          "Personalize at scale — drop in live student data variables and every message auto-fills each student's real Canvas grades and progress, effortlessly",
          'Recurring progress reports and reminders send themselves, so students always know where they stand',
          'Schedule messages in advance — send dates recalculate automatically when a course copies to a new term',
          'Compose fast with templates — or let AI draft the message for you',
          'Build a message once and reuse it across every section and semester',
        ],
      },
      {
        title: 'Reach them everywhere',
        lead: 'Send from one screen and land everywhere students actually look.',
        items: [
          'One message can go out as a Canvas message, announcement, to-do item, banner, email, and text — so it never quietly fails to land',
          'Compose every kind of outreach from one screen, instead of hunting through scattered Canvas tools',
          "Keep one history of who was told what, and when — nothing lost across separate inboxes",
          'Messages auto-translate into 160 languages so every family hears from you in their own language',
        ],
        imageAfter: '/community-builder-message-center.png',
        imageAfterAlt: 'Message Center with scheduled messages and personalized student outreach compose window',
        imageAfterWidth: '75%',
      },
    ],
    features: [],
    quoteKey: 'communityBuilder',
    headerClass: 'doc-module-header-yellow',
    priceKey: 'cbPrice',
  },
  {
    key: 'eb',
    color: 'var(--dl-blue)',
    name: 'Engagement Builder',
    summary: "Turn Canvas' gray wall of text into a class students actually want to engage with",
    intro: 'Turn your Canvas courses into an experience students want to engage with. Give every course one polished, on-brand look that\'s easy to navigate — and a shared view so parents and teachers can step in at the right moment.',
    heroSubtitle: 'Drive engagement • Build champions • Transform Canvas',
    quote: {
      text: 'Students have redone a quiz they did poorly on, just to earn more points for their avatar — engagement and work completion went up.',
      attr: 'Tiffany Dance, Instructional Coach, Davis Connect',
    },
    sections: [
      {
        title: 'Students who drive themselves',
        lead: 'When students can see where they stand and where they\'re headed, they own their journey.',
        items: [
          'Color-coded progress, quality, and performance are visible at a glance',
          'Students set, track, and take ownership of their own goals',
          'Nudges drive engagement and reward every step of momentum',
          'Success signals — celebrations, avatars, prize boxes, and achievements — mark every win as it happens',
        ],
        imageAfter: '/engagement-builder-gamification.png',
        imageAfterAlt: "Gamification widgets: Who's Near Me, prize boxes, avatar, progress trackers, and achievements",
        imageAfterWidth: '75%',
      },
      {
        title: 'Give every student a champion',
        lead: 'Convert parents from frustrated bystanders into the support system every student needs.',
        items: [
          'Parents see how their student is really doing — and can offer real support',
          'Teachers see exactly what a student sees, so they can step in fast',
        ],
      },
      {
        title: 'A Canvas makeover your whole school can navigate',
        lead: 'A Canvas that finally looks as good as the teaching behind it — consistent across every class in your school.',
        items: [
          "Transform Canvas' gray wall of text into a clean, engaging, on-brand experience",
          'Keep one consistent look and feel across all your courses — no per-teacher variation',
          "Use Layout Editor to build your own look and make it unmistakably your school's",
        ],
        imageAfter: '/engagement-builder-dashboard.png',
        imageAfterAlt: 'Which class would you rather take — standard Canvas vs Canvas with Delphinium',
        imageAfterWidth: '75%',
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
    summary: 'School-wide visibility to the data you need, across every class',
    intro: 'Your whole program in one view — the data leaders need to act, pulled from Canvas and made usable. The result: higher completion and pass rates across the program, stronger retention, and accountability numbers that hold up.',
    heroSubtitle: 'Cross-course visibility • Every stakeholder • Research access',
    quote: {
      text: "There's a lot of data in Canvas. It's getting it out in a usable way — that's what we need.",
      attr: 'Ryan Hansen, Digital Learning Director, Davis School District',
    },
    sections: [
      {
        title: 'See your whole program from one tower',
        lead: 'One vantage point over every course and every school at once — not one class at a time.',
        items: [
          'Cross-course Control Tower: every student, every course, in a single view',
          'Everyone who supports a student — students, parents, teachers, teacher groups, and admins — together in one place',
          'The operations view for VPs of online academics, executive directors, and program leaders',
          'The data leaders need to act, pulled out of Canvas and made usable',
        ],
      },
      {
        title: 'A front door your school sets',
        lead: 'Make the landing experience your own — the way students wish Canvas worked out of the box.',
        items: [
          'Customize the home and dashboard layout, colors, and look across your courses',
          'A polished, consistent front door for every student — set by your school, not bolted on one browser at a time',
          'Surface what matters most up front, so students land on direction, not a wall of text',
        ],
      },
      {
        title: 'Go deeper than the dashboard',
        lead: 'For when "what\'s happening" isn\'t enough and you need to know "why."',
        items: [
          'Research access for deeper analysis across courses and cohorts',
          'Look for patterns across whole programs, not one class or one term at a time',
          'Build the evidence to show what\'s working — and where to invest next',
        ],
      },
    ],
    features: [],
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
    summary: 'Custom / quote — Add-on: expanded parent communication.',
    description: 'Add-on: expanded parent communication.',
    lead: 'More parent communication options through your Clever integration.',
    features: [
      'Give Delphinium-enhanced Canvas access to the full SIS list of parent contact information',
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
    summary: 'Custom / quote — Add-on: reach families on their phones.',
    description: 'Add-on: reach families on their phones.',
    lead: 'Reach families by text, where they already are.',
    features: [
      'Outbound SMS from your existing Message Center workflows',
      'Reach families on the device they check most often',
      'Receive replies right in Delphinium-enhanced Canvas — no new app to manage and load',
      'Pricing tailored to your volume — quoted per agreement',
    ],
    requires: 'clever',
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
