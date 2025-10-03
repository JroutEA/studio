
# Development Log

This file tracks the changes made to the AI Holocron application.

---

### 2025-10-03

- **v0.1.34**: Optimized the Test Assistant feature for significantly lower token usage. Removed the generation of image/page URLs and pass/fail criteria from the AI prompt, and updated the UI to a simpler, text-based squad list. This improves performance and reduces cost.
- **v0.1.33**: Optimized the Unit Finder and Squad Builder for token usage and UI clarity. Unit Finder now shows 6 units initially, loads 3 more, and uses a streamlined text-based list. Squad Builder now loads 1 squad at a time, uses a text-only list with clear labels, and no longer generates a squad name. Added a disclaimer about AI-generated content to all results. Disabled query buttons during AI processing to prevent concurrent requests.

### 2025-10-02

- **v0.1.32**: Added a robust validation and repair layer to the `testCaseAssistantAIFlow`. This intercepts the AI's output and fixes common structural inconsistencies on the fly, dramatically increasing the reliability of the Test Assistant feature and preventing schema validation errors.
- **v0.1.31**: Removed a try/catch block in the `testCaseAssistantAIFlow` to expose more detailed underlying errors from the AI model, aiding in debugging persistent response validation failures.
- **v0.1.30**: Upgraded the Test Assistant AI flow to use the more powerful `gemini-2.5-pro` model to handle its complex generation task and avoid token limits.
- **v0.1.29**: Implemented a fallback mechanism to display the full, copy-able AI prompt when a generation error occurs, ensuring users are never blocked.
- **v0.1.28**: Added a robust validation and repair layer to the `testCaseAssistantAIFlow`. This intercepts the AI's output and fixes common structural inconsistencies on the fly, dramatically increasing the reliability of the Test Assistant feature and preventing schema validation errors.
- **v0.1.27**: Removed a try/catch block in the `testCaseAssistantAIFlow` to expose more detailed underlying errors from the AI model, aiding in debugging persistent response validation failures.
- **v0.1.26**: Fixed a hydration error by adding `suppressHydrationWarning` to the root layout.
- **v0.1.25**: Implemented a client-side rendering gate to prevent hydration errors caused by `localStorage` access on initial render.
- **v0.1.24**: Corrected the import path for `package.json` in `src/app/page.tsx` to resolve a build failure.
- **v0.1.23**: Fixed a server action error by correctly reading the version from `package.json`.
- **v0.1.22**: Resolved a persistent hydration error by ensuring client-side code only runs after component mounting.
- **v0.1.21**: Made the `members` array in the `testCaseAssistantAI` schema more flexible to prevent validation failures.
- **v0.1.20**: Simplified error handling in the `testCaseAssistantAI` flow to better surface root causes.
- **v0.1.19**: Added robust validation and repair logic to all three AI flows to handle malformed model outputs gracefully.
- **v0.1.18**: Fixed a formatting bug that caused duplicate numbering in the Test Assistant's setup instructions.
- **v0.1.17**: Corrected the dates in the DEVLOG.md file to reflect the proper timeline.

### 2025-10-01

- **v0.1.16**: Created a more comprehensive DEVLOG.md file to better track project history.
- **v0.1.15**: Implemented automatic versioning for application updates.
- **v0.1.14**: Added a static version number to the application footer.
- **v0.1.13**: Instructed the AI to treat any user-provided new character names as the "New Unit" under test.
- **v0.1.12**: Optimized AI token usage by switching the default model to the more cost-effective `gemini-2.5-flash`.
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
