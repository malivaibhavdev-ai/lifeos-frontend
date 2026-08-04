import dayjs from 'dayjs';

const TAG_PATTERN = /#([a-zA-Z0-9_-]+)/g;
const CATEGORY_PATTERN = /@([a-zA-Z0-9_-]+)/;
const PRIORITY_PATTERN = /!(urgent|high|medium|low)\b/i;

const TIME_12H_PATTERN = /\b(\d{1,2})(:(\d{2}))?\s?(am|pm)\b/i;
const TIME_24H_PATTERN = /\b([01]?\d|2[0-3]):([0-5]\d)\b/;

const WEEKDAY_ALIASES = {
  sun: 0, sunday: 0,
  mon: 1, monday: 1,
  tue: 2, tues: 2, tuesday: 2,
  wed: 3, wednesday: 3,
  thu: 4, thur: 4, thurs: 4, thursday: 4,
  fri: 5, friday: 5,
  sat: 6, saturday: 6,
};
const WEEKDAY_PATTERN = new RegExp(`\\b(${Object.keys(WEEKDAY_ALIASES).join('|')})\\b`, 'i');
const NEXT_WEEKDAY_PATTERN = new RegExp(`\\bnext (${Object.keys(WEEKDAY_ALIASES).join('|')})\\b`, 'i');

const MONTH_ALIASES = {
  jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2, apr: 3, april: 3,
  may: 4, jun: 5, june: 5, jul: 6, july: 6, aug: 7, august: 7,
  sep: 8, sept: 8, september: 8, oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11,
};
const MONTH_DAY_PATTERN = new RegExp(
  `\\b(${Object.keys(MONTH_ALIASES).join('|')})\\.?\\s+(\\d{1,2})(st|nd|rd|th)?\\b`,
  'i'
);
const ISO_DATE_PATTERN = /\b(\d{4})-(\d{2})-(\d{2})\b/;
const SLASH_DATE_PATTERN = /\b(\d{1,2})\/(\d{1,2})(\/(\d{2,4}))?\b/;
const RELATIVE_PATTERN = /\bin (\d+)\s?(day|days|week|weeks|month|months)\b/i;

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function removeFirst(text, matchText) {
  return text.replace(new RegExp(`\\b${escapeRegExp(matchText)}\\b`, 'i'), ' ');
}

// NOTE on "next <weekday>" vs plain "<weekday>": both resolve to the same
// date — the next upcoming occurrence of that weekday, strictly after today
// (never today itself; use the literal word "today" for that). Some apps
// treat "next monday" as skipping an extra week when today is close to
// Monday — we deliberately don't, since that reading is inconsistently
// expected by users and much harder to predict. This is documented here so
// the behavior is a decision, not an accident.
function extractDate(text, now) {
  const lower = text.toLowerCase();

  if (/\btoday\b/.test(lower)) {
    return { date: dayjs(now).startOf('day'), matchText: 'today', timeSet: false };
  }
  if (/\btonight\b/.test(lower)) {
    return { date: dayjs(now).startOf('day').hour(20), matchText: 'tonight', timeSet: true };
  }
  if (/\btomorrow\b/.test(lower)) {
    return { date: dayjs(now).add(1, 'day').startOf('day'), matchText: 'tomorrow', timeSet: false };
  }

  const relativeMatch = lower.match(RELATIVE_PATTERN);
  if (relativeMatch) {
    const amount = parseInt(relativeMatch[1], 10);
    const unitWord = relativeMatch[2];
    const unit = unitWord.startsWith('day') ? 'day' : unitWord.startsWith('week') ? 'week' : 'month';
    return { date: dayjs(now).add(amount, unit).startOf('day'), matchText: relativeMatch[0], timeSet: false };
  }

  const nextWeekdayMatch = lower.match(NEXT_WEEKDAY_PATTERN);
  const weekdayMatch = nextWeekdayMatch ?? lower.match(WEEKDAY_PATTERN);
  if (weekdayMatch) {
    const targetDow = WEEKDAY_ALIASES[weekdayMatch[1]];
    let date = dayjs(now).startOf('day');
    do {
      date = date.add(1, 'day');
    } while (date.day() !== targetDow);
    return { date, matchText: weekdayMatch[0], timeSet: false };
  }

  const isoMatch = lower.match(ISO_DATE_PATTERN);
  if (isoMatch) {
    return { date: dayjs(`${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`).startOf('day'), matchText: isoMatch[0], timeSet: false };
  }

  const monthDayMatch = lower.match(MONTH_DAY_PATTERN);
  if (monthDayMatch) {
    const month = MONTH_ALIASES[monthDayMatch[1]];
    const day = parseInt(monthDayMatch[2], 10);
    let date = dayjs(now).month(month).date(day).startOf('day');
    if (date.isBefore(dayjs(now).startOf('day'))) date = date.add(1, 'year');
    return { date, matchText: monthDayMatch[0], timeSet: false };
  }

  const slashMatch = lower.match(SLASH_DATE_PATTERN);
  if (slashMatch) {
    const month = parseInt(slashMatch[1], 10) - 1;
    const day = parseInt(slashMatch[2], 10);
    const now_ = dayjs(now);
    let year = now_.year();
    if (slashMatch[4]) {
      year = slashMatch[4].length === 2 ? 2000 + parseInt(slashMatch[4], 10) : parseInt(slashMatch[4], 10);
    }
    let date = now_.year(year).month(month).date(day).startOf('day');
    if (!slashMatch[4] && date.isBefore(now_.startOf('day'))) date = date.add(1, 'year');
    return { date, matchText: slashMatch[0], timeSet: false };
  }

  return null;
}

