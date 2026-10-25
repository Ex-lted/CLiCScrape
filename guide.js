// guide.js: the walkthrough steps and page detection.
import { detectPage } from './parser.js';

export const STEPS = [
  { id: 'home', title: 'Open Enrollment', text: 'On the Student Homepage, click the Enrollment tile.' },
  { id: 'appointments', title: 'Open Enroll by My Requirements', text: 'In the left menu, click "Enroll by My Requirements".' },
  { id: 'requirements', title: 'Pick the trimester row', text: 'Click the row named after the trimester you are enrolling in (for example BETA TRIMESTER OCTOBER _2620).' },
  { id: 'list', title: 'Open a course', text: 'Pick a course you wanna scrape.' },
  { id: 'course-detail', title: 'Click View Classes', text: 'On Course Detail, click the "View Classes" button.' },
  { id: 'select-term', title: 'Choose the current trimester', text: 'On Select a Value, expand "Terms on or after..." if needed and click the current trimester.' },
  { id: 'course-options', title: 'Press Retrieve', text: 'Wait until the options table is fully loaded, then press "Retrieve this course" below. Then go back to the list and open the next amber course.' },
];

// Which step does the current page belong to? null = not recognised.
// list/options use table cell classes from your saved HTML (reliable).
// The other pages use ids seen in the status bar of your screenshots and the tab titles (best effort).
export function detectStep(doc) {
  const kind = detectPage(doc);
  if (kind === 'course-options') return 'course-options';
  if (kind === 'course-list') return 'list';
  if (doc.querySelector('[id*="SSR_CSTRMPRV_GRP"]')) return 'select-term';
  if (doc.querySelector('[id^="DERIVED_SAA_CRS_SSR_PB_FETCH"]')) return 'course-detail';
  const t = doc.title || '';
  if (/select a value/i.test(t)) return 'select-term';
  if (/course detail/i.test(t)) return 'course-detail';
  if (/enroll by my requirements/i.test(t)) return 'requirements';
  if (/enrollment appointment/i.test(t)) return 'appointments';
  return null;
}
