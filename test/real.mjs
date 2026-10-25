// Checks the parser against VERBATIM rows from the real SW6112 page (CLiC, 77 options, no Room column).
// Rows kept: options 1, 9 (locked), 18 (12PM start), 21 (28/03 end), 27 ("Class N" suffix), 35 (Thursday), 50 (Closed).
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { parseOptionsTable, parseCoursePage, detectPage } from '../parser.js';

const html = fs.readFileSync(new URL('./fixtures/sw6112-real-subset.html', import.meta.url), 'utf8');
const doc = new JSDOM(`<body>${html}</body>`).window.document;

// 1. exactly what the page says
assert.equal(detectPage(doc), 'course-options');
let t = parseOptionsTable(doc);
assert.equal(t.declared, 77, '"1 - 77 of 77 options" -> 77');
assert.equal(t.options.length, 7);
assert.equal(t.countOk, false, 'subset only, so the count check must refuse');
for (const o of t.options) assert.deepEqual(o.warnings, [], `option ${o.option} warnings`);
console.log('  ok  real rows parse with no column warnings; "1 - 77 of 77 options" read as 77');

// 2. full page: make the label match the 7 kept rows, add the header that sits outside this outerHTML
doc.querySelector('span[id$="SSR_MSG_TEXT"]').textContent = '1 - 7 of 7 options';
doc.body.insertAdjacentHTML('afterbegin', `<div>
<span class="ps_box-value" id="SSR_CRSE_INFO_V_SSS_SUBJ_CATLG">LS SW6112</span>
<span class="ps_box-value" id="SSR_CRSE_INFO_V_COURSE_TITLE_LONG">SUSTAINABLE SOCIETY</span>
<span class="ps_box-value" id="SSR_CLSRCH_F_WK_UNITS_RANGE">2.00</span>
<div>Trimester Oct/Nov 2026</div></div>`);
const r = parseCoursePage(doc);
assert.ok(r.ok, r.problems.join('; '));
const d = r.data;
const opt = (n) => d.options.find((o) => o.option === n);
const sec = (n) => d.sections[opt(n).sections[0]];

assert.deepEqual(d.options.map((o) => o.option), [1, 9, 18, 21, 27, 35, 50]);
assert.deepEqual(d.options.map((o) => o.status), ['Open', 'Open', 'Open', 'Open', 'Open', 'Open', 'Closed']);
assert.deepEqual(d.options.map((o) => o.clickable), [true, false, true, true, true, true, true], 'only option 9 is locked');
assert.ok(d.options.every((o) => !o.enrolledConflict));

assert.deepEqual(sec(1).slots, [{ day: 'Wed', start: 840, end: 960, room: '' }]);
assert.equal(sec(18).slots[0].start, 720, '12:00PM is noon');
assert.equal(sec(35).slots[0].day, 'Thu');
assert.equal(sec(27).code, 'FC6', '"Class N" suffix ignored');
assert.equal(sec(1).type, 'LEC');

assert.deepEqual(sec(1).seats, { status: 'open', open: 2, total: 20 });
assert.deepEqual(sec(27).seats, { status: 'open', open: 3, total: 20 });
assert.equal(sec(50).seats.status, 'closed');

assert.equal(opt(1).dates.end, '2027-02-14');
assert.equal(opt(21).dates.end, '2027-03-28');
assert.equal(d.course, 'SW6112');
assert.equal(d.units, 2);
console.log('  ok  full parse of real rows: slots, noon, Thursday, seats, dates, locked row, closed row');
console.log('\n2 real-HTML checks passed');
