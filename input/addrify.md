This is a technical breakdown of **Addrify**, a professional geocoding and spatial data reconciliation platform. It is designed to process large batches of address data, leveraging multiple geocoding engines with a human-in-the-loop (HITL) interface for precision verification.

---

### **1. Application Architecture & Project Management**
Addrify is structured around a **Project-based workflow**.
*   **Main Dashboard:** A tabular registry of geocoding projects. Data points include:
    *   **Project Metadata:** Name, Description, and UUID.
    *   **Workflow State:** Statuses such as `draft`, `review ready`, or `completed`.
    *   **Aggregate Metrics:** Total task count vs. completed tasks, visualized via a percentage progress bar.
*   **Project Configuration (ETL Layer):**
    *   **Source Management:** Supports multi-engine geocoding (e.g., Google Maps API, HERE Maps, Mapbox, OpenStreetMap Nominatim, and proprietary internal geocoders).
    *   **Functional Constraints:** Toggles for "Skip background geocoding" (immediate manual review) and "Use knowledge from previous projects" (leveraging a cache/historical database for auto-approvals).

---

### **2. Data Ingestion & Transformation (Import)**
The platform features a robust **CSV/JSON Import Engine**:
*   **Parser Configuration:** Allows specification of delimiters (e.g., Pipe `|`, Comma), header row detection, and single-column vs. multi-column address parsing.
*   **Data Preservation:** A "Preserve unmapped fields" setting ensures that auxiliary metadata from the source file is carried through the lifecycle of the geocoding task for context.
*   **Mapping Interface:** A field-mapping UI where users define which source column represents the primary "Address" string.

---

### **3. Project Analytics & Monitoring**
Each project contains an **Overview Dashboard** focused on data quality and processing telemetry:
*   **Task Lifecycle Visualization:** High-level status cards (Completed, In Progress, Pending, Issues).
*   **Granular Status Breakdown:** A detailed matrix tracking specific geocoding outcomes:
    *   *Success States:* `Auto Confirmed`, `Reviewed`, `Knowledge Based`.
    *   *Pending States:* `Processing`, `Queued`, `Awaiting Review`.
    *   *Error/Edge Case States:* `No Results`, `Skipped`, `Failed`.

---

### **4. The "Work Panel" (HITL Reconciliation Workspace)**
This is the core interface for manual data verification and spatial reconciliation. It employs a **master-detail spatial layout**:
*   **Task Navigation (Sidebar):** A list of address strings with status badges, allowing users to cycle through items requiring review.
*   **Candidate Comparison Table:** When an address is selected, the UI displays a list of potential geographical candidates returned by the various search engines.
    *   **Schema:** Address string, Source engine, and Action triggers (Approve/Reject).
*   **Geospatial Visualization:** An integrated map (Leaflet/OpenStreetMap-based) that renders pins for every candidate in the table. This allows the user to visually verify the "best" location based on satellite or map imagery.
*   **Manual Intervention (Search Modal):** If automated engines fail, users can open an "Add Manual Candidates" modal to search by custom query, coordinate input, or raw JSON injection.

---

### **5. Workflow Filtering & Export**
*   **Advanced Filtering (Modal):** A multi-select criteria builder to isolate tasks. Filters include:
    *   **Status Presets:** `Not Processed`, `Needs Review`, `Issues`.
    *   **Source Provenance:** Filter by specific geocoding engine (e.g., only "KUS Addresses" results).
    *   **Tagging:** Project-specific metadata tags.
*   **Data Egress:** Once reconciliation is complete, the platform supports exporting the validated spatial data in **GeoJSON** (for GIS systems) or **CSV** formats.

---

### **Technical Logic Summary**
*   **Multi-Tenancy:** Project-level isolation with user access controls.
*   **Human-in-the-Loop (HITL):** The system prioritizes high-confidence auto-matching but provides a sophisticated UI for manual disambiguation of low-confidence spatial results.
*   **System Integrity:** Uses UUIDs for project and task tracking to ensure data consistency across the geocoding pipeline.
