# Playwright TypeScript Test Automation Framework

[![Playwright](https://img.shields.io/badge/Playwright-1.44-45ba4b?logo=playwright&logoColor=white)](https://playwright.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI/CD-2088ff?logo=githubactions&logoColor=white)](https://github.com/features/actions)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ed?logo=docker&logoColor=white)](https://www.docker.com)
[![ESLint](https://img.shields.io/badge/ESLint-8-4b32c3?logo=eslint&logoColor=white)](https://eslint.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A production-quality end-to-end test automation framework demonstrating enterprise patterns for UI, API, and component-level testing. Built for a Senior QA Engineer / SDET portfolio.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [CI/CD](#cicd)
- [Docker](#docker)
- [Reports](#reports)
- [Architecture & Design Decisions](#architecture--design-decisions)
- [What This Demonstrates](#what-this-demonstrates)

---

## Project Overview

This framework covers three layers of the testing pyramid against publicly available demo applications:

| Layer | Target | Scope |
|---|---|---|
| **E2E (UI)** | [practicetestautomation.com](https://practicetestautomation.com/practice-test-login/) | Login flows, auth journeys |
| **E2E (UI)** | [demo.playwright.dev/todomvc](https://demo.playwright.dev/todomvc) | CRUD lifecycle, filter logic |
| **Component (UI)** | [demo.playwright.dev/todomvc](https://demo.playwright.dev/todomvc) | Isolated filter-bar component |
| **API** | [reqres.in](https://reqres.in) | REST CRUD, pagination, error handling |
| **API** | [jsonplaceholder.typicode.com](https://jsonplaceholder.typicode.com) | Query params, data-driven POST |

Tests are tagged `@smoke`, `@regression`, and `@data-driven` so different subsets can be targeted by CI jobs.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| [Playwright](https://playwright.dev) | Browser automation & API testing |
| [TypeScript](https://www.typescriptlang.org) | Strict type safety across the entire framework |
| [@faker-js/faker](https://fakerjs.dev) | Realistic, randomised test data generation |
| [Allure](https://allurereport.org) | Rich, stakeholder-friendly test reports |
| [GitHub Actions](https://github.com/features/actions) | CI pipeline with browser matrix |
| [Docker](https://www.docker.com) | Fully isolated, reproducible test execution |
| [ESLint](https://eslint.org) | TypeScript-aware static analysis |

---

## Folder Structure

```
.
├── .github/
│   └── workflows/
│       ├── ci.yml                  # Main CI: lint → API tests → E2E matrix
│       └── scheduled-smoke.yml     # Daily @smoke run to detect environment drift
│
├── src/
│   ├── api/
│   │   ├── base-api.client.ts      # Generic typed HTTP wrapper (GET/POST/PUT/PATCH/DELETE)
│   │   ├── reqres.client.ts        # reqres.in domain client (typed, named methods)
│   │   └── models/
│   │       ├── user.model.ts       # TypeScript interfaces for User resource
│   │       └── api-response.model.ts  # Generic ApiResult<T> discriminated union
│   │
│   ├── fixtures/
│   │   ├── base.fixture.ts         # Extended test() with injected Page Objects + API clients
│   │   └── index.ts                # Single import point: { test, expect }
│   │
│   ├── helpers/
│   │   ├── custom-assertions.ts    # Domain-specific assertion helpers
│   │   └── retry.helper.ts         # Retry-with-backoff for flaky external operations
│   │
│   ├── pages/
│   │   ├── base.page.ts            # Abstract base class: navigate, wait, assert
│   │   ├── login.page.ts           # LoginPage POM for practicetestautomation.com
│   │   ├── todo.page.ts            # TodoPage POM for TodoMVC
│   │   └── index.ts                # Barrel export
│   │
│   ├── test-data/
│   │   ├── users.json              # Static credential fixtures (valid + invalid scenarios)
│   │   ├── todo-items.json         # Todo item datasets
│   │   └── factories/
│   │       └── user.factory.ts     # Faker-based dynamic user data factory
│   │
│   └── utils/
│       ├── env.config.ts           # Typed, validated env var accessor
│       └── logger.ts               # Structured logger (level-controlled, no bare console.log)
│
├── tests/
│   ├── e2e/
│   │   ├── auth/
│   │   │   └── login.spec.ts       # Login happy path + negative + data-driven
│   │   └── todo/
│   │       └── todo-management.spec.ts  # Full CRUD lifecycle + filter + boundary
│   ├── api/
│   │   ├── users.spec.ts           # reqres.in CRUD + pagination + 404
│   │   └── posts.spec.ts           # jsonplaceholder CRUD + query params + data-driven
│   └── ui/
│       └── todo-filters.spec.ts    # Component-scoped filter bar + counter + ARIA
│
├── docker/
│   ├── Dockerfile                  # Multi-stage build; ships with all browsers
│   └── docker-compose.yml          # Mounts source + artefacts back to host
│
├── playwright-report/              # HTML report output (gitignored, kept by artefact)
├── allure-results/                 # Allure raw results (gitignored)
├── test-results/                   # Screenshots/traces/videos (gitignored)
├── .env.example                    # Document all required env vars
├── .eslintrc.json                  # TypeScript-strict ESLint rules
├── playwright.config.ts            # Multi-project config (UI browsers + API)
├── tsconfig.json                   # Strict TS with path aliases
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Install

```bash
git clone https://github.com/<your-handle>/playwright-ts-framework.git
cd playwright-ts-framework
npm ci
npx playwright install --with-deps
```

### Configure environment

```bash
cp .env.example .env
# Edit .env if you need to point at a different environment
```

The framework ships with defaults for all public demo sites, so the `.env` step is only required if you want to override URLs or credentials.

---

## Running Tests

```bash
# Full suite (all projects in playwright.config.ts)
npm test

# E2E tests — Chromium only
npm run test:e2e

# E2E tests — all three browsers
npm run test:e2e:all-browsers

# API tests only (no browser overhead)
npm run test:api

# UI / component tests
npm run test:ui

# By tag
npm run test:smoke        # @smoke tests
npm run test:regression   # @regression tests

# Headed mode (watch the browser)
npm run test:headed

# Debug mode (step through with Playwright Inspector)
npm run test:debug

# Lint + type-check
npm run lint
npm run type-check
```

### Targeting a specific spec or test

```bash
# Single spec file
npx playwright test tests/e2e/auth/login.spec.ts

# Single test by title substring
npx playwright test --grep "should log in successfully"

# Specific browser
npx playwright test --project=firefox
```

---

## CI/CD

### Pipeline overview

```
Push / PR
    │
    ├── lint-and-typecheck       ← ESLint + tsc --noEmit (fails fast)
    │
    ├── api-tests                ← reqres.in + jsonplaceholder (no browser)
    │
    └── e2e-tests (matrix)
            ├── chromium
            ├── firefox
            └── webkit
```

- **Fail-fast is disabled** on the browser matrix so you see results from all three browsers in one run.
- **2 retries** on CI catch genuine flakiness; local runs use 0 retries for fast feedback.
- **Concurrency cancellation** prevents wasted minutes when a newer commit is pushed.

### Required GitHub Secrets

| Secret | Value |
|---|---|
| `TEST_USERNAME` | `student` |
| `TEST_PASSWORD` | `Password123` |

Add these under **Settings → Secrets and variables → Actions**.

### Scheduled smoke run

A separate workflow (`scheduled-smoke.yml`) runs `@smoke`-tagged tests on Chromium and the API project every morning at 06:00 UTC. This catches environment drift (site outages, API changes) before the team starts work.

---

## Docker

```bash
# Build the image
docker build -f docker/Dockerfile -t playwright-ts-framework:local .

# Run the full suite
docker-compose -f docker/docker-compose.yml run --rm playwright

# Run only smoke tests
docker-compose -f docker/docker-compose.yml run --rm playwright \
  npx playwright test --grep @smoke

# Run API tests only
docker-compose -f docker/docker-compose.yml run --rm playwright \
  npx playwright test tests/api

# Run a specific browser
docker-compose -f docker/docker-compose.yml run --rm playwright \
  npx playwright test --project=firefox
```

Test artefacts (reports, screenshots, traces) are mounted back to the host under `playwright-report/`, `test-results/`, and `allure-results/`.

---

## Reports

### Playwright HTML Report

```bash
# Generate during a test run (automatic), then open
npm run report:html
```

The report is saved to `playwright-report/` and includes screenshots, videos, and step-level traces for every failing test.

### Allure Report

Allure requires the [Allure CLI](https://allurereport.org/docs/install/) (`npm install -g allure-commandline`).

```bash
# Run tests (results written to allure-results/)
npm test

# Generate the static report
npm run report:allure:generate

# Open in the default browser
npm run report:allure:open

# Serve live (auto-refreshes)
npm run report:allure:serve
```

The Allure report provides:
- Suite / feature / story grouping
- Trend graphs across runs (when history is retained)
- Full step logs with attachments
- Environment info panel

---

## Architecture & Design Decisions

### Page Object Model

Every page has a dedicated class (`src/pages/`) that extends `BasePage`. Tests never contain selectors — they call named methods. This means a selector change requires a fix in exactly one place.

### Fixture-based dependency injection

Playwright's `test.extend()` injects page objects and API clients directly into test functions. Tests declare what they need; the framework provides it. There are no global variables, no `beforeAll` shared state, and no test ordering dependencies.

### Typed API client with discriminated union responses

The `BaseApiClient` returns `ApiResult<T>` — a `{ ok: true, data: T }` / `{ ok: false, error: string }` discriminated union. TypeScript forces callers to handle the failure case before accessing `data`, eliminating an entire class of unchecked runtime errors.

### Environment configuration

`env.config.ts` wraps `process.env` with typed accessors that throw at startup for missing required variables. Runtime crashes mid-test from `undefined` env vars are impossible.

### Test data management

- **Static JSON fixtures** (`src/test-data/*.json`) for stable, human-readable scenarios that double as documentation.
- **Faker factories** (`src/test-data/factories/`) for unique, randomised payloads in data-driven tests. Faker is seeded via `FAKER_SEED` so CI failures are reproducible.

### Tagging strategy

Tests are tagged `@smoke`, `@regression`, or `@data-driven`. CI runs `@smoke` on every commit for fast feedback and the full `@regression` suite on PRs and nightly. This mirrors real-world tiered test strategies.

### Structured logging

A custom `logger.ts` replaces bare `console.log` calls. Log level is controlled by `LOG_LEVEL` env var. All output is timestamped and level-prefixed for easy parsing by log aggregators (Datadog, CloudWatch, etc.).

---

## What This Demonstrates

| Skill | Evidence |
|---|---|
| **Page Object Model** | `src/pages/` — `BasePage` + specialised page classes, no selectors in tests |
| **Custom Playwright fixtures** | `src/fixtures/base.fixture.ts` — DI of page objects and API clients |
| **Typed API testing** | `src/api/` — generic base client, typed responses, discriminated union error handling |
| **TypeScript strict mode** | `tsconfig.json` — `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` |
| **Data-driven testing** | `for...of` parameterisation over JSON fixtures and Faker-generated data |
| **Negative test coverage** | Invalid credentials, 404 responses, empty input boundary cases |
| **Multi-browser matrix** | `playwright.config.ts` — Chromium, Firefox, Webkit + mobile viewport |
| **CI/CD pipeline design** | Two workflows: PR gate (lint → API → E2E matrix) + scheduled smoke |
| **Docker containerisation** | Multi-stage build with mounted artefacts; composable service definition |
| **Reporting (dual stack)** | HTML reporter + Allure with rich attachments and trend history |
| **Environment management** | `.env.example`, typed `env.config.ts`, per-environment URL overrides |
| **Code quality tooling** | ESLint with TypeScript strict rules; `no-console` enforced framework-wide |
| **Structured logging** | Level-controlled logger — no stray debug output in CI |
| **Retry / resilience** | `retry.helper.ts` with configurable backoff for external operations |
| **Test organisation** | Tag-based targeting (`@smoke`, `@regression`, `@data-driven`), clear folder hierarchy |
