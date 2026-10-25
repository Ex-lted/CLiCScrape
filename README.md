<video src="CLiCScrape_explainer_draft.mp4" autoplay loop muted playsinline controls width="100%"></video>

# CLiCScrape (browser extension)

Reads the class options of courses you open yourself in MMU CLiC, then builds clash-free timetables from your filters.
You log in and click through CLiC as usual. The extension never logs in, never clicks for you, and never enrols you.
All data stays in your browser (`chrome.storage.local`). Nothing is sent anywhere. It only runs on `https://clic.mmu.edu.my/*`.

## Install (Opera GX, Chrome, Edge)

1. Unzip `clic-planner.zip`. You get a folder containing `manifest.json`.
2. Open the extensions page: `opera://extensions` (Opera GX), `chrome://extensions` (Chrome) or `edge://extensions` (Edge).
3. Turn on **Developer mode**.
4. Click **Load unpacked** and choose the folder that contains `manifest.json`.
5. Open CLiC and log in. A round **CLiC Planner** button appears at the bottom right. Click it to open the panel.

After you change any file, press the reload icon on the extension card and refresh the CLiC tab.

## Use it in CLiC (one-time per trimester)

1. Log in to CLiC and open the **Student Homepage**.
2. Click the **Enrollment** tile.
3. In the left menu, click **Enroll by My Requirements**.
4. Click the row named after the trimester you are enrolling in (for example `BETA TRIMESTER OCTOBER _2620`).
5. You are now on the list of courses for that requirement. The panel captures this list by itself. Open the **Courses** tab and tick the courses you want. Ticked courses get an amber outline in CLiC's list.
6. Click the first amber course. On **Course Detail**, click **View Classes**.
7. On **Select a Value**, expand "Terms on or after ..." if it is collapsed, then click the current trimester (for example Trimester Oct/Nov 2026).
8. You are on **Course Information**. Scroll the options table until all options are loaded (the "N options" label tells you the total). Press **Retrieve this course** in the panel. A green message confirms the save. If you see a red message, wait a moment and press it again.
9. Go back to the list (browser Back button, or left menu **Enroll by My Requirements** and the same trimester row). The course you just retrieved now has a green outline. Repeat steps 6 to 8 for every remaining amber course.
10. For a course that is not on the list (an elective, for example), type its code in the **Courses** tab and press Add. Reach its Course Information page through **Class Search and Enroll** or **Browse Course Catalog**, then press Retrieve there.
11. Open the **Filters** tab. Tick the days you want completely free, set the earliest class start and the latest class end, and keep "Only options with open seats" on unless you want to see full sections.
12. Open the **Plans** tab and press **Generate plans**. You get up to 5 random clash-free plans, each with a weekly grid and the option number to pick in CLiC. If nothing fits, the panel says so and shows no plan. Press **Regenerate** for another random draw.
13. Before you enrol, press Retrieve again on each course you plan to take, because seat counts change while enrolment is open. Then enrol manually in CLiC using the option numbers from the plan (**Copy** puts them on your clipboard).

## What it reads

- Requirement list page: course code, name and trimester.
- Course Information page: course code and title, units, and for every option its status, class sections (LEC, TUT), day and time slots, rooms, seats and meeting dates.

## Notes and limits

- Only the list page and the Course Information page are recognised from page content. The Guide tab recognises the other pages from tab titles and element ids seen in screenshots. If it says "Page not recognised", the steps still work; only the "You are here" marker is missing.
- Retrieve refuses to save when the parsed option count differs from the page's own "N options" label, or when a time cannot be parsed. It tells you why.
- A slot whose time cannot be parsed excludes that option from plans rather than guessing.
- Options that CLiC shows greyed out (not selectable) are never used in plans.
- If you are already enrolled in some classes, CLiC replaces the days and times of clashing sections with "Time Conflict". The real times are hidden, so those options are left out of plans (they clash with your current enrolment anyway). The Courses tab shows how many per course. Classes you are already enrolled in are not drawn in the plan grid.
- Courses with different meeting date ranges do not clash with each other.
- The max-units field (default 20) only warns. It does not change plans.

## Tests

`npm install` then `npm test`. The test builds CLiC-shaped pages in jsdom, drives the panel by clicking its buttons, and compares the generated plan counts with an independent brute force.
It does not replace trying the extension on the real site once.
