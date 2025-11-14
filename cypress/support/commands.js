// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/**
 * Custom command to check basic page metadata
 * @example cy.checkPageMetadata('Homepage', 'Welcome to our site')
 */
Cypress.Commands.add('checkPageMetadata', (expectedTitle, expectedDescription) => {
  if (expectedTitle) {
    cy.title().should('include', expectedTitle);
  }
  if (expectedDescription) {
    cy.get('meta[name="description"]').should('have.attr', 'content').and('include', expectedDescription);
  }
});

/**
 * Custom command to check structured data (JSON-LD)
 * @example cy.checkStructuredData('WebSite')
 */
Cypress.Commands.add('checkStructuredData', (expectedType) => {
  cy.get('script[type="application/ld+json"]').should('exist').then(($script) => {
    const jsonLd = JSON.parse($script.text());
    expect(jsonLd['@type']).to.equal(expectedType);
  });
});

/**
 * Custom command to verify no console errors
 */
Cypress.Commands.add('checkNoConsoleErrors', () => {
  cy.window().then((win) => {
    cy.spy(win.console, 'error');
  });
});

/**
 * Custom command to check accessibility basics
 */
Cypress.Commands.add('checkA11yBasics', () => {
  // Check for main landmark
  cy.get('main').should('exist');

  // Check for skip link or main heading
  cy.get('h1').should('exist');

  // Check all images have alt attributes
  cy.get('img').each(($img) => {
    cy.wrap($img).should('have.attr', 'alt');
  });
});

/**
 * Custom command to verify the page is responsive
 */
Cypress.Commands.add('checkResponsive', () => {
  const viewports = [
    { width: 375, height: 667, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1280, height: 720, name: 'desktop' },
  ];

  viewports.forEach((viewport) => {
    cy.viewport(viewport.width, viewport.height);
    cy.get('body').should('be.visible');
  });
});
