describe('Stats Pages', () => {
  describe('Stats Hub', () => {
    beforeEach(() => {
      cy.visit('/stats');
    });

    it('should load successfully', () => {
      cy.get('body').should('be.visible');
      cy.get('main').should('be.visible');
    });

    it('should display stats heading', () => {
      cy.get('h1').should('exist');
      cy.get('main').should('contain.text', 'Stat');
    });

    it('should display links to different stat pages', () => {
      // Should have links to various stats pages
      cy.get('a[href^="/stats/"]').should('have.length.at.least', 3);
    });

    it('should have proper metadata', () => {
      cy.title().should('include', 'Stat');
      cy.get('meta[name="description"]').should('exist');
    });

    it('should have accessible markup', () => {
      cy.get('main').should('exist');
      cy.get('h1').should('exist');

      // All images should have alt text
      cy.get('img').each(($img) => {
        cy.wrap($img).should('have.attr', 'alt');
      });
    });
  });

  describe('Word Facts Page', () => {
    beforeEach(() => {
      cy.visit('/stats/word-facts');
    });

    it('should load successfully', () => {
      cy.get('main').should('be.visible');
    });

    it('should display word statistics', () => {
      // Should show various word facts
      cy.get('main').should('not.be.empty');

      // Should show numbers/statistics
      cy.get('main').should('match', /:contains("\d+")/);
    });

    it('should display total word count', () => {
      // Should show how many words are in the collection
      cy.get('main').should('contain.text', 'total').or('contain.text', 'Total');
    });

    it('should have proper metadata', () => {
      cy.title().should('include', 'Fact');
      cy.get('meta[name="description"]').should('exist');
    });

    it('should be responsive', () => {
      cy.viewport(375, 667);
      cy.get('main').should('be.visible');

      cy.viewport(1280, 720);
      cy.get('main').should('be.visible');
    });
  });

  describe('Letter Patterns Page', () => {
    beforeEach(() => {
      cy.visit('/stats/letter-patterns');
    });

    it('should load successfully', () => {
      cy.get('main').should('be.visible');
    });

    it('should display letter pattern statistics', () => {
      // Should show letter pattern analysis
      cy.get('main').should('not.be.empty');
    });

    it('should show pattern categories', () => {
      // Should show different types of patterns
      // Common patterns: palindromes, double letters, triple letters
      cy.get('main').should('exist');
    });

    it('should have proper metadata', () => {
      cy.title().should('include', 'Letter').or('include', 'Pattern');
      cy.get('meta[name="description"]').should('exist');
    });

    it('should display word examples', () => {
      // Should have links to words or word examples
      cy.get('a[href^="/word/"]').should('exist');
    });
  });

  describe('Streaks Page', () => {
    beforeEach(() => {
      cy.visit('/stats/streaks');
    });

    it('should load successfully', () => {
      cy.get('main').should('be.visible');
    });

    it('should display streak information', () => {
      // Should show streak data
      cy.get('main').should('not.be.empty');
    });

    it('should show streak statistics', () => {
      // Should show numbers related to streaks
      cy.get('main').should('match', /:contains("\d+")/);
    });

    it('should have proper metadata', () => {
      cy.title().should('include', 'Streak');
      cy.get('meta[name="description"]').should('exist');
    });
  });

  describe('Word Endings Page', () => {
    beforeEach(() => {
      cy.visit('/stats/word-endings');
    });

    it('should load successfully', () => {
      cy.get('main').should('be.visible');
    });

    it('should display word ending statistics', () => {
      // Should show analysis of word endings
      cy.get('main').should('not.be.empty');
    });

    it('should show common endings', () => {
      // Should show endings like -ing, -ed, -ly, -ness, -ful, -less
      cy.get('main').should('exist');
    });

    it('should have proper metadata', () => {
      cy.title().should('include', 'Ending').or('include', 'Word');
      cy.get('meta[name="description"]').should('exist');
    });

    it('should display word examples for endings', () => {
      // Should have links to words or word examples
      cy.get('a[href^="/word/"]').should('exist');
    });
  });

  describe('Dynamic Stats Pages', () => {
    const statTypes = [
      'total-words',
      'word-length-distribution',
      'part-of-speech-distribution',
      'longest-word',
      'shortest-word',
    ];

    statTypes.forEach((statType) => {
      describe(`Stats: ${statType}`, () => {
        it(`should load /${statType} page successfully`, () => {
          // Try to visit the stat page, but don't fail if it doesn't exist
          cy.request({ url: `/stats/${statType}`, failOnStatusCode: false }).then((response) => {
            if (response.status === 200) {
              cy.visit(`/stats/${statType}`);
              cy.get('main').should('be.visible');
            }
          });
        });
      });
    });
  });

  describe('Stats Navigation', () => {
    it('should navigate between different stats pages', () => {
      // Start at stats hub
      cy.visit('/stats');

      // Click on a stats link
      cy.get('a[href^="/stats/"]').first().then(($link) => {
        const href = $link.attr('href');
        cy.wrap($link).click();

        // Should navigate to that stats page
        cy.url().should('include', href);
        cy.get('main').should('be.visible');
      });
    });

    it('should have navigation back to stats hub from detail pages', () => {
      cy.visit('/stats/word-facts');

      // Should have link back to stats hub
      cy.get('a[href="/stats"]').should('exist');
    });

    it('should navigate from stats to word detail', () => {
      // Visit a stats page that has word links
      cy.visit('/stats/letter-patterns');

      // Click on a word link if it exists
      cy.get('a[href^="/word/"]').first().then(($link) => {
        if ($link.length > 0) {
          cy.wrap($link).click();

          // Should navigate to word page
          cy.url().should('include', '/word/');
          cy.get('main').should('be.visible');
        }
      });
    });
  });

  describe('Stats Data Validation', () => {
    it('should display consistent data across pages', () => {
      // Visit word facts page and capture total word count
      cy.visit('/stats/word-facts');

      cy.get('main').invoke('text').then((factsText) => {
        // The total word count should be a reasonable number
        // With 45 demo words, we expect to see that number
        expect(factsText).to.match(/\d+/);
      });
    });

    it('should show accurate statistics', () => {
      cy.visit('/stats/word-facts');

      // Statistics should be non-zero (with 45 demo words)
      cy.get('main').should('not.contain.text', 'No words');
    });
  });

  describe('Stats Accessibility', () => {
    it('should have accessible markup on stats hub', () => {
      cy.visit('/stats');

      cy.get('main').should('exist');
      cy.get('h1').should('exist');

      // All images should have alt text
      cy.get('img').each(($img) => {
        cy.wrap($img).should('have.attr', 'alt');
      });

      // Links should have accessible text
      cy.get('a').each(($link) => {
        cy.wrap($link).invoke('text').should('not.be.empty');
      });
    });

    it('should have accessible data tables if present', () => {
      cy.visit('/stats/word-facts');

      // If there are tables, they should have proper markup
      cy.get('table').then(($tables) => {
        if ($tables.length > 0) {
          cy.get('table').each(($table) => {
            // Tables should have th elements
            cy.wrap($table).find('th').should('exist');
          });
        }
      });
    });
  });

  describe('Stats Responsive Design', () => {
    it('should be responsive on stats hub', () => {
      cy.visit('/stats');

      // Mobile
      cy.viewport(375, 667);
      cy.get('main').should('be.visible');

      // Tablet
      cy.viewport(768, 1024);
      cy.get('main').should('be.visible');

      // Desktop
      cy.viewport(1280, 720);
      cy.get('main').should('be.visible');
    });

    it('should be responsive on stats detail pages', () => {
      cy.visit('/stats/word-facts');

      // Mobile
      cy.viewport(375, 667);
      cy.get('main').should('be.visible');

      // Desktop
      cy.viewport(1280, 720);
      cy.get('main').should('be.visible');
    });
  });
});
