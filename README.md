# ATtune: A Decentralised Social Media platform for Music Interaction

Student Name: Devin Rajesh Rathod

Student ID: 220109084

## Description:

Developing a music-focused web application that allows users to explore and share music-related content through a DSN, utilising the AT protocol to define a new approach to the practical implementation of social interaction.

## Installation & Setup

### Prerequisites:

- Node.js (v20 or above)
- npm

To run ATtune, run the following commands in your terminal:

To install all dependencies:

```
npm run install
```

To locally run the application:

```
npm run dev
```

To run unit tests:

```
npm run test
```

To run unit tests with coverage:

```
npm run test:coverage
```

To run functional tests:

```
npx playwright test
```

To run functional tests, UI mode:

```
npx playwright test --ui
```

Log in with the following credentials to try out the application:

Handle/Email

```
devintest.bsky.social
```

App Password

```
2zo7-fjsk-y772-wn3r
```

## Project Structure:

### Key Directories shown from top to bottom

`/__tests__`: contains the unit tests using Vitest and React Testing Library (RTL) in `/__tests__/components`, `/__tests__/hooks`, `/__tests__/lib`

`/.github/workflows`: contains the GitHub Actions ran for CI/CD builds for Next.js and Playwright

`/e2e`: consists of `/content` and `/page` which is the content associated with each POM and the functional tests produced are the `.spec.ts` ending files.

`/src` - contains `/app`, `/components`, `/contexts`, `/lexicons` and `/lib`

`src/app` - contains the main pages for the application. Most pages have a `layout.tsx` which gives each page their title and the `page.tsx` contains the calls to components and hooks.

`src/components` - contains the components used in the pages. Components are grouped by directories if they are used on one page.

`src/contexts` - contains the AuthContext to allow for session management within the application.

`src/lexicons` - defines the custom Lexicon schemas for the Profile and Review records.

`src/lib` - contains the library files such as to communicate with AT protocol and Last.fm API and also utility functions.
