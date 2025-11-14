# Cypress E2E Testing

This directory contains end-to-end (E2E) tests for the Occasional WOTD application using Cypress 15.6.0.

## Overview

The Cypress test suite covers:

- **Homepage** - Main landing page with word of the day
- **Word Detail Pages** - Individual word pages with definitions
- **Browse Pages** - Browsing by year, month, letter, length, and part of speech
- **Stats Pages** - Statistics and analysis pages
- **API Endpoints** - JSON, RSS, health check, and other API endpoints
- **Error Pages** - 404 and error handling
- **Downstream Builds** - Multi-site configuration testing (e.g., wordbug.fyi, wordbun.fyi)

## Running Tests

### Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the site with demo data:
   ```bash
   SOURCE_DIR=demo npm run build
   ```

3. Start the preview server:
   ```bash
   npm run preview
   ```

### Run Tests

**Open Cypress Test Runner (Interactive):**
```bash
npm run test:e2e:open
```

**Run Tests in Headless Mode:**
```bash
npm run test:e2e
```

**Run Tests with Browser Visible:**
```bash
npm run test:e2e:headed
```

**Run All Tests (Unit + E2E):**
```bash
npm run test:all
```

## Test Structure

```
cypress/
├── e2e/                          # Test files
│   ├── homepage.cy.js            # Homepage tests
│   ├── word-detail.cy.js         # Word detail page tests
│   ├── browse.cy.js              # Browse pages tests
│   ├── stats.cy.js               # Stats pages tests
│   ├── api-endpoints.cy.js       # API endpoint tests
│   ├── error-pages.cy.js         # 404 and error tests
│   └── downstream-builds.cy.js   # Multi-site build tests
├── fixtures/                     # Test data files
├── support/                      # Support files
│   ├── commands.js               # Custom commands
│   └── e2e.js                    # Support file
├── screenshots/                  # Screenshots (on failure)
├── videos/                       # Test videos
└── README.md                     # This file
```

## Custom Commands

The test suite includes several custom Cypress commands:

### `cy.checkPageMetadata(title, description)`
Checks that a page has proper metadata (title and description).

```javascript
cy.checkPageMetadata('Homepage', 'Welcome to our site');
```

### `cy.checkStructuredData(expectedType)`
Verifies that structured data (JSON-LD) exists and has the expected type.

```javascript
cy.checkStructuredData('WebSite');
```

### `cy.checkNoConsoleErrors()`
Checks that no console errors occurred during page load.

```javascript
cy.checkNoConsoleErrors();
```

### `cy.checkA11yBasics()`
Performs basic accessibility checks (landmarks, headings, alt text).

```javascript
cy.checkA11yBasics();
```

### `cy.checkResponsive()`
Tests the page across multiple viewport sizes.

```javascript
cy.checkResponsive();
```

## Testing Different Configurations

The application supports multiple site configurations (e.g., wordbug.fyi, wordbun.fyi) using the `SOURCE_DIR` environment variable.

### Test with Demo Data:
```bash
SOURCE_DIR=demo npm run build
npm run preview
npm run test:e2e
```

### Test with Different Data:
```bash
SOURCE_DIR=your-data-dir npm run build
npm run preview
npm run test:e2e
```

## Continuous Integration

The E2E tests run automatically in GitHub Actions:

- **Workflow**: `.github/workflows/test-e2e.yml`
- **Triggers**: Pull requests to `main` and pushes to `main`
- **Environment**: Ubuntu latest with Node 20
- **Browser**: Chrome

The CI workflow:
1. Builds the site with demo data
2. Starts the preview server
3. Runs all Cypress tests
4. Uploads screenshots and videos on failure

## Best Practices

### What to Test in E2E

✅ **Good for E2E tests:**
- User flows and navigation
- Page loads and rendering
- API endpoint responses
- Cross-page interactions
- Different viewport sizes
- Error handling (404s, etc.)
- Multi-configuration builds

❌ **Better as unit tests:**
- Utility function logic
- Data transformations
- Edge cases in algorithms
- Complex calculations

### Avoiding Duplication

This test suite focuses on integration and user flows, avoiding duplication with the existing Vitest unit tests. Unit tests cover:

- Adapter logic (`tests/adapters/`)
- Utility functions (`tests/utils/`)
- Configuration (`tests/config/`)
- Constants (`tests/constants/`)

## Debugging Tests

### View Test Videos

After running tests, videos are saved to `cypress/videos/`.

### Screenshots on Failure

When a test fails, Cypress automatically captures a screenshot in `cypress/screenshots/`.

### Interactive Mode

Run tests in interactive mode to debug:
```bash
npm run test:e2e:open
```

This opens the Cypress Test Runner where you can:
- Run individual tests
- See test execution in real-time
- Use browser DevTools
- Time-travel through test steps

### Cypress DevTools

Use `.debug()` in your tests to pause execution:
```javascript
cy.visit('/');
cy.debug(); // Pauses here
cy.get('h1').should('exist');
```

## Writing New Tests

### Test File Naming

- Use `.cy.js` extension (e.g., `my-feature.cy.js`)
- Place in `cypress/e2e/` directory
- Name descriptively based on the feature

### Test Structure

```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    cy.visit('/path');
  });

  it('should do something specific', () => {
    // Arrange
    cy.get('selector');

    // Act
    cy.click();

    // Assert
    cy.url().should('include', 'expected');
  });
});
```

### Best Practices for Writing Tests

1. **Use data attributes for selectors** when possible:
   ```javascript
   cy.get('[data-cy="submit-button"]')
   ```

2. **Avoid hardcoded waits**:
   ```javascript
   // Bad
   cy.wait(1000);

   // Good
   cy.get('.element').should('be.visible');
   ```

3. **Test user behavior, not implementation**:
   ```javascript
   // Bad
   cy.get('.internal-class-name');

   // Good
   cy.get('button').contains('Submit');
   ```

4. **Keep tests independent**:
   Each test should be able to run independently without relying on other tests.

5. **Use descriptive test names**:
   ```javascript
   // Bad
   it('test 1', () => {});

   // Good
   it('should display error message when form is submitted empty', () => {});
   ```

## Configuration

### Cypress Configuration

Edit `cypress.config.js` to modify:
- Base URL
- Viewport size
- Timeouts
- Video/screenshot settings
- Browser settings

### Environment Variables

Create `cypress.env.json` for environment-specific config:
```json
{
  "apiUrl": "http://localhost:4321"
}
```

Access in tests:
```javascript
const apiUrl = Cypress.env('apiUrl');
```

## Troubleshooting

### Tests failing with "baseUrl not set"

Make sure the preview server is running:
```bash
npm run preview
```

### Port 4321 already in use

Kill the process using the port:
```bash
lsof -ti:4321 | xargs kill -9
```

Or use a different port in `cypress.config.js`.

### Cypress binary not found

Install Cypress manually:
```bash
npx cypress install
```

### Tests timing out

Increase timeout in `cypress.config.js`:
```javascript
{
  defaultCommandTimeout: 10000,
  pageLoadTimeout: 60000
}
```

## Resources

- [Cypress Documentation](https://docs.cypress.io)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Cypress GitHub Actions](https://github.com/cypress-io/github-action)

## Contributing

When adding new features:

1. Write E2E tests for user-facing functionality
2. Ensure tests pass locally before committing
3. Update this README if adding new test patterns
4. Keep tests focused and independent
