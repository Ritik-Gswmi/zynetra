export type Course = {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  instructorName?: string;
  coverImageUrl?: string;
  outline?: Array<{
    title: string;
    topics: Array<{ title: string; points: string[] }>;
  }>;
};

export type Lesson = {
  id: string;
  courseId: string;
  title: string;
  durationMinutes: number;
  videoKind?: 'mp4' | 'youtube';
  videoUrl?: string;
  youtubeId?: string;
  webUrl?: string;
  summary: string;
  quiz: Array<{ id: string; question: string; options: string[]; answerIndex: number }>;
};

// Keep course/lesson content static for now (like the current mock API),
// while user + progress lives in MongoDB.
export const courses: Course[] = [
  {
    id: 'foundations',
    title: 'AI Foundations (Micro)',
    description: 'Core concepts: tokens, embeddings, prompting, and evals — in bite-sized lessons.',
    level: 'Beginner',
    instructorName: 'ByteLearn Team',
    coverImageUrl:
      'https://images.unsplash.com/photo-1526378722484-bd91ca387e72?auto=format&fit=crop&w=1200&q=60',
  },
  {
    id: 'rag',
    title: 'RAG in Practice (Mini)',
    description: 'Build retrieval-augmented generation flows with chunking, vector search, and citations.',
    level: 'Intermediate',
    instructorName: 'Aria Singh',
    coverImageUrl:
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=60',
  },
  {
    id: 'data-science',
    title: 'Data Science Essentials',
    description: 'From data cleaning to visualization and storytelling with practical analysis skills.',
    level: 'Beginner',
    instructorName: 'Meera Kulkarni',
    coverImageUrl:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=60',
  },
  {
    id: 'cyber-security',
    title: 'Cyber Security Fundamentals',
    description: 'Threats, controls, and practical security hygiene for modern systems.',
    level: 'Beginner',
    instructorName: 'Rohan Verma',
    coverImageUrl:
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=60',
  },
  {
    id: 'devops',
    title: 'DevOps & Cloud Delivery',
    description: 'CI/CD, containers, and reliable deployments with modern DevOps practices.',
    level: 'Intermediate',
    instructorName: 'Sana Iqbal',
    coverImageUrl:
      'https://images.unsplash.com/photo-1556155092-490a1ba16284?auto=format&fit=crop&w=1200&q=60',
  },
  {
    id: 'machine-learning',
    title: 'Machine Learning (Practical)',
    description: 'Supervised learning, evaluation, and model iteration with real datasets.',
    level: 'Intermediate',
    instructorName: 'Aarav Patel',
    coverImageUrl:
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=60',
  },
  {
    id: 'generative-ai',
    title: 'Generative AI & LLM Apps',
    description: 'Build LLM-powered apps: prompting, tool use, safety, and evaluation.',
    level: 'Advanced',
    instructorName: 'Nisha Rao',
    coverImageUrl:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=60',
  },
];

