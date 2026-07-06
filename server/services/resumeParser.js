const fs = require('fs');
const pdfParse = require('pdf-parse');
const SKILLS = require('../config/skillsDictionary');

/**
 * Extracts raw text from a PDF file on disk.
 */
async function extractText(absoluteFilePath) {
  const buffer = fs.readFileSync(absoluteFilePath);
  const data = await pdfParse(buffer);
  return data.text || '';
}

/**
 * Escapes a string for safe use inside a RegExp.
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Scans resume text for every skill in the dictionary using word-boundary matching
 * (so "go" doesn't match inside "going", but "c++" / "c#" still match correctly).
 */
function extractSkillsFromText(text) {
  const lower = text.toLowerCase();
  const found = new Set();

  for (const skill of SKILLS) {
    const escaped = escapeRegex(skill.toLowerCase());
    // Use word boundaries for alphanumeric skills; for symbol-heavy ones (c++, c#) just do a plain search.
    const hasSymbols = /[^a-z0-9 .]/i.test(skill);
    const pattern = hasSymbols
      ? escaped
      : `\\b${escaped}\\b`;
    const regex = new RegExp(pattern, 'i');
    if (regex.test(lower)) found.add(skill);
  }

  return Array.from(found);
}

/**
 * Very lightweight heuristic education/experience line extraction —
 * looks for common section headers and grabs a few lines under them.
 * This is best-effort and meant to give the candidate a head start, not be perfect.
 */
function extractSectionSnippets(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const lower = lines.map((l) => l.toLowerCase());

  const grabAfter = (headerRegex, maxLines = 4) => {
    const idx = lower.findIndex((l) => headerRegex.test(l));
    if (idx === -1) return [];
    return lines.slice(idx + 1, idx + 1 + maxLines).filter((l) => l.length > 3 && l.length < 140);
  };

  return {
    education: grabAfter(/^education|academic background/),
    experience: grabAfter(/^experience|work history|employment/),
  };
}

/**
 * Main entry point: parse a resume PDF already saved at `absoluteFilePath`.
 * Returns { skills, education, experience, rawText }
 */
exports.parseResumeFile = async (absoluteFilePath) => {
  try {
    const text = await extractText(absoluteFilePath);
    const skills = extractSkillsFromText(text);
    const { education, experience } = extractSectionSnippets(text);
    return {
      skills,
      education,
      experience,
      rawText: text.slice(0, 8000), // cap stored text size
      success: true,
    };
  } catch (err) {
    console.error('Resume parsing error:', err.message);
    return { skills: [], education: [], experience: [], rawText: '', success: false };
  }
};

exports.extractSkillsFromText = extractSkillsFromText;
