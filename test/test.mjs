// Integration test: jsdom page fixtures -> extension panel (UI clicks) -> storage -> scheduler.
// Ground truth is defined once below; the page HTML is generated from it, and the expected
// plan counts are computed by an independent brute force (different loop order than scheduler.js).
import { JSDOM } from 'jsdom';
import assert from 'node:assert/strict';
import { mountPanel } from '../panel.js';

const T = (h, m = 0) => h * 60 + m;
const L = (t, s, seat, slots) => ({ t, s, seat, slots });
const OPEN = (n, tot) => `Open Seats ${n} of ${tot}`;
const DAYN = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday' };
const to12 = (m) => `${Math.floor(m / 60) % 12 || 12}:${String(m % 60).padStart(2, '0')}${m >= 720 ? 'PM' : 'AM'}`;
const ROOM = 'CQAR2006-FCI CISCO IP C.I. C1';

const COURSES = {
  CP6114: { name: 'PROGRAMMING FUNDAMENTALS', units: '4.00', options: [
    { n: 1, st: 'Open', comps: [L('LEC', 'TC1L', OPEN(53, 160), [['Thu', T(18), T(19)], ['Fri', T(17), T(19)]]), L('TUT', 'TT4L', OPEN(3, 40), [['Wed', T(16), T(18)]])] },
    { n: 2, st: 'Open', comps: [L('LEC', 'TC1L', OPEN(53, 160), [['Thu', T(18), T(19)], ['Fri', T(17), T(19)]]), L('TUT', 'TT3L', OPEN(22, 40), [['Thu', T(16), T(18)]])] },
    { n: 3, st: 'Open', comps: [L('LEC', 'TC5L', OPEN(65, 80), [['Tue', T(14), T(16)], ['Fri', T(17), T(18)]]), L('TUT', 'T15L', OPEN(34, 40), [['Mon', T(8), T(10)]])] },
    { n: 4, st: 'Closed', comps: [L('LEC', 'TC5L', OPEN(65, 80), [['Tue', T(14), T(16)], ['Fri', T(17), T(18)]]), L('TUT', 'T16L', 'Closed', [['Thu', T(16), T(18)]])] },
  ] },
  MA6114: { name: 'CALCULUS', units: '4.00', options: [
    { n: 1, st: 'Open', comps: [L('LEC', 'M1L', OPEN(30, 100), [['Mon', T(9), T(11)], ['Wed', T(9), T(10)]]), L('TUT', 'MT1', OPEN(5, 30), [['Thu', T(10), T(12)]])] },
    { n: 2, st: 'Open', comps: [L('LEC', 'M1L', OPEN(30, 100), [['Mon', T(9), T(11)], ['Wed', T(9), T(10)]]), L('TUT', 'MT2', OPEN(9, 30), [['Fri', T(14), T(16)]])] },
    { n: 3, st: 'Open', comps: [L('LEC', 'M2L', OPEN(12, 100), [['Mon', T(12), T(14)], ['Tue', T(12), T(13)]]), L('TUT', 'MT3', OPEN(7, 30), [['Fri', T(8), T(10)]])] },
    { n: 4, st: 'Open', comps: [L('LEC', 'M3L', OPEN(40, 100), [['Fri', T(9), T(11)], ['Thu', T(9), T(10)]]), L('TUT', 'MT4', OPEN(2, 30), [['Tue', T(15), T(17)]])] },
  ] },
  PT6114: { name: 'PROFESSIONAL DEVELOPMENT', units: '2.00', options: [
    { n: 1, st: 'Open', comps: [L('LEC', 'P1L', OPEN(20, 60), [['Fri', T(8), T(10)]]), L('TUT', 'PT1', OPEN(8, 30), [['Mon', T(14), T(16)]])] },
    { n: 2, st: 'Open', comps: [L('LEC', 'P2L', OPEN(11, 60), [['Wed', T(14), T(16)]])] },
    { n: 3, st: 'Open', comps: [L('LEC', 'P3L', OPEN(25, 60), [['Thu', T(16), T(18)]]), L('TUT', 'PT3', OPEN(6, 30), [['Tue', T(9), T(10)]])] },
    { n: 4, st: 'Closed', comps: [L('LEC', 'P4L', 'Closed', [['Mon', T(9), T(10)]])] },
  ] },
};
const CODES = Object.keys(COURSES);

