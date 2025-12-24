# Pre-Implementation Questions for Record Linker Frontend

Before creating the implementation plan, I need clarification on the following items. Questions are organized by domain.

---

## 1. Business Logic & Workflow

1. **Match Review Priority**: Between the two review interfaces (Addrify "Work Panel" and Mix'n'Match "Automatches"), which should be the primary/default interface when a user enters a project's review mode? Or should users explicitly choose which workflow they prefer?

2. **Task Navigation in Review Mode**: In the "Work Panel" (Addrify-style), should navigation be purely sequential ("Previous/Next"), or should users be able to jump to any task in the list? Should there be keyboard shortcuts (e.g., arrow keys, `a` for accept, `r` for reject)?

3. **Wikidata Entity Display**: For Wikidata candidates, what data should be fetched and displayed?
   - Just labels and descriptions from the QID?
   - Specific claims (P569 date of birth, P27 country of citizenship)?
   - Should we call Wikidata API directly or does the backend proxy this?

4. **Candidate Scoring Breakdown**: The API returns `score_breakdown` and `matched_properties`. Should the UI display this? If so, how detailed? (e.g., simple "Name: 90%, DOB: 100%" or expandable detailed view?)

5. **Project Status Transitions**: What user actions trigger project status changes (e.g., `draft` → `active` → `review_ready`)? Or are these purely backend-driven based on automation completion?

---

## 2. Data Management

6. **Dataset Entry Import**: What's the expected format for bulk entry import?
   - JSON array only, or also CSV?
   - Is there a maximum file size or entry count we should enforce client-side?
   - Should we show a preview/mapping step like Addrify before import?

7. **Property Management**: Are properties global (shared across all datasets) or dataset-specific? The API suggests global (`/properties` endpoint), but how should they be associated with datasets?

8. **Raw Data Display**: For `DatasetEntryRead.raw_data`, should we display this as raw JSON, or do you want a structured key-value view? Should it be collapsible?

9. **Dataset Filtering for Projects**: When creating a project, can users filter which entries to include (by property values, by date range, etc.), or is it always "all entries" or "specific entry UUIDs"?

---

## 3. UI/UX Preferences

10. **Theme & Branding**: Should we use the default shadcn dark/light theme toggle, or is there a specific brand color palette? Any existing logos/assets to incorporate?

11. **List Pagination Strategy**: For large datasets (10k+ entries), should we use:
    - Traditional pagination with page numbers?
    - Infinite scroll?
    - Virtual scrolling for performance?

12. **Responsive Design Priority**: Is this primarily a desktop application, or should we optimize for tablet/mobile as well? What's the minimum supported viewport width?

13. **Empty States & Onboarding**: Should we include:
    - First-time user onboarding tours?
    - Contextual help tooltips?
    - Sample datasets for demonstration?

---

## 4. Real-Time & Performance

14. **Real-Time Updates**: While a project is in `processing` or `search_in_progress` status, should the UI poll for updates? WebSocket? Or manual refresh?

15. **Background Processing Feedback**: When automation is running (candidate search), what feedback do users need?
    - Progress bar with percentage?
    - Live count of processed tasks?
    - Estimated time remaining?

16. **Caching Strategy**: For Wikidata entity data (labels, descriptions), should we cache locally (localStorage) or rely on browser cache? Any TTL preferences?

---

## 5. Export & Integration

17. **Export Formats**: What export formats are required for completed reconciliation results?
    - The API mentions "approved-matches" endpoint
    - Do we need CSV download, JSON, or other formats?
    - Any specific column requirements?

18. **External Tool Integration**: Should there be deep links to:
    - Wikidata item pages?
    - The external source URLs (`external_url` from entries)?
    - QuickStatements for bulk Wikidata edits?

---

## 6. Technical Implementation

19. **Authentication Future-Proofing**: You mentioned "no auth for now." Should the architecture be built to easily add auth later? (e.g., placeholder guards, auth context structure?)

20. **API Base URL**: What is the backend API base URL for development? Should we use a `.env` variable like `VITE_API_URL`? Any CORS considerations?

---

## Additional Context Needed

- Are there specific performance benchmarks (e.g., "list 1000 tasks must render in <500ms")?
- Any accessibility requirements (WCAG compliance level)?
- Internationalization (i18n) support needed, or English-only?
- Any preference for test framework (Vitest, React Testing Library)?

---

Please provide answers or guidance on these items, and I'll proceed with the implementation plan.