function extractTime(text) {
  const match12 = text.match(TIME_12H_PATTERN);
  if (match12) {
    let hour = parseInt(match12[1], 10) % 12;
    const minute = match12[3] ? parseInt(match12[3], 10) : 0;
    if (match12[4].toLowerCase() === 'pm') hour += 12;
    return { hour, minute, matchText: match12[0] };
  }

  const match24 = text.match(TIME_24H_PATTERN);
  if (match24) {
    return { hour: parseInt(match24[1], 10), minute: parseInt(match24[2], 10), matchText: match24[0] };
  }

  return null;
}

function cleanTitle(text, fallback) {
  const cleaned = text
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s,.\-–—]+|[\s,.\-–—]+$/g, '')
    .trim();
  return cleaned || fallback.trim();
}

// Deterministic natural-language quick-add parser — no network call, no LLM.
// Recognizes: #tags, @category, !priority, and a broad set of date/time
// phrases (today/tomorrow/tonight, weekdays, "next <weekday>", "in N
// days/weeks/months", "jan 5", "1/5", ISO dates, and 12h/24h times).
export function parseQuickAddText(rawText, { now = new Date() } = {}) {
  const originalTitle = rawText;
  let working = rawText;

  const tags = [];
  working = working.replace(TAG_PATTERN, (_match, tag) => {
    tags.push(tag.toLowerCase());
    return ' ';
  });

  let category = null;
  const categoryMatch = working.match(CATEGORY_PATTERN);
  if (categoryMatch) {
    category = categoryMatch[1];
    working = working.replace(categoryMatch[0], ' ');
  }

  let priority = null;
  const priorityMatch = working.match(PRIORITY_PATTERN);
  if (priorityMatch) {
    priority = priorityMatch[1].toLowerCase();
    working = working.replace(priorityMatch[0], ' ');
  }

  const dateResult = extractDate(working, now);
  let dueDate = null;
  if (dateResult) {
    dueDate = dateResult.date;
    working = removeFirst(working, dateResult.matchText);
  }

  const timeResult = extractTime(working);
  if (timeResult) {
    working = removeFirst(working, timeResult.matchText);
    if (!dueDate) dueDate = dayjs(now).startOf('day');
    dueDate = dueDate.hour(timeResult.hour).minute(timeResult.minute).second(0).millisecond(0);
  }

  return {
    title: cleanTitle(working, originalTitle),
    dueDate: dueDate ? dueDate.toDate() : null,
    priority,
    tags,
    category,
  };
}