// ---------- fixtures (same class names / nesting as the real CLiC HTML) ----------
const listPage = () => `<div><table class="ps_grid-flex"><thead><tr><th class="ps_grid-col CRSE_NAME1">Course</th></tr></thead><tbody class="ps_grid-body">
${CODES.map((c) => `<tr class="ps_grid-row psc_rowact">
<td class="ps_grid-cell CRSE_NAME1"><div><span class="ps_box-value">C&nbsp;&nbsp;&nbsp; ${c}</span></div></td>
<td class="ps_grid-cell CRSE_DESCR1"><div><span><a>${COURSES[c].name}</a></span></div></td>
<td class="ps_grid-cell CRSE_UNITS1"><div><span class="ps_box-value">&nbsp;</span></div></td>
<td class="ps_grid-cell CRSE_WHEN1"><div><span class="ps_box-value">Trimester Oct/Nov 2026</span></div></td>
<td class="ps_grid-cell CRSE_STAT1"><div></div></td></tr>`).join('')}
</tbody></table></div>`;

const row = (o, noRoom = false) => `<tr class="ps_grid-row psc_rowact${o.locked ? ' psc_disabled' : ''}">
<td class="ps_grid-cell OPTION_NSFF"><div><div><span><a>${o.n}</a></span></div></div></td>
<td class="ps_grid-cell"><div><div id="win10divSSR_DER_CS_GRP_SSR_OPTION_STAT$${o.n}"><span class="ps_box-value" id="SSR_DER_CS_GRP_SSR_OPTION_STAT$${o.n}">${o.st}</span></div></div></td>
<td class="ps_grid-cell CMPNT_CLASS_NBR"><div>${o.comps.map((c) => `<div class="ps_box-link"><span><a>Component ${c.t} - Class Sect ${c.s} - Class </a></span></div>`).join('')}</div></td>
<td class="ps_grid-cell DATES"><div><div><span class="ps_box-value">09/11/2026&nbsp;- 28/03/2027</span></div></div></td>
<td class="ps_grid-cell DAYS_TIMES"><div>${o.comps.map((c) => c.conflict ? '<div class="ps_box-link"><span><a><img alt="">Time Conflict</a></span></div>' : `<div class="ps_box-longedit">${c.slots.map((s) => `<span class="ps_box-value">${DAYN[s[0]]}<br>${to12(s[1])} to ${to12(s[2])}</span>`).join('')}</div>`).join('')}</div></td>
${noRoom ? '' : `<td class="ps_grid-cell ROOM"><div>${o.comps.map((c) => c.conflict ? '<div class="ps_box-edit"><span class="ps_box-value"></span></div>' : `<div class="ps_box-edit">${c.slots.map(() => `<span class="ps_box-value">${ROOM}</span>`).join('')}</div>`).join('')}</div></td>`}
<td class="ps_grid-cell SEATS"><div>${o.comps.map((c) => `<div class="ps_box-edit"><span class="ps_box-value">${c.seat}</span></div>`).join('')}</div></td>
</tr>`;

const EXTRA = { EN6114: { name: 'ENGLISH', units: '3.00', options: [
  { n: 1, st: 'Open', comps: [{ ...L('LEC', 'E2L', OPEN(10, 50), []), conflict: true }, { ...L('TUT', 'ET1', OPEN(5, 25), []), conflict: true }] },
  { n: 2, st: 'Open', comps: [L('LEC', 'E2L', OPEN(10, 50), [['Mon', T(10), T(12)]]), L('TUT', 'ET2', OPEN(6, 25), [['Tue', T(10), T(11)]])] },
  { n: 3, st: 'Open', comps: [L('LEC', 'E3L', OPEN(12, 50), [['Wed', T(10), T(12)]]), { ...L('TUT', 'ET3', OPEN(7, 25), []), conflict: true }] },
] },
  // single-LEC options, no Room column, "1 - N of N options" label, one row without a selection arrow
  SW6112: { name: 'SUSTAINABLE SOCIETY', units: '2.00', noRoom: true, rangeLabel: true, options: [
    { n: 1, st: 'Open', comps: [L('LEC', 'FM18', OPEN(2, 20), [['Wed', T(14), T(16)]])] },
    { n: 2, st: 'Open', comps: [L('LEC', 'FM19', OPEN(13, 20), [['Wed', T(14), T(16)]])] },
    { n: 3, st: 'Open', locked: true, comps: [L('LEC', 'FM26', OPEN(11, 20), [['Wed', T(14), T(16)]])] },
  ] } };
