# ImpactTrack NGO

## Overview
ImpactTrack is a scalable web application designed to help NGOs track and report their social impact data. It allows for both individual report submissions and bulk CSV uploads, providing a centralized dashboard for administrators to visualize aggregate data.

**Note:** This demo utilizes a **Frontend-First** architecture. The backend logic, database, and asynchronous job queues are robustly simulated within the browser using `localStorage` and JavaScript promises. This allows you to experience the full bulk-processing workflow (latency, polling, partial failures) without setting up a separate server.

## Features

### 1. Admin Dashboard
- **KPI Cards:** View total NGOs reporting, people helped, events conducted, and funds utilized.
- **Data Visualization:** Bar charts comparing key metrics for the selected month.
- **Month Filtering:** Dynamically aggregate data based on the reporting period.

### 2. Report Submission
- **Single Entry Form:** Form-based submission with validation.
- **Idempotency:** Prevents duplicate submissions for the same NGO in the same month to ensure data integrity.

### 3. Bulk CSV Upload (Async Simulation)
- **Background Processing:** Simulates a server-side job queue that processes records asynchronously.
- **Real-time Progress:** Live progress bar showing processed, successful, and failed rows.
- **Partial Failure Handling:** Processes valid rows while logging errors for invalid ones (e.g., malformed numbers or duplicates).

## Tech Stack
- **Frontend:** React 19, TypeScript
- **Styling:** Tailwind CSS
- **Visualization:** Recharts
- **Icons:** Lucide React
- **State/Storage:** React State + LocalStorage (Simulated DB)

## Setup & Running

1. **Install Dependencies:**
   Ensure you have a modern Node.js environment.
   ```bash
   npm install
   ```

2. **Run the Application:**
   ```bash
   npm start
   # or
   npm run dev
   ```

3. **Open in Browser:**
   Navigate to the localhost link provided by your bundler (usually `http://localhost:5173` or `http://localhost:3000`).

## Usage Guide

### Bulk Upload CSV Format
To test the bulk upload feature, create a `.csv` file with the following header and format:

**Headers:** `ngoId, month, people, events, funds`

**Example Content:**
```csv
ngoId, month, people, events, funds
NGO-001, 2023-10, 150, 2, 50000
NGO-002, 2023-10, 300, 5, 120000
NGO-003, 2023-10, 50, 1, 10000
NGO-001, 2023-10, 100, 1, 5000
NGO-004, 2023-10, nan, 2, 5000
```

**Testing Scenarios:**
- **Success:** Upload valid rows to see the dashboard numbers update.
- **Duplicate Error:** Try uploading the same file twice or a row with an existing `ngoId` + `month`. The system will flag these as failed rows in the log.
- **Format Error:** Use text ("nan") in number fields to see validation errors.

### Testing the Async Queue
1. Go to the "Bulk Upload" tab.
2. Upload your CSV file (try 50+ rows for a longer effect).
3. Watch the progress bar fill up as the system "processes" the chunks.
4. Review the "Error Log" for any failed rows.

## Architecture & Decisions

### Simulated Backend (`services/mockBackend.ts`)
Instead of a simple CRUD app, we simulated a complex backend to demonstrate scalability concepts:
- **Artificial Latency:** `delay()` functions are injected to simulate network request times.
- **Job Polling:** The frontend polls the "backend" job status every second, mirroring a real-world pattern (like Redis/BullMQ) used for long-running server tasks.
- **Batch Processing:** The mock worker processes data in chunks to simulate heavy processing load, rather than blocking the main thread instantly.

### Component Design
- **Reusability:** UI elements like `Card` and `Button` are abstracted.
- **Tailwind CSS:** Used for rapid, responsive styling.
- **Idempotency:** Enforced at the "database" level (localStorage check) to prevent double-counting impact data.

## Future Improvements (Production Grade)
- **Backend:** Replace `localStorage` with a Node.js/PostgreSQL backend.
- **Queue:** Implement Redis/BullMQ for actual background job processing.
- **Auth:** Add JWT-based authentication for Admin vs. NGO roles.
- **Validation:** Use a library like Zod for stricter schema validation on both client and server.
