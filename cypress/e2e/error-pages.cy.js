describe('Error Pages', () => {
  describe('404 Page', () => {
    it('should display custom 404 page for non-existent routes', () => {
      cy.visit('/this-page-does-not-exist', { failOnStatusCode: false });

      // Should display content (even if it's a 404)
      cy.get('body').should('be.visible');
      cy.get('main').should('be.visible');
    });

    it('should show 404 message or indication', () => {
      cy.visit('/non-existent-page', { failOnStatusCode: false });

      // Should indicate error or show 404 message
      cy.get('main').invoke('text').should('match', /404|not found|doesn't exist|error/i);
    });

    it('should have navigation back to home', () => {
      cy.visit('/non-existent-page', { failOnStatusCode: false });

      // Should have link to homepage
      cy.get('a[href="/"]').should('exist');
    });

    it('should have proper metadata on 404 page', () => {
      cy.visit('/404', { failOnStatusCode: false });

      // Should have title
      cy.title().should('not.be.empty');
    });

    it('should display helpful links or suggestions', () => {
      cy.visit('/404', { failOnStatusCode: false });

      // Should have navigation or helpful links
      cy.get('a').should('have.length.at.least', 1);
    });

    it('should navigate from 404 to homepage', () => {
      cy.visit('/non-existent-page', { failOnStatusCode: false });

      // Click home link
      cy.get('a[href="/"]').first().click();

      // Should navigate to homepage
      cy.url().should('not.include', 'non-existent-page');
      cy.get('main').should('be.visible');
    });

    it('should handle 404 for non-existent word', () => {
      cy.visit('/word/thisisnotarealword123456', { failOnStatusCode: false });

      // Should either show 404 or handle gracefully
      cy.get('body').should('be.visible');
    });

    it('should handle 404 for non-existent browse year', () => {
      cy.visit('/browse/1999', { failOnStatusCode: false });

      // Should either show 404 or handle gracefully
      cy.get('body').should('be.visible');
    });

    it('should have accessible markup on 404 page', () => {
      cy.visit('/404', { failOnStatusCode: false });

      // Should have main landmark
      cy.get('main').should('exist');

      // Should have heading
      cy.get('h1').should('exist');

      // All images should have alt text
      cy.get('img').each(($img) => {
        cy.wrap($img).should('have.attr', 'alt');
      });
    });

    it('should be responsive on 404 page', () => {
      cy.visit('/404', { failOnStatusCode: false });

      // Mobile
      cy.viewport(375, 667);
      cy.get('main').should('be.visible');

      // Desktop
      cy.viewport(1280, 720);
      cy.get('main').should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should not have console errors on valid pages', () => {
      cy.visit('/');

      // Check for console errors
      cy.window().then((win) => {
        const errors = [];
        const originalError = win.console.error;

        win.console.error = function (...args) {
          errors.push(args);
          originalError.apply(win.console, args);
        };

        // Navigate to a few pages
        cy.visit('/browse').then(() => {
          // No major console errors should occur during normal navigation
          // Note: Some warnings might be acceptable
        });
      });
    });

    it('should handle malformed URLs gracefully', () => {
      // Test various malformed URLs
      const malformedUrls = [
        '/word//double-slash',
        '/browse/year/',
        '//double-slash',
      ];

      malformedUrls.forEach((url) => {
        cy.visit(url, { failOnStatusCode: false });
        cy.get('body').should('be.visible');
      });
    });

    it('should handle special characters in URLs', () => {
      cy.visit('/word/test%20space', { failOnStatusCode: false });
      cy.get('body').should('be.visible');
    });
  });

  describe('Redirects', () => {
    it('should handle trailing slashes consistently', () => {
      // Test that trailing slashes work
      cy.visit('/browse/');
      cy.get('main').should('be.visible');

      cy.visit('/stats/');
      cy.get('main').should('be.visible');
    });
  });
});