const optionsPage = (code, { declared } = {}) => {
  const c = COURSES[code] ?? EXTRA[code];
  return `<div>
<div class="topblock">Trimester Oct/Nov 2026 Undergraduate <button>Change</button></div>
<div id="win10divSSR_CRSE_INFO_V_SSS_SUBJ_CATLG"><span class="ps_box-value" id="SSR_CRSE_INFO_V_SSS_SUBJ_CATLG">C ${code}</span></div>
<div id="win10divSSR_CRSE_INFO_V_COURSE_TITLE_LONG"><span class="ps_box-value" id="SSR_CRSE_INFO_V_COURSE_TITLE_LONG">${c.name}</span></div>
<div id="win10divSSR_CLSRCH_F_WK_UNITS_RANGE"><span class="ps_box-value" id="SSR_CLSRCH_F_WK_UNITS_RANGE">${c.units}</span></div>
<div id="win10divSSR_CLSRCH_F_WK_SSR_MSG_TEXT"><span class="ps_box-value" id="SSR_CLSRCH_F_WK_SSR_MSG_TEXT">${c.rangeLabel ? `1 - ${declared ?? c.options.length} of ${declared ?? c.options.length}` : (declared ?? c.options.length)} options</span></div>
<table class="ps_grid-flex"><thead><tr><th class="OPTION_NSFF">Option</th></tr></thead><tbody class="ps_grid-body">${c.options.map((o) => row(o, c.noRoom)).join('')}</tbody></table></div>`;
};

// ---------- independent brute force ----------
const slotsOf = (o) => o.comps.flatMap((c) => c.slots);
const clash = (a, b) => slotsOf(a).some(([d1, s1, e1]) => slotsOf(b).some(([d2, s2, e2]) => d1 === d2 && s1 < e2 && s2 < e1));
function truth({ freeDays = [], earliest = null, latest = null, openOnly = true }) {
  const pools = CODES.map((c) => COURSES[c].options
    .filter((o) => !openOnly || o.st === 'Open')
    .filter((o) => slotsOf(o).every(([d, s, e]) => !freeDays.includes(d) && (earliest == null || s >= earliest) && (latest == null || e <= latest))));
  let total = 0;
  const rec = (i, chosen) => {
    if (i === pools.length) { total++; return; }
    for (const o of pools[i]) if (chosen.every((c) => !clash(c, o))) rec(i + 1, [...chosen, o]);
  };
  rec(0, []);
  return total;
}

// ---------- harness ----------
const dom = new JSDOM('<!doctype html><title>Enroll by My Requirements</title><body></body>');
const doc = dom.window.document;
let disk; // stands in for chrome.storage.local
const adapter = {
  async get() { return disk && JSON.parse(JSON.stringify(disk)); },
  async set(v) { disk = JSON.parse(JSON.stringify(v)); },
};
const qa = (p, sel) => [...p.host.shadowRoot.querySelectorAll(sel)];
const q = (p, sel) => p.host.shadowRoot.querySelector(sel);
const fire = (el, type) => el.dispatchEvent(new dom.window.Event(type, { bubbles: true }));
const tab = (p, name) => fire(qa(p, '.tabs button').find((b) => b.dataset.tab === name), 'click');
const open = async (html) => { doc.body.innerHTML = html; return mountPanel({ doc, adapter }); };
let passed = 0;
const ok = (name) => { passed++; console.log('  ok  ' + name); };

// 1. list page: auto-capture, selecting, outlines
let p = await open(listPage());
assert.equal(p.view.step, 'list');
assert.deepEqual(Object.keys(p.store.state.catalog).sort(), [...CODES].sort());
assert.equal(p.store.state.catalog.CP6114.term, 'Trimester Oct/Nov 2026');
assert.equal(q(p, '.retrieve').disabled, true);
ok('list page captured 3 courses, Retrieve disabled');

tab(p, 'courses');
for (const code of CODES) { const cb = q(p, `input[data-code="${code}"]`); cb.checked = true; fire(cb, 'change'); }
assert.deepEqual([...p.store.state.selected].sort(), [...CODES].sort());
const amber = [...doc.querySelectorAll('tbody tr')].map((tr) => tr.style.outline);
console.log('      outlines:', JSON.stringify(amber));
assert.ok(amber.every((o) => o.includes('rgb(245, 158, 11)') || o.includes('#f59e0b')));
ok('ticked courses get amber outline');