const baseLessonsByCourseId: Record<string, Lesson[]> = {
  foundations: [
    {
      id: 'tokens',
      courseId: 'foundations',
      title: 'Tokens & Context Windows',
      durationMinutes: 4,
      videoKind: 'youtube',
      youtubeId: 'JUGH_-dVxkA',
      webUrl: 'https://www.youtube.com/watch?v=JUGH_-dVxkA',
      summary: 'Understand tokenization and why context windows limit what a model can consider at once.',
      quiz: [
        {
          id: 'q1',
          question: 'What best describes a token?',
          options: ['A word only', 'A chunk of text (subword/word)', 'A sentence', 'A paragraph'],
          answerIndex: 1,
        },
        {
          id: 'q2',
          question: 'Why does context window matter?',
          options: ['It affects battery usage', 'It limits available memory for inputs', 'It changes font size', 'It speeds up Wi‑Fi'],
          answerIndex: 1,
        },
      ],
    },
    {
      id: 'prompting',
      courseId: 'foundations',
      title: 'Prompting Basics',
      durationMinutes: 5,
      videoKind: 'youtube',
      youtubeId: '2ePf9rue1Ao',
      webUrl: 'https://www.youtube.com/watch?v=2ePf9rue1Ao',
      summary: 'Write clearer instructions, define success criteria, and specify output formats.',
      quiz: [
        {
          id: 'q1',
          question: 'Which is most helpful in a prompt?',
          options: ['Vague goal', 'Concrete format and constraints', 'No context', 'Random emojis'],
          answerIndex: 1,
        },
      ],
    },
  ],
  rag: [
    {
      id: 'chunking',
      courseId: 'rag',
      title: 'Chunking Strategy',
      durationMinutes: 6,
      videoKind: 'youtube',
      youtubeId: 'T-D1OfcDW1M',
      webUrl: 'https://www.youtube.com/watch?v=T-D1OfcDW1M',
      summary: 'Choose chunk sizes and overlaps that preserve meaning and improve retrieval.',
      quiz: [
        {
          id: 'q1',
          question: 'Why use chunk overlap?',
          options: ['To increase screen brightness', 'To avoid losing context at boundaries', 'To reduce storage', 'To disable caching'],
          answerIndex: 1,
        },
      ],
    },
  ],
  'data-science': [
    {
      id: 'ds-intro',
      courseId: 'data-science',
      title: 'What Data Science Is (and isn’t)',
      durationMinutes: 8,
      videoKind: 'youtube',
      youtubeId: 'ua-CiDNNj30',
      webUrl: 'https://www.youtube.com/watch?v=ua-CiDNNj30',
      summary: 'Learn common workflows: define a question, explore data, test ideas, and communicate results.',
      quiz: [
        {
          id: 'q1',
          question: 'A good first step in data science is:',
          options: ['Choose a model immediately', 'Frame the question and success metrics', 'Skip data checks', 'Avoid stakeholders'],
          answerIndex: 1,
        },
      ],
    },
    {
      id: 'ds-cleaning',
      courseId: 'data-science',
      title: 'Data Cleaning Checklist',
      durationMinutes: 10,
      videoKind: 'youtube',
      youtubeId: 'gtjxAH8uaP0',
      webUrl: 'https://www.youtube.com/watch?v=gtjxAH8uaP0',
      summary: 'Missing values, duplicates, types, ranges, and joins — with a repeatable checklist.',
      quiz: [
        {
          id: 'q1',
          question: 'Which is most important before modeling?',
          options: ['Perfect charts', 'Data type and missing-value sanity checks', 'Fancy architecture', 'Random sampling only'],
          answerIndex: 1,
        },
      ],
    },
  ],
  'cyber-security': [
    {
      id: 'sec-intro',
      courseId: 'cyber-security',
      title: 'Security Threats in Plain English',
      durationMinutes: 9,
      videoKind: 'youtube',
      youtubeId: '9HOpanT0GRs',
      webUrl: 'https://www.youtube.com/watch?v=9HOpanT0GRs',
      summary: 'Understand attackers, common attack paths, and what defenders prioritize.',
      quiz: [
        {
          id: 'q1',
          question: 'Least privilege means:',
          options: ['Everyone is admin', 'Access only what you need to do the job', 'No logs needed', 'Passwords are optional'],
          answerIndex: 1,
        },
      ],
    },
    {
      id: 'sec-logging',
      courseId: 'cyber-security',
      title: 'Logging, Alerts, and Incident Basics',
      durationMinutes: 11,
      videoKind: 'youtube',
      youtubeId: '9HOpanT0GRs',
      webUrl: 'https://www.youtube.com/watch?v=9HOpanT0GRs',
      summary: 'What to log, how to alert, and how to respond when something suspicious happens.',
      quiz: [
        {
          id: 'q1',
          question: 'A useful alert should be:',
          options: ['Noisy always', 'Actionable and tied to a playbook', 'Only visual', 'Hidden from responders'],
          answerIndex: 1,
        },
      ],
    },
  ],
  devops: [
    {
      id: 'devops-cicd',
      courseId: 'devops',
      title: 'CI/CD Fundamentals',
      durationMinutes: 10,
      videoKind: 'youtube',
      youtubeId: 'fqMOX6JJhGo',
      webUrl: 'https://www.youtube.com/watch?v=fqMOX6JJhGo',
      summary: 'Build → test → deploy loops, quality gates, and safe releases.',
      quiz: [
        {
          id: 'q1',
          question: 'A deployment strategy that reduces risk is:',
          options: ['No tests', 'Canary/gradual rollout', 'Manual copy/paste', 'No monitoring'],
          answerIndex: 1,
        },
      ],
    },
    {
      id: 'devops-containers',
      courseId: 'devops',
      title: 'Containers & Images',
      durationMinutes: 12,
      videoKind: 'youtube',
      youtubeId: 'fqMOX6JJhGo',
      webUrl: 'https://www.youtube.com/watch?v=fqMOX6JJhGo',
      summary: 'Images, registries, and the basics of packaging an app for consistent environments.',
      quiz: [
        {
          id: 'q1',
          question: 'A container image is best described as:',
          options: ['A running process', 'A packaged filesystem + metadata to run an app', 'A VM always', 'A source repo'],
          answerIndex: 1,
        },
      ],
    },
  ],
  'machine-learning': [
    {
      id: 'ml-supervised',
      courseId: 'machine-learning',
      title: 'Supervised Learning Basics',
      durationMinutes: 12,
      videoKind: 'youtube',
      youtubeId: 'NWONeJKn6kc',
      webUrl: 'https://www.youtube.com/watch?v=NWONeJKn6kc',
      summary: 'Features/labels, baselines, and how to think about generalization.',
      quiz: [
        {
          id: 'q1',
          question: 'Overfitting means:',
          options: ['Model is too simple', 'Model memorizes training noise and performs poorly on new data', 'No data needed', 'Only happens in NLP'],
          answerIndex: 1,
        },
      ],
    },
    {
      id: 'ml-evaluation',
      courseId: 'machine-learning',
      title: 'Evaluation Metrics',
      durationMinutes: 10,
      videoKind: 'youtube',
      youtubeId: 'NWONeJKn6kc',
      webUrl: 'https://www.youtube.com/watch?v=NWONeJKn6kc',
      summary: 'Accuracy, precision/recall, and how to pick metrics aligned with product goals.',
      quiz: [
        {
          id: 'q1',
          question: 'For rare positive events, a better metric than accuracy is often:',
          options: ['Font size', 'Precision/recall (or F1)', 'Random guessing', 'Only mean'],
          answerIndex: 1,
        },
      ],
    },
  ],
  'generative-ai': [
    {
      id: 'genai-prompts',
      courseId: 'generative-ai',
      title: 'Prompt Patterns for Real Apps',
      durationMinutes: 9,
      videoKind: 'youtube',
      youtubeId: '_ZvnD73m40o',
      webUrl: 'https://www.youtube.com/watch?v=_ZvnD73m40o',
      summary: 'Turn vague tasks into reliable prompts using structure, constraints, and examples.',
      quiz: [
        {
          id: 'q1',
          question: 'A reliable prompt usually includes:',
          options: ['Only a vibe', 'Inputs, constraints, and an explicit output format', 'No examples ever', 'No context'],
          answerIndex: 1,
        },
      ],
    },
    {
      id: 'genai-evals',
      courseId: 'generative-ai',
      title: 'Evals and Regression Testing',
      durationMinutes: 11,
      videoKind: 'youtube',
      youtubeId: '_ZvnD73m40o',
      webUrl: 'https://www.youtube.com/watch?v=_ZvnD73m40o',
      summary: 'Create test sets, measure quality, and prevent regressions as prompts and models change.',
      quiz: [
        {
          id: 'q1',
          question: 'A regression eval is used to:',
          options: ['Make UI darker', 'Detect quality drops after changes', 'Delete logs', 'Avoid tests'],
          answerIndex: 1,
        },
      ],
    },
  ],
};

