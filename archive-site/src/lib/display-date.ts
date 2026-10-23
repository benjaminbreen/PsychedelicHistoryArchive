const DATE_IN_TEXT =
  /(?:\d{1,2} )?(?:January|February|March|April|May|June|July|August|September|October|November|December)(?: \d{1,2},?)? \d{3,4}|\d{3,4}/;

// Compact date for cards and tables. Editorial asides such as "(this translation published 1914)" or
// "; codified as Oregon Laws 2021" stay on the source page, where the full display date is shown.
export function shortDisplayDate(displayDate: string | null | undefined) {
  const head = (displayDate ?? "").split(/\s*[(;]/)[0].trim();
  if (!head || /^(c\.|ca\.|\d|January|February|March|April|May|June|July|August|September|October|November|December)/.test(head)) {
    return head;
  }
  // Lead-ins like "Approved by voters" or "Patented from": keep only the date itself.
  return head.match(DATE_IN_TEXT)?.[0] ?? head;
}

// Card kicker such as "Manuscript · 1541"; the catch-all "Source" type adds nothing, so it is dropped.
export function sourceKicker(type: string, displayDate: string | null | undefined) {
  const date = shortDisplayDate(displayDate);
  if (type === "Source") return date;
  return date ? `${type} · ${date}` : type;
}
