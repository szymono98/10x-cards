# 10x-cards

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Testing](#testing)
- [Project Status](#project-status)
- [License](#license)

## Project Description

10x-cards is a flashcards application that enables users to quickly create and manage study flashcards. It leverages advanced LLM models (via an API) to generate question and answer suggestions based on input text, reducing the time and effort required to create high-quality learning materials. Additionally, users can manually create, edit, and delete flashcards and benefit from spaced repetition for effective learning.

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript 5, Tailwind CSS 4, Shadcn/ui
- **Backend & Database:** Supabase
- **AI Communication:** Openrouter.ai
- **Testing:**
  - **Unit & Integration:** Vitest, React Testing Library, MSW (Mock Service Worker)
  - **E2E:** Playwright
  - **Visual Testing:** Percy/Chromatic (optional)
  - **Accessibility:** axe-core
- **CI/CD & Hosting:** GitHub Actions, Cloudflare Pages

## Getting Started Locally

1. Ensure you have Node.js version **22.14.0** (see [`.nvmrc`](./.nvmrc)).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- **dev:** Runs the development server.
- **build:** Builds the project for production.
- **start:** Starts the production server.
- **lint:** Lints the project code.
- **format:** Checks code format with Prettier.
- **format:fix:** Fixes code formatting issues with Prettier.
- **test:** Runs unit and integration tests with Vitest.
- **test:ui:** Runs Vitest with UI interface for interactive debugging.
- **test:e2e:** Runs end-to-end tests with Playwright.
- **test:coverage:** Generates test coverage report.

## Project Scope

The project focuses on the following key functionalities:

- **Automatic Flashcard Generation:** Paste text, generate flashcard proposals using an LLM API, and review or edit generated flashcards.
- **Manual Flashcard Management:** Create, edit, and delete flashcards manually.
- **User Authentication:** Registration, login, and secure access to flashcards.
- **Spaced Repetition Learning:** Integrate a scheduling algorithm for effective learning through review sessions.
- **Statistics and Analytics:** Track AI-generated flashcard usage and user engagement.

## Testing

The project uses a comprehensive testing strategy:

- **Unit & Integration Tests:**

  - Vitest as the test runner (faster alternative to Jest)
  - React Testing Library for component testing
  - MSW (Mock Service Worker) for API mocking
  - Testing Library User Event for simulating user interactions

- **End-to-End Tests:**

  - Playwright for browser-based end-to-end testing
  - Tests cover critical user flows including:
    - Authentication (registration, login, password reset)
    - Flashcard generation and editing
    - Saving and managing flashcards
    - Protected route access

- **Additional Testing Tools:**
  - axe-core for accessibility testing
  - Percy/Chromatic for visual regression testing (optional)
  - GitHub Actions for CI/CD test automation
  - Supabase mock client for database integration testing

Run tests using the following commands:

```bash
# Unit and integration tests
npm test

# E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

## Project Status

This project is in **MVP** stage and under active development. Future enhancements may include additional features and optimizations.

## License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.
