describe('Homepage', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load successfully', () => {
    cy.get('body').should('be.visible');
  });

  it('should display the site title and logo', () => {
    cy.get('header').should('be.visible');
    // Logo should link to homepage
    cy.get('header a[href="/"]').should('exist');
  });

  it('should display the current word of the day', () => {
    // Main content should have a word displayed
    cy.get('main').should('be.visible');

    // Should have a primary word heading
    cy.get('h1, h2').should('exist').and('be.visible');

    // Should display the word's definition
    cy.get('main').should('contain.text', 'noun').or('contain.text', 'verb').or('contain.text', 'adjective');
  });

  it('should display recent words section', () => {
    // Recent words should be visible
    cy.get('main').should('contain.text', 'Recent');

    // Should have links to recent words
    cy.get('a[href^="/word/"]').should('have.length.at.least', 1);
  });

  it('should have working navigation links', () => {
    // Check main navigation
    cy.get('nav, header').within(() => {
      cy.get('a[href="/browse"]').should('exist');
      cy.get('a[href="/stats"]').should('exist');
    });
  });

  it('should have proper metadata', () => {
    // Check title exists and contains site name
    cy.title().should('not.be.empty');

    // Check meta description
    cy.get('meta[name="description"]').should('have.attr', 'content').and('not.be.empty');

    // Check viewport meta tag
    cy.get('meta[name="viewport"]').should('exist');

    // Check canonical URL
    cy.get('link[rel="canonical"]').should('exist');
  });

  it('should have structured data (JSON-LD)', () => {
    cy.get('script[type="application/ld+json"]').should('exist').then(($script) => {
      const jsonLd = JSON.parse($script.text());
      expect(jsonLd).to.have.property('@context');
      expect(jsonLd).to.have.property('@type');
    });
  });

  it('should be responsive', () => {
    // Test mobile viewport
    cy.viewport(375, 667);
    cy.get('main').should('be.visible');

    // Test tablet viewport
    cy.viewport(768, 1024);
    cy.get('main').should('be.visible');

    // Test desktop viewport
    cy.viewport(1280, 720);
    cy.get('main').should('be.visible');
  });

  it('should have accessible markup', () => {
    // Should have main landmark
    cy.get('main').should('exist');

    // Should have proper heading hierarchy
    cy.get('h1, h2, h3').should('exist');

    // All images should have alt text
    cy.get('img').each(($img) => {
      cy.wrap($img).should('have.attr', 'alt');
    });

    // Links should have accessible text
    cy.get('a').each(($link) => {
      cy.wrap($link).should('not.be.empty');
    });
  });

  it('should have working footer links', () => {
    cy.get('footer').should('be.visible');

    // Check for RSS feed link
    cy.get('footer a[href="/rss.xml"]').should('exist');
  });

  it('should navigate to word detail page when clicking a word', () => {
    // Click the first word link
    cy.get('a[href^="/word/"]').first().click();

    // Should navigate to word detail page
    cy.url().should('include', '/word/');

    // Should display word content
    cy.get('main').should('be.visible');
  });

  it('should navigate to browse page', () => {
    // Click browse link
    cy.get('a[href="/browse"]').first().click();

    // Should navigate to browse page
    cy.url().should('include', '/browse');

    // Should display browse content
    cy.get('main').should('be.visible');
  });

  it('should navigate to stats page', () => {
    // Click stats link
    cy.get('a[href="/stats"]').first().click();

    // Should navigate to stats page
    cy.url().should('include', '/stats');

    // Should display stats content
    cy.get('main').should('be.visible');
  });
});
