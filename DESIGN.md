# The AI Holocron: Design & Features

## 1. Overview

The AI Holocron is an advanced, AI-powered web application designed to assist players and QA testers of the mobile game *Star Wars: Galaxy of Heroes (SWGOH)*. By leveraging generative AI, it provides intelligent tools for finding in-game units, constructing effective squads, and accelerating the quality assurance process for new unit development.

The application is built around three core features, each accessible through a dedicated tab:
- **Unit Finder:** For discovering specific characters and ships.
- **Squad Builder:** For creating strategic teams.
- **Test Assistant:** For generating detailed QA test cases.

---

## 2. Core Features

### a. Unit Finder

- **Purpose:** To help users find specific characters or ships by describing their abilities, faction, or role in natural language.
- **Functionality:** Users can input queries like _"Rebel attackers that apply debuffs"_ or _"Sith ships with an AoE attack"_. The AI uses its integrated knowledge of SWGOH and real-time wiki searches to return a list of matching units, complete with descriptions, icons, and links to their `swgoh.gg` pages.
- **Benefit for Unit Testing:** While primarily a player tool, the Unit Finder is invaluable for QA testers. It allows them to quickly identify existing characters with specific mechanics needed for a test scenario. For example, a tester can find characters with high Evasion to test a "can't be evaded" ability, or find all units that can apply a specific buff like "Tenacity Up".

### b. Squad Builder

- **Purpose:** To generate effective 5-character squads tailored to a user's strategic goal, such as countering a specific team or completing a particular game mode.
- **Functionality:** Users can describe their objective, such as _"a team to beat the Geonosian squad in Territory War"_ or _"a Phoenix squad for a beginner"_. The AI designs multiple squad options, each with a leader, four members, an optional ally, a squad name, and a concise strategy description.
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
