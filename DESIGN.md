# The AI Holocron: Design & Features

## 1. Overview

The AI Holocron is an advanced, AI-powered web application designed to assist players and Quality Assurance (QA) testers of the mobile game *Star Wars: Galaxy of Heroes (SWGOH)*. By leveraging generative AI, it provides intelligent tools for finding in-game units, constructing effective squads, and accelerating the quality assurance process for new unit development.

The application is built around three core features, each accessible through a dedicated tab:
- **Unit Finder:** For discovering specific characters and ships.
- **Squad Builder:** For creating strategic teams.
- **Test Assistant:** For generating detailed QA test cases.

---

## 2. Problem Statement

The core purpose of the AI Holocron is to solve specific bottlenecks faced by the SWGOH QA team and player community:

-   **For QA Testers:**
    -   **Finding Test Units:** Manually searching for existing in-game units with specific abilities (e.g., "a character that applies 'Evasion Down'") to test a new mechanic is slow and requires deep game knowledge. The **Unit Finder** automates this discovery process.
    -   **Creating Test Squads:** Building appropriate allied and opponent squads to create precise pre-conditions for testing a new unit's ability is time-consuming and challenging. The **Squad Builder** and **Test Assistant** are designed to generate these squads intelligently.
    -   **Onboarding New Testers:** New team members often struggle to set up the correct pre-conditions for a test. The **Test Assistant** acts as an expert guide, providing step-by-step instructions and removing ambiguity, thus accelerating the onboarding process.

-   **For Players:**
    -   **Team Composition:** Players often need help building effective squads to clear difficult content like Galactic Challenges or to counter specific opponent teams in PvP modes. The **Squad Builder** provides tailored solutions.
    -   **Unit Discovery:** Players looking to expand their roster or find units with specific mechanics to complement their existing squads can use the **Unit Finder** to explore options.

---

## 3. Core Features

### a. Unit Finder

- **Purpose:** To help users find specific characters or ships by describing their abilities, faction, or role in natural language.
- **Functionality:** Users can input queries like _"Rebel attackers that apply debuffs"_ or _"Sith ships with an AoE attack"_. The AI uses its integrated knowledge of SWGOH and real-time wiki searches to return a list of matching units. Results are displayed in a clean, text-based table where each unit's name is a direct hyperlink to its `swgoh.gg` page, accompanied by a concise description of how it matches the query.
- **Benefit for Unit Testing:** While primarily a player tool, the Unit Finder is invaluable for QA testers. It allows them to quickly identify existing characters with specific mechanics needed for a test scenario. For example, a tester can find characters with high Evasion to test a "can't be evaded" ability, or find all units that can apply a specific buff like "Tenacity Up".

### b. Squad Builder

- **Purpose:** To generate effective 5-character squads tailored to a user's strategic goal, such as countering a specific team or completing a particular game mode.
- **Functionality:** Users can describe their objective, such as _"a team to beat the Geonosian squad in Territory War"_ or _"a Phoenix squad for a beginner"_. The AI designs multiple squad options. Each result includes a concise strategy description and a clear, text-based list of characters, with the **Leader** and optional **Ally** explicitly labeled.
- **Benefit for Galactic Challenges (GCs):** Galactic Challenges often require using specific factions and countering unique gameplay modifiers (e.g., enemies gain massive stats when they receive a buff). The Squad Builder is extremely helpful here:
    - **Feat Completion:** Users can ask for a squad that fulfills specific GC feats, such as _"a Bounty Hunter squad that can inflict Thermal Detonators 20 times."_
    - **Countering Modifiers:** Users can describe the GC's main difficulty and ask for a counter, like _"create a squad that can beat the GC where enemies take reduced damage from debuffed units."_
    - **Faction-Specific Squads:** It can quickly generate the best possible squad from a limited faction roster, which is a common requirement in GCs.

### c. Test Assistant

- **Purpose:** To dramatically speed up the QA process by automatically generating detailed test cases for new or updated unit abilities. This is the application's primary function for unit testing.
- **Functionality:** A QA tester provides three key pieces of information:
    1.  **The 'new_unit ability design':** The full text of the new ability from the design document.
    2.  **The Test Scenario (test_step):** The specific interaction or condition they want to verify.
    3.  **The Expected Result:** The pass/fail condition for the test.
- **Benefit for Unit Testing:** The AI acts as a senior QA expert and provides a complete, ready-to-use test plan:
    - **Intelligent Squad Selection:** It designs both an **Allied Squad** (including the new unit) and a specific **Opponent Squad** whose abilities are perfectly suited to create the necessary test conditions. For example, to test an anti-revive mechanic, it will create an opponent squad with a reviver like Mother Talzin.
    - **Step-by-Step Instructions:** It generates a precise, ordered list of actions the tester must perform in-battle to trigger the test scenario correctly.
    - **Clear Pass/Fail Criteria:** It provides unambiguous, observable outcomes that define whether the test has passed or failed, removing guesswork.

By automating the most time-consuming parts of test case design—namely, opponent selection and setup procedure—the Test Assistant allows QA teams to increase test coverage and focus on executing tests rather than designing them.

---

## 4. Additional Features & UX

Several key features have been implemented to improve usability and handle potential issues gracefully:

-   **Download as Image:** All generated results (Unit Lists, Squads, Test Cases) can be downloaded as a high-quality PNG image for easy sharing and documentation. The downloaded image includes a disclaimer that the content is AI-generated.
-   **Query History & Saved Squads:** The application maintains a local history of past queries for each tab. Users can also "star" and save their favorite squads for quick access.
-   **Undo on Delete:** To prevent accidental data loss, deleting an item from the history displays a toast notification with a 5-second "Undo" option.
-   **AI Fallback Mechanism:** In the event of an AI generation failure (e.g., due to a model timeout or content filter), the application provides a fallback. It displays the full, detailed prompt that was sent to the AI, along with a copy button. This allows the user to take the expert-crafted prompt to another generative AI app, ensuring their workflow is never completely blocked.
-   **Concurrency Control:** While an AI query is in progress, all submission buttons are disabled to prevent users from accidentally starting multiple requests at once. However, the user can still freely switch between tabs to view other content.

---

## 5. Technical Challenges & Limitations

The application relies on powerful generative AI models, which introduces several inherent challenges:

-   **Model Reliability & Timeouts:** The AI models, particularly for the complex **Test Assistant** feature, are performing a demanding task that can sometimes lead to a timeout (surfacing as a 503 error). The model may be temporarily unavailable or simply take too long to generate a response. The fallback prompt mechanism is designed to mitigate the impact of this.
-   **Token Limits:** Each AI model has a "context window" (a token limit) that caps the combined size of the input prompt and the generated output. The **Test Assistant** uses the more powerful `gemini-2.5-pro` model specifically because its larger context window is necessary to handle the large input and generate the required detailed output without hitting this limit. The `gemini-2.5-flash` model used for other features is more efficient but has a smaller limit.
-   **Rate Limiting:** The more powerful `gemini-2.5-pro` model is subject to stricter rate limits (e.g., requests per minute) by the AI platform to ensure service stability. Making multiple complex requests in a short period can trigger these limits, resulting in temporary failures. The current solution is to wait a short time between demanding requests.
-   **Response Hallucination/Formatting:** AI models can occasionally produce responses that are factually incorrect ("hallucinated") or do not perfectly adhere to the requested JSON schema. The application includes a "repair" layer that attempts to fix minor formatting issues, but significant deviations can still cause validation errors.
