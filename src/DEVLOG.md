# Development Log

This file tracks the changes made to the Holocron 2.0 application.

---

- **v1.1.1**: Implemented a fallback mechanism for OpenAI models to improve reliability. If the primary model fails, the system will automatically try secondary models.

- **v1.1.0**: Switched the generative AI provider from Google Gemini to OpenAI, replacing `@genkit-ai/googleai` with the `genkitx-openai` community plugin. All model references have been updated to use the `openai/` prefix (e.g., `openai/gpt-4o`).

- **v1.0.0**: Reset the development log and introduced a new versioning scheme (`v1.A.xyz`, where 'A' is for major features and 'xyz' for smaller commits) to mark a new phase of the project.
