// parser.js
// Pure functions: take a DOM root (document or Element), return plain objects.
// No extension APIs in here, so the same file runs in the content script
// and in Node tests (jsdom).

const DAY = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
  friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};

// Normalise whitespace. \u00a0 (&nbsp;) is in the dates cell, so handle it explicitly.
const clean = (s) => (s ?? '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();

// 12h -> minutes since midnight.
// h % 12 maps both 12AM and 12PM to 0, then PM adds 12 hours.
// 12:00AM -> 0, 1:00PM -> 780, 12:00PM -> 720.
const toMin = (h, m, ap) =>
  ((Number(h) % 12) + (ap.toUpperCase() === 'PM' ? 12 : 0)) * 60 + Number(m);

// textContent drops the <br> between day and time ("Thursday6:00PM to 7:00PM"),
// innerText keeps it as a newline. \s* (not \s+) handles both.
const SLOT_RE =
  /^([A-Za-z]+)\s*(\d{1,2}):(\d{2})\s*(AM|PM)\s*to\s*(\d{1,2}):(\d{2})\s*(AM|PM)$/i;

const COMP_RE = /Component\s+(\w+)\s*-\s*Class Sect\s+(\w+)/i;

export function parseSlot(text) {
  const m = clean(text).match(SLOT_RE);
  const day = m && DAY[m[1].toLowerCase()];
  if (!m || !day) return { error: true, raw: clean(text) };
  return { day, start: toMin(m[2], m[3], m[4]), end: toMin(m[5], m[6], m[7]) };
}

export function parseSeats(text) {
  const t = clean(text);
  const m = t.match(/Open Seats\s+(\d+)\s+of\s+(\d+)/i);
  if (m) return { status: 'open', open: Number(m[1]), total: Number(m[2]) };
  // Closed rows only say "Closed", so the total is unknown.
  if (/closed/i.test(t)) return { status: 'closed', open: 0, total: null };
  return { status: 'unknown', raw: t }; // e.g. a wait-list format we haven't seen yet
}

// One <td> per column; inside it: td > div.ps_box-group > one div per component.
// Class names (CMPNT_CLASS_NBR, DAYS_TIMES, ...) come from PeopleSoft field names,
// unlike the ids, which carry a per-page "win32" counter.
const perComponent = (tr, cls) => [...tr.querySelectorAll(`td.${cls} > div > div`)];
const valueSpans = (el) => [...el.querySelectorAll('.ps_box-value')];

function parseRow(tr) {
  const labels = perComponent(tr, 'CMPNT_CLASS_NBR');
  const times = perComponent(tr, 'DAYS_TIMES');
  const rooms = perComponent(tr, 'ROOM');
  const seats = perComponent(tr, 'SEATS');
  const warnings = [];

  // Components are paired by position (i-th label <-> i-th time block <-> ...).
  // If counts differ we can't pair safely, so flag instead of guessing.
  // CLiC drops columns that are empty for a course (e.g. Room for an online class), so a missing
  // Room or Seats column counts as "same as labels". Class and Days/Times must always line up.
  if (new Set([labels.length, times.length, rooms.length || labels.length, seats.length || labels.length]).size > 1) {
    warnings.push('component count differs between columns');
  }

  const components = labels.map((label, i) => {
    const [, type, section] = clean(label.textContent).match(COMP_RE) ?? [];
    // When the student is already enrolled in a clashing class, CLiC replaces this component's
    // days/times with a "Time Conflict" link (and leaves the room empty). Real times are hidden.
    if (/time\s*conflict/i.test(clean(times[i]?.textContent))) {
      return {
        type, section, conflict: true, slots: [],
        seats: seats[i] ? parseSeats(seats[i].textContent) : { status: 'unknown' },
      };
    }
    const tSpans = times[i] ? valueSpans(times[i]) : [];
    const rSpans = rooms[i] ? valueSpans(rooms[i]) : [];
    // No rooms at all is fine (room = ''). Rooms present but a different count means misaligned.
    if (rSpans.length && tSpans.length !== rSpans.length) warnings.push(`${section}: slot/room count differs`);
    return {
      type,
      section,
      // one span per meeting slot; time and room spans are in the same order
      slots: tSpans.map((s, j) => ({
        ...parseSlot(s.textContent),
        room: clean(rSpans[j]?.textContent),
      })),
      seats: seats[i] ? parseSeats(seats[i].textContent) : { status: 'unknown' },
    };
  });

  // Meeting dates are DD/MM/YYYY (28/03/2027 can't be MM/DD).
  const d = clean(tr.querySelector('td.DATES')?.textContent)
    .match(/(\d{2})\/(\d{2})\/(\d{4})\s*-\s*(\d{2})\/(\d{2})\/(\d{4})/);

  return {
    option: Number(clean(tr.querySelector('td.OPTION_NSFF')?.textContent)),
    // status cell has no column class; match the id's tail (prefix has the win counter)
    status: clean(tr.querySelector('[id*="SSR_OPTION_STAT"]')?.textContent),
    clickable: !tr.classList.contains('psc_disabled'),
    dates: d ? { start: `${d[3]}-${d[2]}-${d[1]}`, end: `${d[6]}-${d[5]}-${d[4]}` } : null,
    enrolledConflict: components.some((c) => c.conflict),
    components,
    warnings,
  };
}

export function parseOptionsTable(root = document) {
  const rows = [...root.querySelectorAll('table.ps_grid-flex tbody tr.ps_grid-row')]
    .filter((tr) => tr.querySelector('td.OPTION_NSFF'));
  const options = rows.map(parseRow);

  // Cross-check against the page's own "17 options" label.
  const label = clean(root.querySelector('[id$="SSR_MSG_TEXT"]')?.textContent);
  const declared = Number(label.match(/(\d+)\s+options?/i)?.[1]) || null;

  return { options, declared, countOk: declared === options.length };
}

// Section data (slots, seats) is repeated in every option that uses that section
// (e.g. LEC TC1L appears in options 1-4). Store each section once; options only
// reference them. The scheduler then picks one option per course.
export function normalize(courseCode, courseName, options) {
  const sections = {};
  const opts = options.map((o) => ({
    option: o.option,
    status: o.status,
    clickable: o.clickable,
    dates: o.dates,
    sections: o.components.map((c) => {
      const key = `${c.type}-${c.section}`;
      const incoming = { type: c.type, code: c.section, slots: c.slots, seats: c.seats, conflict: !!c.conflict };
      // Same section can show real times in one option and "Time Conflict" in another: keep the one with times.
      if (!sections[key] || (sections[key].conflict && !incoming.conflict)) sections[key] = incoming;
      return key;
    }),
  }));
  // An option is unusable if any of its sections has hidden times (clashes with your current enrolment).
  for (const o of opts) o.enrolledConflict = o.sections.some((k) => sections[k].conflict);
  return { course: courseCode, name: courseName, sections, options: opts };
}

// ---- Requirement Details page: list of courses ----
// Cell text is "C&nbsp;&nbsp;&nbsp; CP6114"; clean() turns the nbsp run into one space.
// 1st token = category as CLiC shows it ("C", "LS"; meaning not confirmed), 2nd = course code.
export function parseCourseName(text) {
  const m = clean(text).match(/^(\S+)\s+(\S+)$/);
  return m ? { category: m[1], code: m[2] } : null;
}

export function parseCourseList(root = document) {
  const rows = [...root.querySelectorAll('tbody tr.ps_grid-row')]
    .filter((tr) => tr.querySelector('td.CRSE_NAME1'));
  return rows
    .map((tr) => {
      const id = parseCourseName(tr.querySelector('td.CRSE_NAME1')?.textContent);
      return id && {
        ...id,
        name: clean(tr.querySelector('td.CRSE_DESCR1')?.textContent),
        term: clean(tr.querySelector('td.CRSE_WHEN1')?.textContent), // "Trimester Oct/Nov 2026"
        statusText: clean(tr.querySelector('td.CRSE_STAT1')?.textContent), // empty in sample; meaning unknown
      };
    })
    .filter(Boolean);
}

// Both tables are table.ps_grid-flex, so the table class can't tell pages apart.
// Distinguish by a column-specific cell class instead.
export function detectPage(root = document) {
  if (root.querySelector('td.OPTION_NSFF')) return 'course-options';
  if (root.querySelector('td.CRSE_NAME1')) return 'course-list';
  return 'other';
}

// ---- Course Information page: header + options in one call ----
// Header spans have plain ids (no win counter) in the span, and "winNNdiv" ids on the wrapper.
// span.ps_box-value[id$=...] matches the span only, whatever the counter is.
export function parseCourseHeader(root = document) {
  const txt = (suffix) =>
    clean(root.querySelector(`span.ps_box-value[id$="${suffix}"]`)?.textContent);
  const id = parseCourseName(txt('SSR_CRSE_INFO_V_SSS_SUBJ_CATLG')); // "C CP6114"
  if (!id) return null;
  const unitsRaw = txt('SSR_CLSRCH_F_WK_UNITS_RANGE'); // "4.00"; hidden in a collapsed group but in the DOM
  const units = Number(unitsRaw.match(/\d+(\.\d+)?/)?.[0]);
  return {
    ...id,
    name: txt('SSR_CRSE_INFO_V_COURSE_TITLE_LONG'),
    units: Number.isFinite(units) ? units : null,
    unitsRaw,
  };
}

// What the Retrieve button calls. ok=false means: show `problems`, do not save.
export function parseCoursePage(root = document) {
  const header = parseCourseHeader(root);
  const table = parseOptionsTable(root);
  const problems = [];
  if (!header) problems.push('course header not found');
  if (!table.countOk) problems.push(`parsed ${table.options.length} options, page says ${table.declared}`);
  for (const o of table.options) {
    o.warnings.forEach((w) => problems.push(`option ${o.option}: ${w}`));
    if (o.components.some((c) => c.slots.some((s) => s.error))) {
      problems.push(`option ${o.option}: unparsed time slot`);
    }
  }
  const data = header && {
    ...normalize(header.code, header.name, table.options),
    category: header.category,
    units: header.units,
    retrievedAt: new Date().toISOString(),
  };
  return { ok: problems.length === 0, problems, data };
}

// Trimester label shown at the top of CLiC pages, e.g. "Trimester Oct/Nov 2026".
// It sits outside the options table, so search the page text. Best effort: null if absent.
export function findTermLabel(root = document) {
  const text = clean((root.body ?? root).textContent);
  return text.match(/Trimester\s+[A-Za-z]+\/[A-Za-z]+\s+\d{4}/)?.[0] ?? null;
}