export const lessonsByCourseId: Record<string, Lesson[]> = withTenQuizzes(baseLessonsByCourseId);

function withTenQuizzes(input: Record<string, Lesson[]>): Record<string, Lesson[]> {
  const out: Record<string, Lesson[]> = {};

  for (const [courseId, lessons] of Object.entries(input)) {
    out[courseId] = lessons.map((lesson) => ({
      ...lesson,
      quiz: ensureTenQuiz({
        courseId,
        lessonId: lesson.id,
        title: lesson.title,
        summary: lesson.summary,
        quiz: lesson.quiz,
      }),
    }));
  }

  return out;
}

function ensureTenQuiz(params: {
  courseId: string;
  lessonId: string;
  title: string;
  summary: string;
  quiz: Lesson['quiz'];
}): Lesson['quiz'] {
  const existing = params.quiz ?? [];
  const next: Lesson['quiz'] = [...existing];
  const topic = `${params.courseId}: ${params.title}`;

  const bank: Array<{ question: string; options: string[]; answerIndex: number }> = [
    {
      question: `Which statement best captures the main idea of “${params.title}”?`,
      options: ['A minor UI detail', 'A key concept that affects how you design and debug systems', 'Only a marketing term', 'Unrelated to real projects'],
      answerIndex: 1,
    },
    {
      question: `A good next step after learning “${params.title}” is to:`,
      options: ['Avoid practice', 'Apply it to a small example and write down your checklist', 'Memorize only definitions', 'Skip feedback'],
      answerIndex: 1,
    },
    {
      question: `When you’re confused about ${topic}, the most helpful move is usually to:`,
      options: ['Add more complexity', 'Break it into inputs → steps → outputs and test each step', 'Guess randomly', 'Ignore constraints'],
      answerIndex: 1,
    },
    {
      question: `Which is a strong learning signal for this lesson?`,
      options: ['You can explain it and apply it to a new example', 'You can repeat the title', 'You watched at 2× speed', 'You scrolled the page'],
      answerIndex: 0,
    },
    {
      question: `A common mistake with ${topic} is:`,
      options: ['Thinking tradeoffs don’t exist', 'Using constraints and validation', 'Writing down assumptions', 'Testing edge cases'],
      answerIndex: 0,
    },
    {
      question: `If a result looks wrong, what should you check first?`,
      options: ['Assumptions and inputs', 'The app icon', 'Only the final output', 'Nothing—ship it'],
      answerIndex: 0,
    },
    {
      question: `Which approach best improves reliability?`,
      options: ['Add a simple checklist and verify against examples', 'Remove measurements', 'Rely on vibes', 'Avoid iteration'],
      answerIndex: 0,
    },
    {
      question: `Which sentence is most aligned with the lesson summary?`,
      options: ['Small, consistent improvements beat random changes', `“${params.summary}”`, 'Never test anything', 'Only focus on aesthetics'],
      answerIndex: 1,
    },
    {
      question: `What is the best way to retain this topic long-term?`,
      options: ['Spaced repetition + practice questions', 'One long cram session', 'Never revisit it', 'Only read comments'],
      answerIndex: 0,
    },
    {
      question: `Which is the best indicator you’re ready to move on?`,
      options: ['You can teach it briefly and solve a small exercise', 'You feel busy', 'You opened many tabs', 'You changed themes'],
      answerIndex: 0,
    },
  ];

  let i = 0;
  while (next.length < 10) {
    const item = bank[i % bank.length];
    const id = `q${next.length + 1}`;
    next.push({ id, question: item.question, options: item.options, answerIndex: item.answerIndex });
    i += 1;
  }

  return next.slice(0, 10).map((q, idx) => ({ ...q, id: `q${idx + 1}` }));
}
