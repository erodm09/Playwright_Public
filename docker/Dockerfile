# ============================================================
#  Playwright test runner image
#
#  Uses the official Playwright image which bundles all browser
#  binaries — no separate `playwright install` step required.
#  Pinning a specific version ensures reproducible CI builds.
# ============================================================

# Stage 1 — dependency installation (cached separately from source)
FROM mcr.microsoft.com/playwright:v1.44.0-jammy AS deps

WORKDIR /app

# Copy manifests first so Docker layer cache is reused when only
# source files change (not package.json / package-lock.json)
COPY package.json package-lock.json ./

RUN npm ci --ignore-scripts

# ============================================================
# Stage 2 — test runner
# ============================================================
FROM mcr.microsoft.com/playwright:v1.44.0-jammy AS runner

WORKDIR /app

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source and config files
COPY . .

# Default environment — override via docker run -e or docker-compose env_file
ENV CI=true \
    BASE_URL=https://practicetestautomation.com \
    TODO_BASE_URL=https://demo.playwright.dev/todomvc \
    API_BASE_URL=https://jsonplaceholder.typicode.com \
    HEADLESS=true

# Artefact directories must exist before Playwright tries to write to them
RUN mkdir -p playwright-report test-results allure-results

# Default command — run the full suite. Override at `docker run` time:
#   docker run <image> npx playwright test tests/api
CMD ["npx", "playwright", "test"]
