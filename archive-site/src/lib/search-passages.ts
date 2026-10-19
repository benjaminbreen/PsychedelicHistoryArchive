import type { SearchPassage } from "@/lib/search-types";

// Picks the one to three consecutive sentences in a matched chunk that best answer
// the query, with a little surrounding context, for bolded display in results.

const MAX_HIGHLIGHT_SENTENCES = 3;
const CONTEXT_CHARS = 140;
const MAX_SENTENCE_CHARS = 420;

export function splitSentences(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const parts = clean.match(/[^.!?;]+(?:[.!?;]+["'”’)\]]*|$)\s*/g) ?? [clean];
  const sentences: string[] = [];
  for (const raw of parts) {
    const part = raw.trim();
    if (!part) continue;
    // Abbreviations and initials ("Dr.", "R. E.") make tiny fragments; fold them forward.
    if (sentences.length && sentences[sentences.length - 1].length < 25) {
      sentences[sentences.length - 1] += ` ${part}`;
    } else if (part.length > MAX_SENTENCE_CHARS) {
      sentences.push(...(part.match(new RegExp(`.{1,${MAX_SENTENCE_CHARS}}(?:\\s|$)`, "g")) ?? [part]).map((s) => s.trim()));
    } else {
      sentences.push(part);
    }
  }
  return sentences;
}

export function keywordSentenceScores(sentences: string[], query: string) {
  const terms = normalize(query).split(/\s+/).filter((term) => term.length > 1);
  return sentences.map((sentence) => {
    const text = normalize(sentence);
    return terms.reduce((total, term) => {
      const stem = term.length > 4 ? term.replace(/(es|s|ing|ed)$/, "") : term;
      return total + (text.includes(term) ? 1 : text.includes(stem) ? 0.7 : 0);
    }, 0);
  });
}

export function buildPassage(sentences: string[], scores: number[]): SearchPassage | undefined {
  if (!sentences.length) return undefined;
  const best = scores.reduce((top, value, index) => (value > scores[top] ? index : top), 0);
  if (!(scores[best] > 0)) return undefined;

  // Grow the window around the best sentence while neighbours stay nearly as close.
  let start = best;
  let end = best;
  const keep = (index: number) => index >= 0 && index < sentences.length && scores[index] >= scores[best] * 0.82;
  while (end - start + 1 < MAX_HIGHLIGHT_SENTENCES) {
    const left = keep(start - 1) ? scores[start - 1] : -Infinity;
    const right = keep(end + 1) ? scores[end + 1] : -Infinity;
    if (left === -Infinity && right === -Infinity) break;
    if (left >= right) start -= 1;
    else end += 1;
  }

  const before = sentences.slice(0, start).join(" ");
  const after = sentences.slice(end + 1).join(" ");
  return {
    before: before ? trimStart(before) : undefined,
    highlight: sentences.slice(start, end + 1).join(" "),
    after: after ? trimEnd(after) : undefined,
  };
}

export function cosine(a: number[], b: number[]) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return normA && normB ? dot / Math.sqrt(normA * normB) : 0;
}

function trimStart(text: string) {
  if (text.length <= CONTEXT_CHARS) return text;
  const cut = text.slice(-CONTEXT_CHARS);
  return `…${cut.slice(cut.indexOf(" ") + 1)}`;
}

function trimEnd(text: string) {
  if (text.length <= CONTEXT_CHARS) return text;
  const cut = text.slice(0, CONTEXT_CHARS);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

function normalize(value: string) {
  return value.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
}
