// store.js: state shape, actions, persistence. No DOM in here.
const KEY = 'clicPlanner.v1';

export const defaults = () => ({
  catalog: {}, // code -> { code, name, category, term }  captured from requirement-list pages
  selected: [], // course codes the user wants in the timetable
  courses: {}, // code -> normalize() output + { category, units, term, retrievedAt }
  filters: { freeDays: [], earliest: null, latest: null, openOnly: true, count: 5, maxUnits: 20 },
  ui: { tab: 'guide', collapsed: false, pos: null }, // pos = {x,y} px from top-left, null = default corner
});

// Adapter over chrome.storage.local (content scripts may use it with the "storage" permission).
export function chromeStorage() {
  return {
    async get() {
      return (await chrome.storage.local.get(KEY))[KEY];
    },
    async set(v) {
      await chrome.storage.local.set({ [KEY]: v });
    },
  };
}

export async function createStore(adapter) {
  const saved = (await adapter.get()) ?? {};
  const d = defaults();
  const state = {
    ...d,
    ...saved,
    filters: { ...d.filters, ...saved.filters },
    ui: { ...d.ui, ...saved.ui },
  };
  const subs = new Set();
  return {
    state,
    subscribe(fn) {
      subs.add(fn);
      return () => subs.delete(fn);
    },
    // fn mutates state. silent=true skips re-render (used by filter inputs so focus is not lost).
    update(fn, { silent = false } = {}) {
      fn(state);
      adapter.set(JSON.parse(JSON.stringify(state)));
      if (!silent) subs.forEach((f) => f(state));
    },
  };
}

// ---- actions (take the state object) ----
export function addCatalog(s, list) {
  for (const c of list) {
    s.catalog[c.code] = { code: c.code, name: c.name, category: c.category ?? null, term: c.term || null };
  }
}

export function setSelected(s, code, on) {
  const has = s.selected.includes(code);
  if (on && !has) s.selected.push(code);
  if (!on && has) s.selected = s.selected.filter((c) => c !== code);
}

export function saveCourse(s, data) {
  s.courses[data.course] = data;
  s.catalog[data.course] ??= {
    code: data.course, name: data.name, category: data.category ?? null, term: data.term ?? null,
  };
  setSelected(s, data.course, true); // you retrieved it, so you want it
}

export function removeCourse(s, code) {
  delete s.courses[code]; // forget data only; selection stays, so it shows as "to retrieve"
}

// Returns an error string, or null on success.
export function addManual(s, raw) {
  const code = String(raw ?? '').trim().toUpperCase().replace(/\s+/g, '');
  if (!/^[A-Z]{2,5}\d{3,5}$/.test(code)) return 'Course code looks wrong. Example: CP6114';
  s.catalog[code] ??= { code, name: '', category: null, term: null };
  setSelected(s, code, true);
  return null;
}
