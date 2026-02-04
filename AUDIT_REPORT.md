# Website Audit Report & Fix Strategy

## 🔴 Critical Issues Audit

### 1. Responsiveness
*   **Mobile (320px+)**: `ProductDemo` grid is not optimized for very small screens. Text areas might overflow.
*   **Tablet (640px+)**: Dashboard grid cards might get squeezed.
*   **Ultra-wide (1920px+)**: Max-width constraints needed to prevent stretching.

### 2. AI / API Demo
*   **Current State**: `ProductDemo.tsx` is completely visual (fake). No real audio generation.
*   **Requirement**: Needs actual API connection with fallback to mock if API key missing.
*   **Security**: Demo endpoint must be rate-limited and captcha-protected (or simplified for this task).

### 3. UX & Stability
*   **Error States**: Dashboard history fetch lacks try/catch error UI (just logs to console).
*   **Loading**: Skeletons are present but basic.

---

## 🛠 Fix Strategy

### Phase 1: Responsive Core
*   Update `ProductDemo.tsx` to use `grid-cols-1 md:grid-cols-3` (already there but needs distinct verify).
*   Ensure `AppLayout` mobile menu works on 320px devices.
*   Fix `DashboardPage` card heights to be uniform.

### Phase 2: Demo AI API (Task 3 & 4)
*   **Backend**: Create `POST /api/tts/demo` (Unprotected but capped).
*   **Frontend**: Connect `ProductDemo` to this endpoint.
*   **Fallback**: If backend fails or hits limit, return a pre-signed "Mock Audio" URL.

### Phase 3: Performance & Polish
*   Add `Suspense` boundaries.
*   Optimize `Framer Motion` animations (use `layout` prop carefully).

---

## 📅 Execution Plan
1.  **Backend**: Add Demo Controller.
2.  **Frontend**: detailed responsive fix on `ProductDemo`.
3.  **Integration**: Connect the two.
4.  **Verify**: Check all breakpoints.
