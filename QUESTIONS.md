# Pre-Implementation Questions for Record Linker Frontend

Before creating the implementation plan, I need clarification on the following items. Questions are organized by domain.

---

## 1. Business Logic & Workflow

1. **Match Review Priority**: Between the two review interfaces (Addrify "Work Panel" and Mix'n'Match "Automatches"), which should be the primary/default interface when a user enters a project's review mode? Or should users explicitly choose which workflow they prefer?
addrify style should be default.

2. **Task Navigation in Review Mode**: In the "Work Panel" (Addrify-style), should navigation be purely sequential ("Previous/Next"), or should users be able to jump to any task in the list? Should there be keyboard shortcuts (e.g., arrow keys, `a` for accept, `r` for reject)?
sidenote - feel free to think of better name for "work-panel" -- workspace maybe? the navigation in addrify-style should be paginated list (lets say 50 tasks per page), user can select any of tasks to work on, but by default he starts with 1st task going forward. and yes, eventually there could be keyboard shortcuts

3. **Wikidata Entity Display**: For Wikidata candidates, what data should be fetched and displayed?
   - Just labels and descriptions from the QID?
   - Specific claims (P569 date of birth, P27 country of citizenship)?
   - Should we call Wikidata API directly or does the backend proxy this?
for now just labels and descriptions

4. **Candidate Scoring Breakdown**: The API returns `score_breakdown` and `matched_properties`. Should the UI display this? If so, how detailed? (e.g., simple "Name: 90%, DOB: 100%" or expandable detailed view?)
simply on candidate level, but have somewhere detailed view in addrify-style

5. **Project Status Transitions**: What user actions trigger project status changes (e.g., `draft` → `active` → `review_ready`)? Or are these purely backend-driven based on automation completion?
user should be able to change project status in project settings page
---

## 2. Data Management

6. **Dataset Entry Import**: What's the expected format for bulk entry import?
   - JSON array only, or also CSV?
   - Is there a maximum file size or entry count we should enforce client-side?
   - Should we show a preview/mapping step like Addrify before import?
yes for preview question, we will be able to import both csv and json

7. **Property Management**: Are properties global (shared across all datasets) or dataset-specific? The API suggests global (`/properties` endpoint), but how should they be associated with datasets?
properties are global. dataset entries just use them, so that property "name" is shared between all datasets.

8. **Raw Data Display**: For `DatasetEntryRead.raw_data`, should we display this as raw JSON, or do you want a structured key-value view? Should it be collapsible?
some simple table-like in the end would be good

9. **Dataset Filtering for Projects**: When creating a project, can users filter which entries to include (by property values, by date range, etc.), or is it always "all entries" or "specific entry UUIDs"?
for now "all entries"
---

## 3. UI/UX Preferences

10. **Theme & Branding**: Should we use the default shadcn dark/light theme toggle, or is there a specific brand color palette? Any existing logos/assets to incorporate?
use default

11. **List Pagination Strategy**: For large datasets (10k+ entries), should we use:
    - Traditional pagination with page numbers?
    - Infinite scroll?
    - Virtual scrolling for performance?
pagination

12. **Responsive Design Priority**: Is this primarily a desktop application, or should we optimize for tablet/mobile as well? What's the minimum supported viewport width?
mostly desktop, but the addrify/mixnmatch-style matching interfaces could be good to be usable on mobile devices

13. **Empty States & Onboarding**: Should we include:
    - First-time user onboarding tours?
    - Contextual help tooltips?
    - Sample datasets for demonstration?
some demo datasets and projects would be ok, but that is not top priority
---

## 4. Real-Time & Performance

14. **Real-Time Updates**: While a project is in `processing` or `search_in_progress` status, should the UI poll for updates? WebSocket? Or manual refresh?
polling is fine

15. **Background Processing Feedback**: When automation is running (candidate search), what feedback do users need?
    - Progress bar with percentage?
    - Live count of processed tasks?
    - Estimated time remaining?
progress bar is fine

16. **Caching Strategy**: For Wikidata entity data (labels, descriptions), should we cache locally (localStorage) or rely on browser cache? Any TTL preferences?
localstorage

---

## 5. Export & Integration

17. **Export Formats**: What export formats are required for completed reconciliation results?
    - The API mentions "approved-matches" endpoint
    - Do we need CSV download, JSON, or other formats?
    - Any specific column requirements?
for now csv export

18. **External Tool Integration**: Should there be deep links to:
    - Wikidata item pages?
    - The external source URLs (`external_url` from entries)?
    - QuickStatements for bulk Wikidata edits?
yes to all

---

## 6. Technical Implementation

19. **Authentication Future-Proofing**: You mentioned "no auth for now." Should the architecture be built to easily add auth later? (e.g., placeholder guards, auth context structure?)
yes

20. **API Base URL**: What is the backend API base URL for development? Should we use a `.env` variable like `VITE_API_URL`? Any CORS considerations?
use "/api", in dev mode use vite proxy server

---

## Additional Context Needed

- Are there specific performance benchmarks (e.g., "list 1000 tasks must render in <500ms")?
that is mostly for backend guys ;)
- Any accessibility requirements (WCAG compliance level)?
meh
- Internationalization (i18n) support needed, or English-only?
i18n needed, but not for now
- Any preference for test framework (Vitest, React Testing Library)?
vitest
---

Please provide answers or guidance on these items, and I'll proceed with the implementation plan.
