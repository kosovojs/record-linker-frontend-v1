This is a technical breakdown of the **Mix’n’match** web application, designed for LLM processing and software development mapping.

### **Application Overview**
**Mix’n’match** is a data-matching orchestration tool designed to bridge external databases with Wikidata. It functions as a human-in-the-loop (HITL) system where users reconcile external entities with Wikidata items through various degrees of automation and manual verification.

---

### **1. Global Navigation & Header**
The application uses a persistent top-tier header containing:
*   **Branding:** "Mix’n’match" title.
*   **Localization:** A dropdown for language selection (e.g., "AR" for Arabic).
*   **Authentication:** "Log in for actions" link (likely OAuth-based).
*   **Search Interface:** A global search bar for finding specific catalogs or items.
*   **Metadata Links:** Links to manuals, video tutorials, and administrative functions (suggest, import, or scrape new catalogs).

---

### **2. Main View (Dashboard/Discovery)**
The landing page serves as a directory of available "Catalogs" (specific external datasets).
*   **Catalog Groups (Left Sidebar):** A tabular summary of data domains. Each row contains a **Group Name** (e.g., Archives, Art, Biography, Chemistry) and a **Count** of catalogs within that group.
*   **Search & Discovery (Main Column):**
    *   **Search Input:** A dedicated "Search catalogs" field with autocomplete.
    *   **Latest Catalogs List:** A feed of recently added datasets, displaying the catalog name (hyperlinked) and a brief description of the source data.
*   **Useful Groupings (Bottom Section):** A tabbed interface categorized by:
    *   Property class.
    *   Country.
    *   Top groups.
    *   Maps.
*   **Data Summary:** A table showing aggregate statistics, such as "Catalogs without Wikidata property."

---

### **3. Catalog Profile Page (Entity Statistics)**
When a user selects a specific catalog (e.g., "Tokyo 2020 at Olympedia"), they see a summary of the reconciliation progress.
*   **Catalog Metadata:** Displays the title, description, importer username, and a "Refresh" trigger. An "Action" dropdown provides administrative or export tasks.
*   **Matching Statistics (Progress Bars):** A visual breakdown of entity statuses using horizontal percentage bars:
    *   **Fully matched:** Verified links to Wikidata.
    *   **Preliminarily matched:** Candidates identified but not confirmed.
    *   **Not applicable to Wikidata:** Marked as out of scope.
    *   **Unmatched:** No candidates found yet.
*   **Matches Over Time:** A time-series bar chart showing matching activity by month (e.g., YYYY-MM).
*   **User Leaderboard:** A table of "Users" ranked by the number of matches performed, facilitating gamification and audit trails.

---

### **4. Matching Interfaces**
The core functionality occurs in specialized list views designed for high-throughput reconciliation.

#### **A. Unmatched View**
Used for entities with no clear candidates.
*   **Layout:** A paginated list of cards.
*   **Entity Data:** Shows the external name, description, and metadata (e.g., "Born 29 January 2001; ETH ATH").
*   **Search Integration:** Each entry provides deep-links to external search engines (Wikidata, Wikipedia, Google) to assist manual research.
*   **Candidate Selection:** A dropdown menu allows users to manually set a Wikidata QID (unique identifier) or select from a list of potential matches.

#### **B. Automatches (Preliminarily Matched) View**
Used for confirming machine-suggested matches.
*   **Two-Row Entry Structure:**
    *   **Row 1 (Source):** External data (Name, origin, metadata).
    *   **Row 2 (Target):** Proposed Wikidata candidate (Label, QID, and Wikidata description).
*   **Decision Actions:** A vertical stack of action links on the right:
    *   **Confirm:** Validates the match and moves it to "Fully matched."
    *   **Remove:** Rejects the candidate, moving the entry back to "Unmatched."
*   **Batch Actions:** Includes options like "Remove all" to clear low-confidence suggestions.

---

### **Technical Logic Summary**
*   **Data Model:** The app operates on a many-to-one relationship model where multiple external entries can be mapped to a single Wikidata QID.
*   **UI Pattern:** The interface prioritizes density and rapid-fire decision-making, utilizing a "list-verify-confirm" workflow.
*   **Integration:** The app acts as a middleware, querying the Wikidata API and storing local matching states until they are pushed/synced with the Wikidata property system.
