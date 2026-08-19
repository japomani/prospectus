/** Shared product and add-on definitions for cover, prospectus, and pricing UI. */

export const MODULES = [
  {
    key: 'core',
    color: 'var(--dl-green)',
    name: 'Delphinium Core',
    headline: 'Control Tower, seamless Canvas integration, and support — all included.',
    heroSubtitle: 'Control Tower \u2022 Seamless Canvas integration \u2022 Support',
    includedLabel: 'Included in every plan',
    summary: 'See every student\u2019s performance and act on it, seamless Canvas integration, and full support.',
    heroImages: [
      { src: '/core-ct.png', alt: 'Control Tower class roster' },
      { src: '/core-details.png', alt: 'Student detail panel' },
    ],
    intro: 'Turn Delphinium on and your existing courses become an engagement and early-warning powerhouse in minutes. Teachers are less overloaded and more effective, and earlier intervention reaches every at-risk student.',
    quote: {
      text: 'I can see \u2014 with color \u2014 my students\u2019 progress! See their points, their percentages \u2014 to tell me where a student is very quickly.',
      attr: 'High School Math Teacher',
    },
    sections: [
      {
        title: 'Control Tower',
        lead: 'Know exactly where every student stands \u2014 and act on it without leaving the page.',
        items: [
          'Every student\u2019s Canvas data in one view: engagement, progress, performance, and full message history',
          'Red / Yellow / Green flags surface at-risk students at a glance',
          'Class and assignment stats reveal trends, not just individual scores',
          'Act on what you see in one click \u2014 intervene on the spot',
          'Use Standard Delphinium communication tools to reach students and families right from the roster',
        ],
      },
      {
        title: 'Seamless Canvas integration',
        lead: 'No rebuild, no new tool to learn. Just turn Delphinium on and you\u2019re good to go instantly.',
        items: [
          'One layer over Canvas, not a second platform to manage',
          'Runs on the Canvas courses you already have \u2014 no need to change your class in any way',
          'Edits in Canvas flow through automatically \u2014 never maintain two systems',
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
    color: 'var(--dl-blue)',
    name: 'Community Builder',
    sheetKicker: 'Community Builder',
    headline: 'Right message, right student — communicate more, work less.',
    summary: 'Reach the right students at the right moment, without the manual email.',
    heroSubtitle: 'Right message, right student \u2022 Communicate more, work less \u2022 Reach them everywhere',
    plainHero: true,
    heroImages: [
      { src: '/cb-message-table.png', alt: 'Message Center — message groups with schedule and status' },
      { src: '/cb-compose.png', alt: 'Create Message compose dialog' },
    ],
    intro: 'Reach every student the moment it matters \u2013 automatically \u2013 so a slipping grade never becomes a failed course. Teachers chase less, families know how to help, and every student feels seen.',
    sections: [
      {
        title: 'Right message, right student',
        lead: 'Stop blasting the whole class. Target exactly the students who need to hear from you \u2014 the moment they need you.',
        items: [
          'Message one student, a targeted group, parents, or your whole class',
          'Filter by engagement, scores, status, or group \u2014 Find exactly the right students in seconds',
          'Reach at-risk students automatically with rules like "If points drop below 50, message them and CC the counselor"',
          'Celebrate students who are thriving, not just rescue those who aren\'t \u2014 and loop parents in on the good news!',
        ],
      },
      {
        title: 'Communicate more, work less',
        lead: 'Stay ahead of every student, without staying late.',
        items: [
          'Personalize at scale \u2014 Drop in live student data variables and every message auto-fills each student\'s real Canvas grades and progress, effortlessly',
          'Recurring progress reports and reminders send themselves, so students always know where they stand',
          'Schedule messages in advance \u2014 send dates recalculate automatically when a course copies to a new term',
          'Compose fast with templates \u2014 or let AI craft the message for you',
          'Build a message once and reuse it across every section and semester',
        ],
      },
      {
        title: 'Reach them everywhere',
        lead: 'Send from one screen and land everywhere students actually look.',
        items: [
          'One message can go out as a Canvas message, announcement, to-do item, banner, email, and text \u2014 so it never quietly fails to land',
          'Compose every kind of outreach from one screen, instead of hunting through scattered Canvas tools',
          'Keep one history of who was told what, and when \u2014 nothing lost across separate inboxes',
          'Messages auto-translate into 100 languages so every family hears from you in their own language',
        ],
      },
    ],
    quotes: [
      { text: 'We can send targeted communication to specific groups of kids \u2014 and the data shows us exactly who those kids are.', attr: 'Digital Learning Director' },
      { text: 'It saves me so much time in my communication and allows me more time to work with my students one-on-one.', attr: 'Teacher' },
    ],
    bottomQuote: {
      text: 'You just saved me hours of mail merging! This saves teachers so much time and really brings that part of personalized learning that we all strive to reach for.',
      attr: 'Curriculum Director',
    },
    features: [],
    quoteKey: 'communityBuilder',
    headerClass: 'doc-module-header-yellow',
    priceKey: 'cbPrice',
    otherProduct: {
      headline: 'Reach every student the moment it matters — without the manual email.',
      sections: [
        {
          title: 'Right message, right student',
          lead: 'Stop blasting the whole class. Target exactly the students who need to hear from you — the moment they need you.',
          items: [
            'Message one student, a targeted group, parents, or your whole class',
            'Filter by engagement, scores, status, or group — find exactly the right students in seconds',
            'Reach at-risk students automatically with rules like "If points drop below 50, message them and CC the counselor"',
          ],
        },
        {
          title: 'Communicate more, work less',
          lead: 'Stay ahead of every student, without staying late.',
          items: [
            'Personalize at scale — drop in live student data variables and every message auto-fills each student\'s real Canvas grades and progress',
            'One message can go out as a Canvas message, announcement, email, and text — so it never quietly fails to land',
          ],
        },
      ],
      quote: {
        text: 'We can send targeted communication to specific groups of kids — and the data shows us exactly who those kids are.',
        attr: 'Digital Learning Director',
      },
      quoteMutedAttr: true,
    },
  },
  {
    key: 'eb',
    color: 'var(--dl-blue)',
    name: 'Engagement Builder',
    headline: 'Drive engagement, build champions, and transform Canvas.',
    summary: 'Turn Canvas\' gray wall of text into a class students actually want to engage with.',
    heroSubtitle: 'Drive engagement \u2022 Build champions \u2022 Canvas makeover',
    heroImages: [
      { src: '/engagement-builder-comparison.png', alt: 'Which class would you rather take? Standard Canvas vs Canvas with Delphinium' },
    ],
    intro: 'Turn your Canvas courses into an experience students want to engage with. Give every course one polished, on-brand look that\'s easy to navigate — and a shared view so parents and teachers can step in at the right moment.',
    sections: [
      {
        title: 'Students who drive themselves',
        lead: 'When students can see where they stand and where they\'re headed, they own their journey — and it shows: more pass the first time and fewer slip through unnoticed.',
        items: [
          'Color-coded progress, quality, and performance are visible at a glance',
          'Students set, track, and own their goals',
          'Nudges drive engagement and reward momentum',
          'Success signals — celebrations, progress trackers, achievements, and game elements — turn every win into a reason to keep going',
        ],
      },
      {
        title: 'Give every student a champion',
        lead: 'Surround every student with people who can actually help — at home and in class.',
        items: [
          'Turn parents from frustrated bystanders into the support system every student needs',
          'Parents and teachers see the same live picture as the student — no guessing, and they can step in fast',
        ],
      },
      {
        title: 'A Canvas makeover for your whole school',
        lead: 'Finally, a Canvas that looks as good as the teaching behind it — the same polished experience in every class.',
        items: [
          'Transform Canvas\' gray wall of text into a clean, engaging experience that\'s easy to navigate',
          'Design one consistent, on-brand look and feel — so every class feels like the same school',
        ],
      },
    ],
    quote: {
      text: 'Students have redone a quiz they did poorly on, just to earn more points for their avatar — engagement and work completion went up.',
      attr: 'Instructional Coach',
    },
    imageBottom: '/engagement-builder-gamification.png',
    imageBottomAlt: 'Gamification widgets: Who\'s Near Me, prize boxes, avatar, progress trackers, and achievements',
    page2Class: 'eb-page2',
    features: [],
    quoteKey: 'engagementBuilder',
    headerClass: 'doc-module-header-blue',
    priceKey: 'ebPrice',
    otherProduct: {
      headline: 'Turn the gray wall of text into a course students actually want to open.',
      sections: [
        {
          title: 'Makeover',
          lead: 'A Canvas that finally looks as good as the teaching behind it, consistent across every class.',
          items: [
            'Transform Canvas\' gray wall of text into a clean, engaging, on-brand experience',
            'Keep one consistent look and feel across all your courses',
            'Use Layout Editor to build your own look and make it unmistakably your school\'s',
          ],
        },
        {
          title: 'Self-regulated trajectory',
          lead: 'Students always know where they stand and where they\'re headed, so they own the climb.',
          items: [
            'Color-coded progress, quality, and performance at a glance',
            'Students set, track, and take ownership of their own goals',
          ],
        },
      ],
      quote: {
        text: 'Students have redone a quiz they did poorly on just to earn more points for their avatar — engagement and work completion went up.',
        attr: 'Tiffany Dance, Instructional Coach, Davis Connect',
      },
      quoteMutedAttr: true,
    },
  },
  {
    key: 'ctu',
    color: 'var(--dl-magenta)',
    name: 'Control Tower Ultra',
    titleSuffix: ' (Coming soon)',
    headline: 'Cross-course visibility for every stakeholder, plus research access.',
    summary: 'School-wide visibility to the data you need, across every class.',
    heroSubtitle: 'Cross-course visibility • Every stakeholder • Research access',
    intro: 'Your whole program in one view — the data leaders need to act, pulled from Canvas and made usable. The result: higher completion and pass rates across the program, stronger retention, and accountability numbers that hold up.',
    benefit: 'Cross-course visibility for students, parents, teachers, and admins.',
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
        title: 'A front door your school sets, not one browser at a time',
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
    quote: {
      text: 'There\u2019s a lot of data in Canvas. It\u2019s getting it out in a usable way \u2014 that\u2019s what we need.',
      attr: 'Ryan Hansen, Digital Learning Director, Davis School District',
    },
    features: [],
    quoteKey: 'controlTowerUltra',
    headerClass: 'doc-module-header-magenta',
    priceKey: 'ctuPrice',
    otherProduct: {
      headline: 'School-wide visibility across every course, for principals, counselors, and admins.',
      bullets: [
        'Cross-course visibility',
        'Students, parents, teachers, admins',
        'Research access',
      ],
      quote: {
        text: 'There\u2019s a lot of data in Canvas. It\u2019s getting it out in a usable way \u2014 that\u2019s what we need.',
        attr: 'Ryan Hansen, Digital Learning Director, Davis School District',
      },
    },
  },
];

export const ADDONS = [
  {
    key: 'clever',
    quoteKey: 'clever',
    priceKey: 'cleverFee',
    color: 'var(--dl-indigo)',
    name: 'SIS integration',
    summary: 'Reach every parent in Community Builder and Control Tower, not just the Canvas Observers.',
    description: 'Add-on — expanded parent communication.',
    lead: 'Reach every parent in Community Builder and Control Tower, not just the Canvas Observers.',
    features: [
      'Connect your SIS to Delphinium to seamlessly pull in parent and guardian contact info, no separate signup required',
      'Available through OneRoster, Clever, or SIS API access',
      'Pricing subject to data connection fees and integration requirements',
    ],
  },
  {
    key: 'sms',
    quoteKey: 'sms',
    priceKey: 'smsFee',
    color: 'var(--dl-magenta)',
    name: 'SMS texting that just works',
    summary: 'Reach families by text they actually read, not emails they ignore.',
    description: 'Add-on — reach families on their phones.',
    badge: 'Requires SIS integration',
    lead: 'Reach families by text they actually read, not emails they ignore.',
    features: [
      'Real two-way conversation, not just a one-way alert',
      'No app to download — works on any phone, nothing new to install',
      'Every reply lands in Delphinium-enhanced Canvas — right where you are doing all the rest of your work',
    ],
    legal: [
      {
        title: 'Credits',
        body: 'Prepaid message credits. One credit ≈ a typical short text; longer texts and MMS use more. Message replies use credits too.',
      },
      {
        title: 'Rollover',
        body: 'Unused credits carry into your next SMS year when you renew. They remain available through the end of that renewal year, then expire. If school does not renew, unused credits are forfeited without refund at the end of agreement term.',
      },
      {
        title: 'Overage',
        body: 'By default, messaging keeps running if you use more than your purchased block; extra usage is billed at your purchased rate. You can also choose a hard stop at 105% of your block until more credits are added. Your quote shows which option you’ve selected.',
      },
    ],
  },
];

function isHigherEd(quote) {
  return Boolean(quote?.isUniversity);
}

/** Drop SIS / parent-contact add-on from prospectus when Higher Ed is on — unless SMS selected it. */
function audienceAddons(addons, quote) {
  if (!isHigherEd(quote)) return addons;
  if (quote?.sms && quote?.clever) return addons;
  return addons.filter(a => a.key !== 'clever');
}

function mapSectionItems(sections, mapItem) {
  return (sections || []).map(section => ({
    ...section,
    items: (section.items || []).map(mapItem).filter(Boolean),
  }));
}

/**
 * Higher Ed: remove parent/guardian/family/observer copy (drop lines when
 * they exist only for that audience; otherwise strip those words from lists).
 */
export function adaptModuleForAudience(mod, isUniversity) {
  if (!isUniversity || !mod) return mod;
  const m = structuredClone(mod);

  if (m.key === 'core') {
    m.sections = mapSectionItems(m.sections, item => {
      if (item.includes('students and families')) {
        return item.replace('students and families', 'students');
      }
      if (item.includes('student and parent apps')) {
        return item.replace('student and parent apps', 'student app');
      }
      return item;
    }).map(section => {
      if (section.title === 'Support' && section.lead) {
        return {
          ...section,
          lead: section.lead.replace('students, parents, teachers, and admins', 'students, teachers, and admins'),
        };
      }
      return section;
    });
  }

  if (m.key === 'cb') {
    if (m.intro) {
      m.intro = m.intro.replace('Teachers chase less, families know how to help, and every student feels seen.', 'Teachers chase less, and every student feels seen.');
    }
    m.sections = mapSectionItems(m.sections, item => {
      if (item.includes('a targeted group, parents, or')) {
        return item.replace('a targeted group, parents, or', 'a targeted group, or');
      }
      if (item.includes('loop parents in')) return null;
      if (item.includes('every family hears')) {
        return item.replace('every family hears', 'every student hears');
      }
      return item;
    });
    if (m.otherProduct?.sections) {
      m.otherProduct.sections = mapSectionItems(m.otherProduct.sections, item => {
        if (item.includes('a targeted group, parents, or')) {
          return item.replace('a targeted group, parents, or', 'a targeted group, or');
        }
        return item;
      });
    }
  }

  if (m.key === 'eb') {
    if (m.intro) {
      m.intro = m.intro.replace(
        'and a shared view so parents and teachers can step in at the right moment.',
        'and a shared view so teachers can step in at the right moment.',
      );
    }
    m.sections = (m.sections || []).map(section => {
      if (section.title !== 'Give every student a champion') return section;
      return {
        ...section,
        lead: 'Surround every student with people who can actually help',
        items: [],
      };
    });
  }

  if (m.key === 'ctu') {
    if (m.benefit) {
      m.benefit = m.benefit.replace('students, parents, teachers, and admins', 'students, teachers, and admins');
    }
    m.sections = mapSectionItems(m.sections, item => {
      if (item.includes('students, parents, teachers, teacher groups, and admins')) {
        return item.replace(
          'students, parents, teachers, teacher groups, and admins',
          'students, teachers, teacher groups, and admins',
        );
      }
      return item;
    });
    if (m.otherProduct?.bullets) {
      m.otherProduct.bullets = m.otherProduct.bullets.map(b => (
        b === 'Students, parents, teachers, admins' ? 'Students, teachers, admins' : b
      ));
    }
  }

  return m;
}

export function selectedAddons(quote) {
  return audienceAddons(ADDONS.filter(a => quote[a.quoteKey]), quote);
}

export const OPTIONAL_MODULES = MODULES.filter(m => !m.included && m.quoteKey);

export function selectedModules(quote) {
  return [...MODULES.filter(m => m.included), ...OPTIONAL_MODULES.filter(m => quote[m.quoteKey])];
}

export function unselectedModules(quote) {
  return OPTIONAL_MODULES.filter(m => !quote[m.quoteKey]);
}

export function unselectedAddons(quote) {
  return audienceAddons(ADDONS.filter(a => !quote[a.quoteKey]), quote);
}

export function hasUnselectedProducts(quote) {
  return unselectedModules(quote).length > 0 || unselectedAddons(quote).length > 0;
}