// 2. bad retrieve: declared count wrong -> refuse to save
p.destroy();
p = await open(optionsPage('CP6114', { declared: 9 }));
assert.equal(p.view.step, 'course-options');
assert.equal(q(p, '.retrieve').disabled, false);
fire(q(p, '.retrieve'), 'click');
assert.equal(p.store.state.courses.CP6114, undefined);
assert.match(q(p, '.msg.err').textContent, /Not saved/);
ok('count mismatch refuses to save');

// 3. retrieve all three (remount each time = full page navigation, state must persist)
for (const code of CODES) {
  p.destroy();
  p = await open(optionsPage(code));
  fire(q(p, '.retrieve'), 'click');
  const d = p.store.state.courses[code];
  assert.ok(d, `${code} saved`);
  assert.equal(d.term, 'Trimester Oct/Nov 2026');
  assert.equal(d.units, Number(COURSES[code].units));
  assert.equal(d.options.length, COURSES[code].options.length);
  // parsed slots must equal ground truth, option by option
  for (const o of d.options) {
    const truthOpt = COURSES[code].options.find((x) => x.n === o.option);
    const got = o.sections.flatMap((k) => d.sections[k].slots.map((s) => `${s.day} ${s.start}-${s.end}`)).sort();
    const want = slotsOf(truthOpt).map(([dd, s, e]) => `${dd} ${s}-${e}`).sort();
    assert.deepEqual(got, want, `${code} option ${o.option} slots`);
    assert.equal(o.status, truthOpt.st);
  }
}
ok('retrieved 3 courses; every option matches ground truth (slots, status, units, term)');

// 4. list page again: green outlines + persisted selection + units counter
p.destroy();
p = await open(listPage());
assert.ok([...doc.querySelectorAll('tbody tr')].every((tr) => tr.style.outline.includes('rgb(22, 163, 74)') || tr.style.outline.includes('#16a34a')));
tab(p, 'courses');
assert.match(q(p, '.units').textContent, /10 \/ 20/);
ok('after remount: green outlines, units 10 / 20');

// 5. generate with different filters; compare counts with brute force
const setTime = (name, v) => { const el = q(p, `[data-f="${name}"]`); el.value = v; fire(el, 'change'); };
const gen = () => { tab(p, 'plans'); fire(q(p, '.gen'), 'click'); return p.view.result; };
const checkValid = (res, f) => {
  for (const picks of res.schedules) {
    const flat = picks.flatMap((x) => x.slots.map((s) => ({ ...s, c: x.course })));
    for (const s of flat) {
      assert.ok(!(f.freeDays ?? []).includes(s.day));
      if (f.earliest != null) assert.ok(s.start >= f.earliest);
      if (f.latest != null) assert.ok(s.end <= f.latest);
    }
    for (let i = 0; i < picks.length; i++) for (let j = i + 1; j < picks.length; j++) {
      assert.ok(!picks[i].slots.some((a) => picks[j].slots.some((b) => a.day === b.day && a.start < b.end && b.start < a.end)), 'no clash');
    }
  }
};

let res = gen();
let want = truth({});
assert.equal(res.total, want);
assert.equal(qa(p, '.card').length, Math.min(5, want));
checkValid(res, {});
ok(`no filters: ${res.total} valid plans (brute force agrees), ${qa(p, '.card').length} cards`);

tab(p, 'filters');
const wed = q(p, 'input[data-day="Wed"]'); wed.checked = true; fire(wed, 'change');
setTime('latest', '19:00');
res = gen();
const f2 = { freeDays: ['Wed'], latest: T(19) };
want = truth(f2);
assert.ok(want > 0, 'filter case should have matches');
assert.equal(res.total, want);
checkValid(res, f2);
ok(`free Wed + end by 19:00: ${res.total} plans (brute force agrees)`);

tab(p, 'filters');
setTime('earliest', '20:00');
res = gen();
assert.equal(res.total, 0);
assert.equal(qa(p, '.card').length, 0);
assert.match(q(p, '.empty').textContent, /No schedule matches/);
ok('impossible filter: shows nothing but the empty notice');

tab(p, 'filters');
setTime('earliest', ''); setTime('latest', '');
const wed2 = q(p, 'input[data-day="Wed"]'); wed2.checked = false; fire(wed2, 'change');
const oo = q(p, 'input[data-f="openOnly"]'); oo.checked = false; fire(oo, 'change');
res = gen();
want = truth({ openOnly: false });
assert.equal(res.total, want);
ok(`include closed options: ${res.total} plans (brute force agrees)`);

// 6. persistence of filters
assert.equal(disk.filters.openOnly, false);
assert.deepEqual(disk.filters.freeDays, []);
ok('filters persisted to storage');

