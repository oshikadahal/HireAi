/**
 * matchService.js
 * ─────────────────────────────────────────────────────────────
 * Provides the "AI" features of HireAI:
 *   1. scoreMatch()        – candidate skills vs job skills → 0-100 score
 *   2. recommendJobs()     – ranks open jobs against a candidate's skills
 *   3. generateInterviewQuestions() – question bank by job title/category
 *   4. rankApplications()  – sorts applications by matchScore
 *
 * Everything here runs 100% locally — no API key required, so the app
 * works out of the box. If GEMINI_API_KEY is set in .env, scoreMatch()
 * will attempt to enrich the result with a short AI-written rationale;
 * if that call fails or no key is set, it silently falls back to the
 * local algorithm with zero impact on functionality.
 */

const normalize = (arr = []) =>
  Array.from(new Set(arr.map((s) => String(s).trim().toLowerCase()).filter(Boolean)));

/**
 * Core scoring algorithm: weighted skill overlap.
 * - Base score = % of required job skills the candidate has.
 * - Small bonus for candidates who have *extra* relevant breadth (capped).
 */
function computeLocalScore(candidateSkills, jobSkills) {
  const candidateSet = normalize(candidateSkills);
  const jobSet = normalize(jobSkills);

  if (jobSet.length === 0) {
    return { score: 50, matchedSkills: [], missingSkills: [] };
  }

  const matched = jobSet.filter((skill) => candidateSet.includes(skill));
  const missing = jobSet.filter((skill) => !candidateSet.includes(skill));

  const baseScore = (matched.length / jobSet.length) * 100;
  // Small breadth bonus (max +6) if candidate brings extra skills beyond requirements
  const extras = candidateSet.filter((s) => !jobSet.includes(s)).length;
  const bonus = Math.min(extras, 6);

  const score = Math.max(0, Math.min(100, Math.round(baseScore + (baseScore > 0 ? bonus * 0.5 : 0))));

  return {
    score,
    matchedSkills: matched,
    missingSkills: missing,
  };
}

/**
 * Optional Gemini enrichment — never required, never blocks the response.
 * Uses plain fetch (Node 18+ has it built in), so no extra dependency needed.
 */
async function tryGeminiRationale(candidateSkills, jobTitle, jobDescription, localResult) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const prompt = `You are a recruiting assistant. A candidate with skills [${candidateSkills.join(', ')}] is being matched to the role "${jobTitle}". They matched: [${localResult.matchedSkills.join(', ')}] and are missing: [${localResult.missingSkills.join(', ')}]. In ONE short sentence (under 25 words), give a friendly, encouraging note about this match for the candidate. Reply with plain text only, no markdown.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        signal: AbortSignal.timeout(6000),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? text.trim() : null;
  } catch {
    return null; // Fail silently — local result is already complete and valid
  }
}

/**
 * Public: score a candidate against a job. Always returns a usable result
 * even if the optional AI enrichment is unavailable.
 */
exports.scoreMatch = async ({ candidateSkills = [], jobTitle = '', jobDescription = '', jobSkills = [] }) => {
  const local = computeLocalScore(candidateSkills, jobSkills);
  const note = await tryGeminiRationale(candidateSkills, jobTitle, jobDescription, local);
  return { ...local, note: note || null };
};

/**
 * Synchronous variant for places that don't need the optional AI note
 * (kept separate so hot paths like applying to a job stay fast).
 */
exports.scoreMatchSync = (candidateSkills, jobSkills) => computeLocalScore(candidateSkills, jobSkills);

/**
 * Recommend jobs for a candidate: scores every open job and returns the
 * top N sorted descending, excluding jobs they've already applied to.
 */
exports.recommendJobs = (candidateSkills, jobs, excludeJobIds = [], limit = 5) => {
  const excludeSet = new Set(excludeJobIds.map(String));
  const scored = jobs
    .filter((job) => !excludeSet.has(String(job._id)))
    .map((job) => ({
      job,
      ...computeLocalScore(candidateSkills, job.skillsRequired),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
};

/**
 * Question bank used by generateInterviewQuestions — organized by category
 * so they read naturally for almost any role, with light title-based
 * customization to feel tailored without needing an external LLM.
 */
const TECHNICAL_BANK = [
  'Walk me through a project where you used {skill} in a real-world scenario.',
  'How would you debug a production issue that only appears intermittently?',
  'Describe a time you had to learn a new technology quickly for a project.',
  'What trade-offs would you consider when choosing between two technical approaches?',
  'How do you approach writing tests for the code you produce?',
  'Tell me about the most challenging technical problem you have solved.',
  'How do you keep your technical skills up to date?',
  'Explain a complex technical concept from your field to a non-technical person.',
];

const BEHAVIORAL_BANK = [
  'Tell me about a time you disagreed with a teammate. How did you resolve it?',
  'Describe a situation where you missed a deadline. What did you learn?',
  'How do you prioritize tasks when everything feels urgent?',
  'Tell me about a time you received critical feedback. How did you respond?',
  'Describe a project you are most proud of and why.',
  'How do you handle working with ambiguous or incomplete requirements?',
];

const SITUATIONAL_BANK = [
  'If you joined this team and found undocumented legacy code, what would you do first?',
  'How would you handle a stakeholder who keeps changing requirements late in a project?',
  'If two team members disagree on architecture, how would you help them reach a decision?',
  'How would you onboard yourself quickly into an unfamiliar codebase or domain?',
];

exports.generateInterviewQuestions = (jobTitle = 'this role', skillsRequired = []) => {
  const skill = skillsRequired[0] || 'your core skillset';
  const technical = TECHNICAL_BANK.map((q) => q.replace('{skill}', skill));

  const questions = [
    `What interests you about working as a ${jobTitle}?`,
    ...technical.slice(0, 4),
    ...BEHAVIORAL_BANK.slice(0, 3),
    ...SITUATIONAL_BANK.slice(0, 2),
  ];

  return questions;
};

/**
 * Ranks an array of application documents (must already have matchScore) descending.
 */
exports.rankApplications = (applications) =>
  [...applications].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
