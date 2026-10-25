import { detectPage, parseCourseList, parseCourseName, parseCoursePage, findTermLabel } from './parser.js';
import { generate } from './scheduler.js';
import { createStore, addCatalog, setSelected, saveCourse, removeCourse, clearAllCourses } from './store.js';
import { STEPS, detectStep } from './guide.js';
import { CSS } from './styles.js';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const PALETTE = ['#4f46e5', '#0891b2', '#16a34a', '#d97706', '#db2777', '#7c3aed', '#0d9488', '#dc2626'];
const PX_PER_HOUR = 36;
const TABS = [['guide', 'Scraper'], ['courses', 'Courses'], ['filters', 'Filters'], ['plans', 'Plans']];
const THEMES = ['system', 'light', 'dark'];
const THEME_LABEL = { system: 'Auto', light: 'Light', dark: 'Dark' };

const ICONS = {
  light: [['circle', { cx: 12, cy: 12, r: 4 }], ['path', { d: 'M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4' }]],
  dark: [['path', { d: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z' }]],
  system: [['rect', { x: 3, y: 4, width: 18, height: 12, rx: 2 }], ['path', { d: 'M8 20h8M12 16v4' }]],
};

export const fmtTime = (m) => `${Math.floor(m / 60) % 12 || 12}:${String(m % 60).padStart(2, '0')}${m >= 720 ? 'PM' : 'AM'}`;
export const toHHMM = (m) => (m == null ? '' : `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
export const fromHHMM = (s) => {
  const m = /^(\d{2}):(\d{2})$/.exec(s || '');
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => toHHMM(i * 30)); // 00:00 ... 23:30
const isOpen = (o) => /^open$/i.test(o.status);
const clashCount = (d) => d.options.filter((o) => o.enrolledConflict).length;
const seatLabel = (st) => (st.status === 'open' ? `${st.open}/${st.total}` : st.status === 'closed' ? 'closed' : '?');

export async function mountPanel({ doc = document, adapter }) {
  const store = await createStore(adapter);
  const win = doc.defaultView;
  // view = state that is NOT persisted (current page, last message, last generated plans)
  const view = { page: 'other', step: null, message: null, result: null, snapshot: null };
  let sig = '';
  let listSig = '';
  let timer = 0;

  // ---------- host + shadow root ----------
  const host = doc.createElement('div');
  host.id = 'clic-planner-host';
  host.style.cssText = 'all:initial;position:fixed;right:16px;bottom:16px;z-index:2147483647'; // CSSOM: allowed under strict page CSP
  const root = host.attachShadow({ mode: 'open' });
  try {
    const sheet = new win.CSSStyleSheet(); // constructable sheet: not blocked by page CSP
    sheet.replaceSync(CSS);
    root.adoptedStyleSheets = [sheet];
  } catch {
    const st = doc.createElement('style');
    st.textContent = CSS;
    root.append(st);
  }
  const app = doc.createElement('div');
  root.append(app);
  doc.body.append(host);

  // ---------- drag ----------
  let pos = store.state.ui.pos ?? null; // {x,y} = left/top in px; null = default bottom-right corner
  function setPos(x, y) {
    const r = host.getBoundingClientRect();
    pos = {
      x: Math.round(Math.min(Math.max(8, x), Math.max(8, win.innerWidth - r.width - 8))),
      y: Math.round(Math.min(Math.max(8, y), Math.max(8, win.innerHeight - r.height - 8))),
    };
    for (const [k, v] of [['left', `${pos.x}px`], ['top', `${pos.y}px`], ['right', 'auto'], ['bottom', 'auto']]) host.style.setProperty(k, v);
  }
  // Drag by `handle`. Children with [data-nodrag] keep their own click. A press that moves < 4px is a tap.
  function makeDraggable(handle, onTap) {
    handle.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || e.target.closest?.('[data-nodrag]')) return;
      const r = host.getBoundingClientRect();
      const ox = e.clientX - r.left;
      const oy = e.clientY - r.top;
      const sx = e.clientX;
      const sy = e.clientY;
      let moved = false;
      handle.setPointerCapture?.(e.pointerId);
      const move = (ev) => {
        if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 4) return;
        moved = true;
        setPos(ev.clientX - ox, ev.clientY - oy);
      };
      const up = () => {
        handle.removeEventListener('pointermove', move);
        handle.removeEventListener('pointerup', up);
        handle.removeEventListener('pointercancel', up);
        if (moved) store.update((s) => { s.ui.pos = pos; }, { silent: true });
        else if (onTap) onTap();
      };
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', up);
      handle.addEventListener('pointercancel', up);
      e.preventDefault();
    });
  }
  const onResize = () => { if (pos) setPos(pos.x, pos.y); };
  win.addEventListener('resize', onResize);

  // ---------- tiny DOM builder (text only; scraped text never goes through innerHTML) ----------
  const h = (tag, props, ...kids) => {
    const el = doc.createElement(tag);
    for (const [k, v] of Object.entries(props ?? {})) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'style') for (const [p, val] of Object.entries(v)) el.style.setProperty(p, val);
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'checked' || k === 'disabled' || k === 'value') el[k] = v;
      else el.setAttribute(k, v === true ? '' : String(v));
    }
    for (const kid of kids.flat(Infinity)) {
      if (kid == null || kid === false) continue;
      el.append(kid.nodeType ? kid : doc.createTextNode(String(kid)));
    }
    return el;
  };

  const icon = (name) => {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = doc.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    for (const [tag, attrs] of ICONS[name]) {
      const el = doc.createElementNS(NS, tag);
      for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
      svg.append(el);
    }
    return svg;
  };
  const applyTheme = (t) => {
    if (t === 'light' || t === 'dark') host.setAttribute('data-theme', t);
    else host.removeAttribute('data-theme'); // follow the system
  };
  const cycleTheme = () => store.update((st) => {
    const cur = THEMES.includes(st.ui.theme) ? st.ui.theme : 'system';
    st.ui.theme = THEMES[(THEMES.indexOf(cur) + 1) % THEMES.length];
  });

  // ---------- custom dropdown  ----------
  let menu = null; // { el, btn } while a list is open
  const closeMenu = () => {
    if (!menu) return;
    menu.el.remove();
    menu.btn.setAttribute('aria-expanded', 'false');
    menu = null;
  };
  const onDocDown = (e) => {
    if (!menu) return;
    const path = e.composedPath();
    if (!path.includes(menu.el) && !path.includes(menu.btn)) closeMenu();
  };
  const onAnyScroll = (e) => { if (menu && e.target !== menu.el) closeMenu(); };
  doc.addEventListener('pointerdown', onDocDown, true);
  root.addEventListener('scroll', onAnyScroll, true);
  win.addEventListener('resize', closeMenu);

  function dropdown({ name, label, options, value, disabled = false, onPick }) {
    let opts = options;
    let val = value;
    const text = h('span', {});
    const btn = h('button', {
      type: 'button', class: 'dd', 'data-f': name, 'aria-label': label,
      'aria-haspopup': 'listbox', 'aria-expanded': 'false', disabled,
    }, text);
    const show = () => { text.textContent = opts.find((o) => o.value === val)?.label ?? '--'; };
    show();

    const open = () => {
      closeMenu();
      const list = h('div', { class: 'menu', role: 'listbox', 'aria-label': label });
      const items = opts.map((o) => h('button', {
        type: 'button', class: `opt${o.value === val ? ' sel' : ''}`, role: 'option',
        'aria-selected': String(o.value === val), tabindex: '-1',
        onclick: () => { val = o.value; show(); closeMenu(); btn.focus(); onPick(val); },
      }, o.label));
      list.append(...items);
      root.append(list);
      const r = btn.getBoundingClientRect();
      const width = Math.max(r.width, 72);
      const mh = list.offsetHeight;
      let top = r.bottom + 4;
      if (top + mh > win.innerHeight - 8) top = Math.max(8, r.top - 4 - mh); // flip above when no room below
      list.style.setProperty('width', `${width}px`);
      list.style.setProperty('left', `${Math.max(8, Math.min(r.left, win.innerWidth - width - 8))}px`);
      list.style.setProperty('top', `${top}px`);
      const sel = items.find((i) => i.classList.contains('sel'));
      if (sel) list.scrollTop = sel.offsetTop - list.clientHeight / 2 + sel.offsetHeight / 2;
      (sel ?? items[0])?.focus({ preventScroll: true });
      list.addEventListener('keydown', (e) => {
        const i = items.indexOf(root.activeElement);
        const go = (n) => { e.preventDefault(); items[Math.max(0, Math.min(items.length - 1, n))]?.focus(); };
        if (e.key === 'ArrowDown') go(i + 1);
        else if (e.key === 'ArrowUp') go(i - 1);
        else if (e.key === 'Home') go(0);
        else if (e.key === 'End') go(items.length - 1);
        else if (e.key === 'Escape' || e.key === 'Tab') { if (e.key === 'Escape') e.preventDefault(); closeMenu(); btn.focus(); }
      });
      menu = { el: list, btn };
      btn.setAttribute('aria-expanded', 'true');
    };
    btn.addEventListener('click', () => (menu?.btn === btn ? closeMenu() : open()));
    return {
      el: btn,
      setOptions(o) { opts = o; show(); },
      setValue(v) { val = v; show(); },
      setDisabled(b) { btn.disabled = b; },
    };
  }

  const setMsg = (kind, text, details = [], tab = 'guide') => {
    view.message = { kind, text, details, tab };
  };
  const stamp = (iso) => new Date(iso).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  // ---------- actions ----------
  function retrieve() {
    const r = parseCoursePage(doc);
    if (!r.ok) {
      setMsg('err', 'Not saved. Scroll to the bottom of the page and press "Display More".', r.problems.slice(0, 5));
      return render();
    }
    const data = { ...r.data, term: findTermLabel(doc) };
    const open = data.options.filter(isOpen).length;
    const clash = clashCount(data);
    const locked = data.options.filter((o) => o.clickable === false).length;
    setMsg('ok', `Saved ${data.course}: ${data.options.length} options, ${open} open.`
      + (clash ? ` ${clash} show "Time Conflict" (clash with classes you already enrolled in). Plans skip them.` : '')
      + (locked ? ` ${locked} have no selection arrow in CLiC (not selectable). Plans skip them.` : '')
      + ' Go back and open the next course.');
    store.update((s) => saveCourse(s, data));
  }

  function runGenerate() {
    const s = store.state;
    const data = s.selected.map((c) => s.courses[c]);
    const f = s.filters;
    view.snapshot = data;
    view.result = generate(
      data,
      { freeDays: f.freeDays, earliest: f.earliest, latest: f.latest, openOnly: f.openOnly },
      { count: f.count },
    );
    view.message = null;
    render();
  }

  async function copyText(text) {
    try {
      await win.navigator.clipboard.writeText(text);
      setMsg('ok', 'Plan copied.', [], 'plans');
    } catch {
      setMsg('err', 'Browser blocked copying. Select the text manually.', [], 'plans');
    }
    render();
  }

  // ---------- views ----------
  function weeklyGrid(blocks) {
    if (!blocks.length) return h('div', { class: 'muted' }, 'No timetable slots.');
    const used = new Set(blocks.map((b) => b.day));
    const days = DAYS.filter((d, i) => i < 5 || used.has(d));
    const t0 = Math.floor(Math.min(...blocks.map((b) => b.start)) / 60) * 60;
    const t1 = Math.ceil(Math.max(...blocks.map((b) => b.end)) / 60) * 60;
    const height = ((t1 - t0) / 60) * PX_PER_HOUR;
    const hours = [];
    for (let t = t0; t < t1; t += 60) hours.push(t);
    const y = (m) => `${((m - t0) / 60) * PX_PER_HOUR}px`;
    return h('div', { class: 'grid', style: { '--cols': String(days.length) } },
      h('div', { class: 'gh' }),
      days.map((d) => h('div', { class: 'gh' }, d)),
      h('div', { class: 'gt', style: { height: `${height}px` } },
        hours.map((t) => h('span', { class: 'tl', style: { top: y(t) } }, String(t / 60)))),
      days.map((d) => h('div', { class: 'gc', style: { height: `${height}px` } },
        hours.map((t) => h('i', { class: 'hl', style: { top: y(t) } })),
        blocks.filter((b) => b.day === d).map((b) => h('div', {
          class: 'blk', title: b.title,
          style: { top: y(b.start), height: `${((b.end - b.start) / 60) * PX_PER_HOUR - 1}px`, 'background-color': b.color },
        }, b.label)))));
  }

  function card(picks, i) {
    const blocks = [];
    const lines = [];
    const rows = picks.map((p, ci) => {
      const c = view.snapshot.find((d) => d.course === p.course);
      const color = PALETTE[ci % PALETTE.length];
      const secs = p.sections.map((key) => c.sections[key]);
      for (const sec of secs) {
        for (const sl of sec.slots) {
          blocks.push({
            day: sl.day, start: sl.start, end: sl.end, color, label: `${p.course} ${sec.type}`,
            title: `${p.course} ${sec.type} ${sec.code} ${sl.day} ${fmtTime(sl.start)}-${fmtTime(sl.end)} ${sl.room}`,
          });
        }
      }
      const secText = secs.map((sec) => `${sec.type} ${sec.code}`).join(' + ');
      lines.push(`${p.course}: option ${p.option} (${secText})`);
      return h('div', { class: 'prow' },
        h('span', { class: 'dot', style: { background: color } }),
        h('b', {}, p.course), ` option ${p.option}`,
        h('div', { class: 'muted' }, secs.map((sec) => `${sec.type} ${sec.code} (seats ${seatLabel(sec.seats)})`).join(' + ')));
    });
    const text = `Plan ${i + 1}\n${lines.join('\n')}`;
    return h('div', { class: 'card' },
      h('div', { class: 'chead' }, h('b', {}, `Plan ${i + 1}`), h('button', { class: 'ghost', onclick: () => copyText(text) }, 'Copy')),
      rows, weeklyGrid(blocks));
  }

  function resultView() {
    const r = view.result;
    if (!r.schedules.length) {
      const why = r.blockedBy ? `No option of ${r.blockedBy} fits these filters.` : 'Every combination has a time clash.';
      return h('div', { class: 'empty' }, h('b', {}, 'No schedule matches your filters.'), h('div', { class: 'muted' }, why));
    }
    return h('div', {},
      h('div', { class: 'muted', style: { 'margin-top': '8px' } },
        `Showing ${r.schedules.length} of ${r.total} valid${r.truncated ? ' (search capped, not exhaustive)' : ''}. Option numbers are what you pick in CLiC.`),
      r.schedules.map((picks, i) => card(picks, i)));
  }

  function guideTab(s) {
    const retrieved = s.selected.filter((c) => s.courses[c]).length;
    return h('div', {},
      view.step ? null : h('p', { class: 'hint' }, 'Page not recognised. Start at step 1.'),
      h('ol', { class: 'steps' }, STEPS.map((st) =>
        h('li', { class: `step${st.id === view.step ? ' now' : ''}`, 'data-step': st.id },
          h('b', {}, st.title), h('div', { class: 'muted' }, st.text),
          st.id === view.step ? h('span', { class: 'here' }, 'You are here') : null))),
      h('p', { class: 'muted' }, `Retrieved ${retrieved} of ${s.selected.length} selected courses.`));
  }

  function courseRow(s, code) {
    const c = s.catalog[code] ?? { name: '' };
    const data = s.courses[code];
    const on = s.selected.includes(code);
    return h('div', { class: 'crow' },
      h('label', {},
        h('input', { type: 'checkbox', checked: on, 'data-code': code, onchange: (e) => store.update((st) => setSelected(st, code, e.target.checked)) }),
        h('span', { class: 'code' }, code), h('span', { class: 'nm' }, c.name || data?.name || '')),
      data
        ? h('span', { class: 'chip ok', title: `Retrieved ${stamp(data.retrievedAt)}` },
          `${data.options.filter(isOpen).length}/${data.options.length} open${clashCount(data) ? `, ${clashCount(data)} clash` : ''}, ${stamp(data.retrievedAt)}`)
        : h('span', { class: 'chip' }, on ? 'to retrieve' : 'not selected'),
      data ? h('button', { class: 'x', title: 'Forget retrieved data', onclick: () => store.update((st) => removeCourse(st, code)) }, '×') : null);
  }

  function coursesTab(s) {
    const codes = [...new Set([...Object.keys(s.catalog), ...s.selected])].sort();
    const done = s.selected.filter((c) => s.courses[c]);
    const units = done.reduce((a, c) => a + (s.courses[c].units ?? 0), 0);
    const terms = [...new Set(done.map((c) => s.courses[c].term).filter(Boolean))];
    const pickAll = (on) => store.update((st) => { for (const c of codes) setSelected(st, c, on); });
    const deleteAll = () => {
      view.confirmDelete = false;
      view.result = null;
      view.snapshot = null;
      listSig = ''; // let the requirement list repopulate the catalog next time it is seen
      store.update((st) => clearAllCourses(st));
    };
    const bulk = view.confirmDelete
      ? h('div', { class: 'bulk' },
        h('button', { class: 'ghost danger confirm', onclick: deleteAll }, 'Confirm delete'),
        h('span', { class: 'sp' }),
        h('button', { class: 'ghost', onclick: () => { view.confirmDelete = false; render(); } }, 'Cancel'))
      : h('div', { class: 'bulk' },
        h('button', { class: 'ghost', onclick: () => pickAll(true) }, 'Select all'),
        h('button', { class: 'ghost', onclick: () => pickAll(false) }, 'Unselect all'),
        h('span', { class: 'sp' }),
        h('button', { class: 'ghost danger', title: 'Remove every course and its retrieved data', onclick: () => { view.confirmDelete = true; render(); } }, 'Delete all'));
    return h('div', {},
      codes.length ? bulk : null,
      codes.length ? null : h('p', { class: 'hint' }, 'No courses yet. Open the requirement list in CLiC (Scraper step 4).'),
      terms.length > 1 ? h('div', { class: 'msg err' }, `Mixed trimesters: ${terms.join(', ')}`) : null,
      codes.map((c) => courseRow(s, c)),
      h('div', { class: 'units' }, `Units (selected, retrieved): ${units}`));
  }

  function filtersTab(s) {
    const f = s.filters;
    const theme = THEMES.includes(s.ui.theme) ? s.ui.theme : 'system';
    const set = (fn) => store.update((st) => fn(st.filters), { silent: true });
    const field = (label, el, tag = 'label') => h(tag, { class: 'field' }, h('span', {}, label), el);
    // Two custom dropdowns: HH : MM, limited to 08:00-20:00. Hour "--" means no limit.
    const pad = (n) => String(n).padStart(2, '0');
    const HOUR_OPTS = [{ value: '', label: '--' }, ...Array.from({ length: 13 }, (_, i) => ({ value: String(8 + i), label: pad(8 + i) }))];
    const minuteOpts = (hr) => (hr === '20' ? [0] : Array.from({ length: 12 }, (_, i) => i * 5)).map((m) => ({ value: String(m), label: pad(m) }));
    const timeSelect = (name, value, onPick) => {
      let hv = value == null ? '' : String(Math.min(20, Math.max(8, Math.floor(value / 60))));
      let mv = value == null || hv === '20' ? '0' : String(value % 60);
      const emit = () => onPick(hv === '' ? null : Number(hv) * 60 + Number(mv));
      const hDD = dropdown({
        name: `${name}-h`, label: 'Hour', options: HOUR_OPTS, value: hv,
        onPick: (v) => {
          hv = v;
          if (v === '') { mDD.setDisabled(true); mDD.setValue(''); } else {
            if (v === '20') mv = '0';
            mDD.setOptions(minuteOpts(v)); mDD.setDisabled(false); mDD.setValue(mv);
          }
          emit();
        },
      });
      const mDD = dropdown({
        name: `${name}-m`, label: 'Minute', options: minuteOpts(hv), value: hv === '' ? '' : mv, disabled: hv === '',
        onPick: (v) => { mv = v; emit(); },
      });
      return h('div', { class: 'time', 'data-f': name }, hDD.el, h('span', { class: 'colon' }, ':'), mDD.el);
    };
    return h('div', {},
      h('span', { class: 'lbl' }, 'Free days (no classes at all)'),
      h('div', { class: 'days' }, DAYS.map((d) => h('label', { class: 'day' },
        h('input', {
          type: 'checkbox', 'data-day': d, checked: f.freeDays.includes(d),
          onchange: (e) => set((ff) => { ff.freeDays = e.target.checked ? [...new Set([...ff.freeDays, d])] : ff.freeDays.filter((x) => x !== d); }),
        }), d))),
      field('Earliest class start', timeSelect('earliest', f.earliest, (v) => set((ff) => { ff.earliest = v; })), 'div'),
      field('Latest class end', timeSelect('latest', f.latest, (v) => set((ff) => { ff.latest = v; })), 'div'),
      h('label', { class: 'chk' },
        h('input', { type: 'checkbox', class: 'sw', 'data-f': 'openOnly', checked: f.openOnly, onchange: (e) => set((ff) => { ff.openOnly = e.target.checked; }) }),
        'Only options with open seats'),
      field('Plans to show (1 to 10)', h('input', { type: 'number', min: 1, max: 10, 'data-f': 'count', value: String(f.count), onchange: (e) => set((ff) => { ff.count = Math.min(10, Math.max(1, Number(e.target.value) || 5)); }) })),
      h('p', { class: 'muted' }, 'Earliest start and latest end apply to every class meeting. Leave a time empty for no limit.'),
      h('span', { class: 'lbl', style: { 'margin-top': '16px' } }, 'Appearance'),
      h('div', { class: 'seg' }, THEMES.map((t) => h('button', {
        class: theme === t ? 'on' : '', 'data-theme-opt': t, onclick: () => store.update((st) => { st.ui.theme = t; }),
      }, THEME_LABEL[t]))));
  }

  function plansTab(s) {
    const missing = s.selected.filter((c) => !s.courses[c]);
    const ready = s.selected.length > 0 && missing.length === 0;
    return h('div', {},
      h('button', { class: 'primary gen', disabled: !ready, onclick: runGenerate }, view.result ? 'Regenerate' : 'Generate plans'),
      !s.selected.length ? h('p', { class: 'hint' }, 'Select courses in the Courses tab first.') : null,
      missing.length ? h('p', { class: 'hint' }, `Retrieve these first: ${missing.join(', ')}`) : null,
      view.message?.tab === 'plans' ? h('div', { class: `msg ${view.message.kind}`, style: { 'margin-top': '10px' } }, view.message.text) : null,
      view.result ? resultView() : null);
  }

  function footer() {
    const on = view.page === 'course-options';
    const m = view.message?.tab === 'guide' ? view.message : null;
    return h('div', { class: 'foot' },
      m ? h('div', { class: `msg ${m.kind}` }, m.text, m.details.length ? h('ul', {}, m.details.map((d) => h('li', {}, d))) : null) : null,
      h('button', { class: 'primary retrieve', disabled: !on, onclick: retrieve }, 'Retrieve this course'),
      on ? null : h('span', { class: 'muted' }, 'Enabled on a Course Information page (Guide step 7).'));
  }

  function panelView(s) {
    const cur = STEPS.find((x) => x.id === view.step);
    const theme = THEMES.includes(s.ui.theme) ? s.ui.theme : 'system';
    const body = { guide: guideTab, courses: coursesTab, filters: filtersTab, plans: plansTab }[s.ui.tab](s);
    const head = h('header', { class: 'drag' },
      h('div', {}, h('div', { class: 't' }, 'CLiCScrape'),
        h('div', { class: 's' }, cur ? `Now: ${cur.title}` : '')),
      h('span', { class: 'sp' }),
      h('button', {
        class: 'iconbtn theme', 'data-nodrag': true, 'aria-label': `Theme: ${THEME_LABEL[theme]}`,
        title: `Theme: ${THEME_LABEL[theme]} (click to change)`, onclick: cycleTheme,
      }, icon(theme)),
      h('button', { class: 'iconbtn', 'data-nodrag': true, title: 'Minimise', onclick: () => store.update((st) => { st.ui.collapsed = true; }) }, '–'));
    makeDraggable(head);
    return h('div', { class: 'panel' },
      head,
      h('nav', { class: 'tabs' }, TABS.map(([id, label]) => h('button', {
        class: s.ui.tab === id ? 'on' : '', 'data-tab': id, onclick: () => { view.confirmDelete = false; store.update((st) => { st.ui.tab = id; }); },
      }, label))),
      h('div', { class: 'body' }, body), s.ui.tab === 'guide' ? footer() : null);
  }

  function pillView(s) {
    const done = s.selected.filter((c) => s.courses[c]).length;
    const open = () => store.update((st) => { st.ui.collapsed = false; });
    const btn = h('button', {
      class: 'pill drag', title: 'Click to open, drag to move',
      onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } },
    }, 'CLiCScrape', h('b', {}, `${done}/${s.selected.length}`));
    makeDraggable(btn, open);
    return btn;
  }

  function render() {
    const s = store.state;
    applyTheme(s.ui.theme);
    closeMenu();
    app.replaceChildren(s.ui.collapsed ? pillView(s) : panelView(s));
    if (pos) setPos(pos.x, pos.y); // re-clamp: panel and pill differ in size
  }

  // ---------- page awareness ----------
  // On the requirement list, outline selected courses: amber = still to retrieve, green = done.
  function highlightRows() {
    const s = store.state;
    for (const tr of doc.querySelectorAll('tbody tr.ps_grid-row')) {
      const cell = tr.querySelector('td.CRSE_NAME1');
      if (!cell) continue;
      const code = parseCourseName(cell.textContent)?.code;
      const picked = s.selected.includes(code);
      tr.style.outline = !picked ? '' : s.courses[code] ? '3px solid #16a34a' : '3px solid #f59e0b';
      tr.style.outlineOffset = picked ? '-3px' : '';
    }
  }

  function refresh() {
    if (!host.isConnected) doc.body.append(host);
    const page = detectPage(doc);
    const step = detectStep(doc);
    if (page === 'course-list') {
      const list = parseCourseList(doc);
      const ls = JSON.stringify(list.map((c) => [c.code, c.name, c.term]));
      if (list.length && ls !== listSig) {
        listSig = ls;
        store.update((s) => addCatalog(s, list), { silent: true });
      }
      highlightRows();
    }
    const next = `${page}|${step}|${listSig}`;
    if (next !== sig) {
      sig = next;
      view.page = page;
      view.step = step;
      render();
    }
  }

  store.subscribe(() => {
    if (view.page === 'course-list') highlightRows();
    render();
  });

  const MO = win.MutationObserver;
  const mo = new MO(() => {
    win.clearTimeout(timer);
    timer = win.setTimeout(refresh, 250);
  });
  mo.observe(doc.body, { childList: true, subtree: true });

  refresh();
  render();

  return {
    host, store, view, refresh,
    destroy() {
      mo.disconnect();
      win.clearTimeout(timer);
      win.removeEventListener('resize', onResize);
      win.removeEventListener('resize', closeMenu);
      doc.removeEventListener('pointerdown', onDocDown, true);
      closeMenu();
      host.remove();
    },
  };
}