// 7. guide tab marks current step
tab(p, 'guide');
assert.equal(q(p, '.step.now').dataset.step, 'list');
ok('guide highlights the current step');

// 8. "Time Conflict" components (student already enrolled in clashing classes)
disk = undefined;
p.destroy();
p = await open(optionsPage('EN6114'));
fire(q(p, '.retrieve'), 'click');
const en = p.store.state.courses.EN6114;
assert.ok(en, 'saved despite Time Conflict cells');
assert.deepEqual(en.options.map((o) => o.enrolledConflict), [true, false, true]);
assert.equal(en.sections['LEC-E2L'].conflict, false, 'section keeps the occurrence that has times');
assert.equal(en.sections['LEC-E2L'].slots.length, 1);
assert.match(q(p, '.msg.ok').textContent, /2 show "Time Conflict"/);
tab(p, 'plans'); fire(q(p, '.gen'), 'click');
assert.equal(p.view.result.total, 1);
assert.equal(p.view.result.schedules[0][0].option, 2);
ok('Time Conflict cells: saved, flagged, excluded from plans');

// 9. course with no Room column, single LEC per option, range-style count label, one locked row
disk = undefined;
p.destroy();
p = await open(optionsPage('SW6112'));
fire(q(p, '.retrieve'), 'click');
const sw = p.store.state.courses.SW6112;
assert.ok(sw, 'saved without a Room column');
assert.equal(sw.options.length, 3);
assert.equal(sw.sections['LEC-FM18'].slots[0].room, '');
assert.deepEqual(sw.options.map((o) => o.clickable), [true, true, false]);
assert.match(q(p, '.msg.ok').textContent, /1 have no selection arrow/);
tab(p, 'plans'); fire(q(p, '.gen'), 'click');
assert.equal(p.view.result.total, 2);
ok('no Room column + single component + "1 - N of N" label + locked row');

// grid always reaches 8PM even when classes end at 4PM
const lastLabel = [...qa(p, '.grid')[0].querySelectorAll('.tl')].at(-1).textContent;
assert.equal(lastLabel, '19', 'last hour row is 19:00-20:00');
ok('timetable grid runs until 8PM');

// 10. filters use 24h dropdowns, not free typing
tab(p, 'filters');
const sel = q(p, 'select[data-f="earliest"]');
assert.ok(sel, 'earliest is a <select>');
assert.equal(sel.options.length, 49);
assert.equal(sel.options[0].textContent, 'No limit');
assert.equal(sel.options[1].value, '00:00');
assert.equal(sel.options[48].value, '23:30');
assert.equal(q(p, 'input[type=time]'), null);
sel.value = '13:30'; fire(sel, 'change');
assert.equal(disk.filters.earliest, 13 * 60 + 30);
ok('24h dropdowns (00:00 to 23:30), value saved');

// 11. drag + minimise
const ev = (el, type, x, y) => el.dispatchEvent(new dom.window.MouseEvent(type, { bubbles: true, clientX: x, clientY: y, button: 0 }));
let head = q(p, 'header');
ev(head, 'pointerdown', 100, 100); ev(head, 'pointermove', 300, 250); ev(head, 'pointerup', 300, 250);
assert.deepEqual(disk.ui.pos, { x: 200, y: 150 });
assert.equal(p.host.style.getPropertyValue('left'), '200px');
ev(q(p, '.iconbtn'), 'pointerdown', 5, 5); ev(q(p, '.iconbtn'), 'pointermove', 600, 600); ev(q(p, '.iconbtn'), 'pointerup', 600, 600);
assert.deepEqual(disk.ui.pos, { x: 200, y: 150 }, 'minimise button does not start a drag');
fire(q(p, '.iconbtn'), 'click');
assert.equal(p.store.state.ui.collapsed, true);
let pill = q(p, '.pill');
ev(pill, 'pointerdown', 50, 50); ev(pill, 'pointerup', 50, 50); // tap
assert.equal(p.store.state.ui.collapsed, false, 'tap on pill re-opens');
head = q(p, 'header');
ev(head, 'pointerdown', 10, 10); ev(head, 'pointermove', 5000, 5000); ev(head, 'pointerup', 5000, 5000);
assert.ok(disk.ui.pos.x <= 1024 - 8 && disk.ui.pos.y <= 768 - 8, 'clamped to the viewport');
ok('drag moves + persists, minimise still works, tap re-opens, clamped on screen');

console.log(`\n${passed} checks passed`);
process.exit(0);
