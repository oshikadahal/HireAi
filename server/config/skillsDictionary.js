/**
 * A curated dictionary of common tech & professional skills.
 * Used by services/resumeParser.js to extract skills from raw resume text
 * without needing any external AI API.
 *
 * Keep this list lowercase; matching is case-insensitive.
 */
module.exports = [
  // Languages
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'c', 'go', 'golang',
  'rust', 'php', 'ruby', 'swift', 'kotlin', 'scala', 'r', 'dart', 'sql', 'perl', 'matlab',

  // Frontend
  'react', 'react.js', 'reactjs', 'redux', 'redux toolkit', 'vue', 'vue.js', 'angular',
  'next.js', 'nextjs', 'nuxt.js', 'svelte', 'html', 'html5', 'css', 'css3', 'sass', 'scss',
  'less', 'tailwind', 'tailwindcss', 'bootstrap', 'material ui', 'mui', 'webpack', 'vite',
  'jquery', 'three.js', 'd3.js', 'framer motion',

  // Backend
  'node.js', 'nodejs', 'node', 'express', 'express.js', 'django', 'flask', 'fastapi',
  'spring', 'spring boot', 'laravel', 'ruby on rails', 'rails', '.net', 'asp.net',
  'graphql', 'rest api', 'restful api', 'grpc', 'microservices', 'websocket', 'socket.io',

  // Databases
  'mongodb', 'mongo', 'mysql', 'postgresql', 'postgres', 'sqlite', 'redis', 'oracle',
  'firebase', 'firestore', 'dynamodb', 'cassandra', 'elasticsearch', 'supabase', 'mariadb',

  // Cloud & DevOps
  'aws', 'amazon web services', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes',
  'k8s', 'jenkins', 'ci/cd', 'terraform', 'ansible', 'nginx', 'linux', 'bash', 'shell scripting',
  'git', 'github', 'gitlab', 'bitbucket', 'github actions', 'cloudflare', 'heroku', 'vercel', 'netlify',

  // Data / AI / ML
  'machine learning', 'deep learning', 'data science', 'data analysis', 'pandas', 'numpy',
  'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'nlp', 'computer vision', 'opencv',
  'tableau', 'power bi', 'excel', 'spark', 'hadoop', 'etl', 'data visualization', 'llm',
  'generative ai', 'prompt engineering',

  // Mobile
  'android', 'ios', 'react native', 'flutter', 'swift ui', 'xamarin',

  // Testing
  'jest', 'mocha', 'chai', 'cypress', 'selenium', 'playwright', 'unit testing',
  'integration testing', 'test automation', 'tdd',

  // Design
  'figma', 'adobe xd', 'sketch', 'photoshop', 'illustrator', 'ui/ux', 'ui design', 'ux design',
  'wireframing', 'prototyping', 'user research',

  // Project / Soft skills
  'agile', 'scrum', 'kanban', 'jira', 'confluence', 'project management', 'product management',
  'leadership', 'communication', 'team management', 'stakeholder management', 'problem solving',
  'critical thinking', 'time management', 'public speaking', 'negotiation', 'mentoring',

  // Business
  'seo', 'sem', 'digital marketing', 'content marketing', 'social media marketing',
  'google analytics', 'salesforce', 'crm', 'business analysis', 'financial modeling',
  'accounting', 'excel modeling', 'powerpoint', 'copywriting',
];
