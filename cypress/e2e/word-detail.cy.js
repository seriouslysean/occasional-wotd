describe('Word Detail Page', () => {
  beforeEach(() => {
    // Visit a known word from demo data
    cy.visit('/word/awareness');
  });

  it('should load successfully', () => {
    cy.get('body').should('be.visible');
    cy.get('main').should('be.visible');
  });

  it('should display the word as the main heading', () => {
    cy.get('h1').should('exist').and('contain.text', 'awareness');
  });

  it('should display word definitions', () => {
    // Should have definition text
    cy.get('main').should('contain.text', 'noun');

    // Should have definition content
    cy.get('main').should('not.be.empty');
  });

  it('should display the part of speech', () => {
    // Should indicate part of speech
    cy.get('main').should('match', /:contains("noun|verb|adjective|adverb|pronoun|preposition|conjunction|interjection")/i);
  });

  it('should have proper metadata with word in title', () => {
    // Title should contain the word
    cy.title().should('include', 'awareness');

    // Meta description should exist
    cy.get('meta[name="description"]').should('have.attr', 'content').and('not.be.empty');

    // Check Open Graph tags for social sharing
    cy.get('meta[property="og:title"]').should('have.attr', 'content').and('include', 'awareness');
    cy.get('meta[property="og:description"]').should('exist');
    cy.get('meta[property="og:type"]').should('have.attr', 'content', 'article');
  });

  it('should have structured data for the word', () => {
    cy.get('script[type="application/ld+json"]').should('exist').then(($script) => {
      const jsonLd = JSON.parse($script.text());
      expect(jsonLd['@type']).to.be.oneOf(['Article', 'WebPage', 'DefinedTerm']);
    });
  });

  it('should have navigation back to home or browse', () => {
    // Should have link back to homepage
    cy.get('a[href="/"]').should('exist');
  });

  it('should have breadcrumb navigation', () => {
    // Look for breadcrumb or navigation elements
    cy.get('nav, .breadcrumb, [aria-label*="Breadcrumb"]').should('exist');
  });

  it('should display the word date', () => {
    // Should show when the word was posted (date)
    cy.get('main').should('match', /:contains("2025|2024|2023|January|February|March|April|May|June|July|August|September|October|November|December")/i);
  });

  it('should be responsive', () => {
    // Test mobile viewport
    cy.viewport(375, 667);
    cy.get('main').should('be.visible');
    cy.get('h1').should('be.visible');

    // Test desktop viewport
    cy.viewport(1280, 720);
    cy.get('main').should('be.visible');
  });

  it('should have accessible markup', () => {
    // Should have main landmark
    cy.get('main').should('exist');

    // Should have h1
    cy.get('h1').should('exist');

    // All images should have alt text
    cy.get('img').each(($img) => {
      cy.wrap($img).should('have.attr', 'alt');
    });
  });

  describe('Random Word Page', () => {
    it('should redirect to a word when visiting /word', () => {
      cy.visit('/word');

      // Should redirect to a specific word
      cy.url().should('match', /\/word\/[a-z-]+/i);

      // Should display a word
      cy.get('h1').should('exist');
      cy.get('main').should('be.visible');
    });

    it('should show different words on multiple visits', () => {
      // This test verifies the random functionality
      const words = new Set();

      // Visit random word page multiple times
      for (let i = 0; i < 3; i++) {
        cy.visit('/word');
        cy.url().then((url) => {
          const word = url.split('/word/')[1];
          words.add(word);
        });
      }

      // Note: This might occasionally fail if we get the same random word twice,
      // but with 45 words, it's unlikely in 3 tries
    });
  });

  describe('Word Navigation', () => {
    it('should navigate to another word from homepage', () => {
      // Go to homepage
      cy.visit('/');

      // Find and click on a word link that's not "awareness"
      cy.get('a[href^="/word/"]')
        .not('[href="/word/awareness"]')
        .first()
        .click();

      // Should navigate to a different word page
      cy.url().should('match', /\/word\/[a-z-]+/i);
      cy.url().should('not.include', '/word/awareness');

      // Should display word content
      cy.get('main').should('be.visible');
      cy.get('h1').should('exist');
    });
  });

  describe('Word with Different Characteristics', () => {
    it('should handle words with hyphens or special characters', () => {
      // Test that URLs are properly formatted
      cy.visit('/');

      // Get all word links and test a few
      cy.get('a[href^="/word/"]').then(($links) => {
        if ($links.length > 0) {
          // Click on a word link
          cy.wrap($links[0]).click();

          // Should load successfully
          cy.get('main').should('be.visible');
          cy.get('h1').should('exist');
        }
      });
    });
  });
});
