// scheduler.js
// courses: array of normalize() outputs from parser.js
// filters: { freeDays: ['Fri'], earliest: 480, latest: 1080, openOnly: true }
//          earliest/latest are minutes since midnight (8:00AM = 480, 6:00PM = 1080)

// Two slots clash if same day and each starts before the other ends.
// Strict "<" means back-to-back classes (end 10:00, start 10:00) do NOT clash.
const slotsOverlap = (a, b) => a.day === b.day && a.start < b.end && b.start < a.end;

// ISO dates (YYYY-MM-DD) compare correctly as strings. Missing dates -> assume overlap (safe side).
const datesOverlap = (a, b) => !a || !b || (a.start <= b.end && b.start <= a.end);

const optionConflict = (x, y) =>
  datesOverlap(x.dates, y.dates) && x.slots.some((s) => y.slots.some((t) => slotsOverlap(s, t)));

const isOpen = (opt) => /^open$/i.test(opt.status);

function buildCandidate(course, opt) {
  const slots = opt.sections.flatMap((key) => course.sections[key].slots);
  const hidden = opt.sections.some((k) => course.sections[k].conflict); // CLiC hides times: "Time Conflict"
  return { course: course.course, option: opt.option, sections: opt.sections, dates: opt.dates, slots, hidden, opt };
}

// Filters are per slot, so they can be applied to each option on its own
// BEFORE searching. That shrinks every course's pool first.
function passes(c, f) {
  if (c.slots.some((s) => s.error)) return false; // couldn't parse a time -> don't guess
  if (c.opt.clickable === false) return false; // can't be selected on CLiC
  if (c.hidden) return false; // clashes with a class you already enrolled in
  if (f.openOnly && !isOpen(c.opt)) return false;
  for (const s of c.slots) {
    if (f.freeDays?.includes(s.day)) return false;
    if (f.earliest != null && s.start < f.earliest) return false;
    if (f.latest != null && s.end > f.latest) return false;
  }
  // LEC and TUT of the same option must not clash with each other
  for (let i = 0; i < c.slots.length; i++)
    for (let j = i + 1; j < c.slots.length; j++)
      if (slotsOverlap(c.slots[i], c.slots[j])) return false;
  return true;
}

export function generate(courses, filters = {}, { count = 5, maxNodes = 200000 } = {}) {
  const f = { openOnly: true, ...filters };

  const pools = courses.map((course) => ({
    course: course.course,
    cands: course.options.map((o) => buildCandidate(course, o)).filter((c) => passes(c, f)),
  }));

  // If any course has zero options left, no schedule can exist. Say which one.
  const dead = pools.find((p) => p.cands.length === 0);
  if (dead) return { schedules: [], total: 0, truncated: false, blockedBy: dead.course };

  // Fewest options first -> dead ends are found earlier.
  const order = [...pools].sort((a, b) => a.cands.length - b.cands.length);

  const chosen = [];
  const reservoir = [];
  let nodes = 0, total = 0, truncated = false;

  function dfs(i) {
    if (truncated) return;
    if (i === order.length) {
      total++;
      // Reservoir sampling: after n solutions each one has had probability count/n
      // of being in the sample, so the pick is uniform over everything enumerated.
      const snap = [...chosen];
      if (reservoir.length < count) reservoir.push(snap);
      else {
        const j = Math.floor(Math.random() * total);
        if (j < count) reservoir[j] = snap;
      }
      return;
    }
    for (const cand of order[i].cands) {
      if (++nodes > maxNodes) { truncated = true; return; }
      if (chosen.some((c) => optionConflict(c, cand))) continue;
      chosen.push(cand);
      dfs(i + 1);
      chosen.pop();
    }
  }
  dfs(0);

  const schedules = reservoir.map((combo) =>
    courses.map((c) => combo.find((x) => x.course === c.course)) // back to the user's course order
  );
  return { schedules, total, truncated, blockedBy: null };
}
