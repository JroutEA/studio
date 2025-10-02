# Development Log

This file tracks the changes made to the AI Holocron application.

---

### 2025-10-02

- **v0.1.25**: Fixed a Next.js server action error by moving the version number from `page.tsx` to `package.json` and reading it from there.
- **v0.1.24**: Implemented a more robust fix for Next.js hydration errors by gating client-side-only components and data fetching behind a `isClient` state check. This ensures server-rendered HTML matches the initial client render.
- **v0.1.23**: Resolved a Next.js hydration warning caused by browser extensions like Dark Reader modifying the DOM before hydration. Added `suppressHydrationWarning` to the root `<html>` element.
- **v0.1.22**: Fixed a Next.js hydration error caused by accessing `localStorage` on the server. Moved all `localStorage` calls into a `useEffect` hook to ensure they only run on the client-side.
- **v0.1.21**: Fixed a critical error in the Test Assistant where invalid AI responses would crash the tool by making the squad validation schema more flexible.
- **v0.1.20**: Resolved a runtime error by simplifying the error handling in the `testCaseAssistantAI` flow.
- **v0.1.19**: Corrected the dates in the DEVLOG.md file to reflect the proper timeline.
- **v0.1.18**: Corrected the dates in the DEVLOG.md file.
- **v0.1.17**: Fixed a formatting bug that caused duplicate numbering in the Test Assistant's setup instructions.

### 2025-10-01

- **v0.1.16**: Created a more comprehensive DEVLOG.md file to better track project history.
- **v0.1.15**: Implemented automatic versioning for application updates.
- **v0.1.14**: Added a static version number to the application footer.
- **v0.1.13**: Instructed the AI to treat any user-provided new character names as the "New Unit" under test.
- **vO.1.12**: Optimized AI token usage by switching the default model to the more cost-effective `gemini-2.5-flash`.
- **v0.1.11**: Refined the Test Assistant AI prompt to be more explicit about squad structure requirements, improving reliability.
- **v0.1.10**: Further improved the Test Assistant prompt to prevent invalid AI responses.
- **v0.1.9**: Added a contextual prompt title to the Test Assistant's downloadable image.
- **v0.1.8**: Fixed a JSX syntax error in the `TestCaseDisplay` component.
- **v0.1.7**: Replaced the `<h2>` title with a styled "prompt" box in the Unit Finder and Squad Builder results.
- **v0.1.6**: Added a contextual prompt title to the downloadable images for Unit Finder and Squad Builder results.
- **v0.1.5**: Added a download-as-image button to all three tabs and ensured the button itself is not visible in the downloaded image.
- **v0.1.4**: Fixed a CORS security error that occurred when downloading images with embedded Google Fonts.
- **v0.1.3**: Initial project setup and core feature implementation.
- **v0.1.2**: Initial project setup and core feature implementation.
