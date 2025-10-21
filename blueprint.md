# Project Blueprint

## Overview

This is a Vue.js application for managing bookings. It includes an admin view to create appointment slots and a booking view for users to book them.

## Features & Design

*   **Framework:** Vue.js with Vite
*   **Language:** JavaScript with Composition API
*   **Styling:** Scoped CSS in components.
*   **Backend:** Firebase Firestore for data storage.
*   **Views:**
    *   Admin View (`/admin`): A form for creating new time slots.
    *   Booking View (`/`): A view for users to see and book available slots.
    *   Not Found (`/*`): A catch-all route for invalid paths.
*   **Firebase Integration:** The application uses Firebase Firestore to manage booking data.

## Current Task: Refactor Firebase Configuration

The goal is to modernize the Firebase setup by using the modular SDK and environment variables for configuration. This improves security and performance.

**Plan:**

1.  **Create `blueprint.md`:** To document the project and the current task.
2.  **Update Firebase Configuration:**
    *   Delete the old `src/services/firebaseConfig` file.
    *   Create a new `src/services/firebaseConfig.js` that uses the modern Firebase SDK and pulls its configuration from environment variables (`.env.local`).
3.  **Update Component Imports:**
    *   Modify `src/components/AdminView.vue` to import from the new `firebaseConfig.js`.
    *   Check other files for imports that need to be updated.
4.  **Provide Instructions:**
    *   Explain how to create the `.env.local` file to store Firebase project credentials.
