const DAY = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
  friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};

const clean = (s) => (s ?? '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();

const toMin = (h, m, ap) =>
  ((Number(h) % 12) + (ap.toUpperCase() === 'PM' ? 12 : 0)) * 60 + Number(m);

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
  if (/closed/i.test(t)) return { status: 'closed', open: 0, total: null };
  return { status: 'unknown', raw: t }; // e.g. a wait-list format we haven't seen yet
}

const perComponent = (tr, cls) => [...tr.querySelectorAll(`td.${cls} > div > div`)];
const valueSpans = (el) => [...el.querySelectorAll('.ps_box-value')];

function parseRow(tr) {
  const labels = perComponent(tr, 'CMPNT_CLASS_NBR');
  const times = perComponent(tr, 'DAYS_TIMES');
  const rooms = perComponent(tr, 'ROOM');
  const seats = perComponent(tr, 'SEATS');
  const warnings = [];

  if (new Set([labels.length, times.length, rooms.length || labels.length, seats.length || labels.length]).size > 1) {
    warnings.push('component count differs between columns');
  }

  const components = labels.map((label, i) => {
    const [, type, section] = clean(label.textContent).match(COMP_RE) ?? [];
    if (/time\s*conflict/i.test(clean(times[i]?.textContent))) {
      return {
        type, section, conflict: true, slots: [],
        seats: seats[i] ? parseSeats(seats[i].textContent) : { status: 'unknown' },
      };
    }
    const tSpans = times[i] ? valueSpans(times[i]) : [];
    const rSpans = rooms[i] ? valueSpans(rooms[i]) : [];
    if (rSpans.length && tSpans.length !== rSpans.length) warnings.push(`${section}: slot/room count differs`);
    return {
      type,
      section,
      slots: tSpans.map((s, j) => ({
        ...parseSlot(s.textContent),
        room: clean(rSpans[j]?.textContent),
      })),
      seats: seats[i] ? parseSeats(seats[i].textContent) : { status: 'unknown' },
    };
  });

  const d = clean(tr.querySelector('td.DATES')?.textContent)
    .match(/(\d{2})\/(\d{2})\/(\d{4})\s*-\s*(\d{2})\/(\d{2})\/(\d{4})/);

  return {
    option: Number(clean(tr.querySelector('td.OPTION_NSFF')?.textContent)),
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

  const label = clean(root.querySelector('[id$="SSR_MSG_TEXT"]')?.textContent);
  const declared = Number(label.match(/(\d+)\s+options?/i)?.[1]) || null;

  return { options, declared, countOk: declared === options.length };
}

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
  for (const o of opts) o.enrolledConflict = o.sections.some((k) => sections[k].conflict);
  return { course: courseCode, name: courseName, sections, options: opts };
}

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
        term: clean(tr.querySelector('td.CRSE_WHEN1')?.textContent),
        statusText: clean(tr.querySelector('td.CRSE_STAT1')?.textContent),
      };
    })
    .filter(Boolean);
}

export function detectPage(root = document) {
  if (root.querySelector('td.OPTION_NSFF')) return 'course-options';
  if (root.querySelector('td.CRSE_NAME1')) return 'course-list';
  return 'other';
}

export function parseCourseHeader(root = document) {
  const txt = (suffix) =>
    clean(root.querySelector(`span.ps_box-value[id$="${suffix}"]`)?.textContent);
  const id = parseCourseName(txt('SSR_CRSE_INFO_V_SSS_SUBJ_CATLG'));
  if (!id) return null;
  const unitsRaw = txt('SSR_CLSRCH_F_WK_UNITS_RANGE');
  const units = Number(unitsRaw.match(/\d+(\.\d+)?/)?.[0]);
  return {
    ...id,
    name: txt('SSR_CRSE_INFO_V_COURSE_TITLE_LONG'),
    units: Number.isFinite(units) ? units : null,
    unitsRaw,
  };
}

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

export function findTermLabel(root = document) {
  const text = clean((root.body ?? root).textContent);
  return text.match(/Trimester\s+[A-Za-z]+\/[A-Za-z]+\s+\d{4}/)?.[0] ?? null;
}
