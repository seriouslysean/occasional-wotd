describe('Browse Pages', () => {
  describe('Browse Hub', () => {
    beforeEach(() => {
      cy.visit('/browse');
    });

    it('should load successfully', () => {
      cy.get('body').should('be.visible');
      cy.get('main').should('be.visible');
    });

    it('should display browse options', () => {
      // Should have heading
      cy.get('h1').should('exist');

      // Should have links to different browse methods
      cy.get('main').within(() => {
        // Look for browse by year, letter, length, part of speech links
        cy.get('a').should('have.length.at.least', 3);
      });
    });

    it('should have links to browse by year', () => {
      cy.get('a[href*="/browse/"]').should('exist');
    });

    it('should have proper metadata', () => {
      cy.title().should('include', 'Browse');
      cy.get('meta[name="description"]').should('exist');
    });

    it('should display recent words', () => {
      // Browse page should show recent words
      cy.get('a[href^="/word/"]').should('have.length.at.least', 1);
    });
  });

  describe('Browse by Year', () => {
    beforeEach(() => {
      cy.visit('/browse/2025');
    });

    it('should load successfully', () => {
      cy.get('main').should('be.visible');
    });

    it('should display year in heading', () => {
      cy.get('h1, h2').should('contain.text', '2025');
    });

    it('should display words from that year', () => {
      // Should have word links
      cy.get('a[href^="/word/"]').should('have.length.at.least', 1);
    });

    it('should have navigation to other years', () => {
      // Should have year navigation or links
      cy.get('a[href*="/browse/"]').should('exist');
    });

    it('should have proper metadata', () => {
      cy.title().should('include', '2025');
      cy.get('meta[name="description"]').should('exist');
    });
  });

  describe('Browse by Year Index', () => {
    beforeEach(() => {
      cy.visit('/browse/year');
    });

    it('should load successfully', () => {
      cy.get('main').should('be.visible');
    });

    it('should display available years', () => {
      // Should have links to years
      cy.get('a[href*="/browse/2"]').should('have.length.at.least', 1);
    });

    it('should navigate to a specific year', () => {
      // Click on a year link
      cy.get('a[href*="/browse/2025"]').first().click();

      // Should navigate to year page
      cy.url().should('include', '/browse/2025');
      cy.get('main').should('be.visible');
    });
  });

  describe('Browse by Month', () => {
    beforeEach(() => {
      // Visit January 2025
      cy.visit('/browse/2025/january');
    });

    it('should load successfully', () => {
      cy.get('main').should('be.visible');
    });

    it('should display year and month', () => {
      // Should show year and month in some form
      cy.get('h1, h2').should('exist');
      cy.get('main').should('contain.text', '2025');
    });

    it('should display words from that month', () => {
      // Should have word links
      cy.get('a[href^="/word/"]').should('have.length.at.least', 1);
    });

    it('should have proper metadata', () => {
      cy.title().should('include', '2025');
      cy.get('meta[name="description"]').should('exist');
    });
  });

  describe('Browse by Letter', () => {
    beforeEach(() => {
      cy.visit('/browse/letter');
    });

    it('should load letter index successfully', () => {
      cy.get('main').should('be.visible');
    });

    it('should display alphabet navigation', () => {
      // Should have links for letters A-Z
      cy.get('a[href*="/browse/letter/"]').should('have.length.at.least', 5);
    });

    it('should navigate to a specific letter', () => {
      // Click on letter 'a' link
      cy.get('a[href*="/browse/letter/a"]').first().click();

      // Should navigate to letter page
      cy.url().should('include', '/browse/letter/a');
      cy.get('main').should('be.visible');
    });
  });

  describe('Browse by Specific Letter', () => {
    beforeEach(() => {
      cy.visit('/browse/letter/a');
    });

    it('should load successfully', () => {
      cy.get('main').should('be.visible');
    });

    it('should display letter in heading', () => {
      cy.get('h1, h2').invoke('text').should('match', /A/i);
    });

    it('should display words starting with that letter', () => {
      // Should have word links
      cy.get('a[href^="/word/"]').should('have.length.at.least', 1);

      // Verify words start with the letter
      cy.get('a[href^="/word/"]').first().then(($link) => {
        const href = $link.attr('href');
        const word = href.split('/word/')[1];
        expect(word[0].toLowerCase()).to.equal('a');
      });
    });

    it('should have alphabet navigation', () => {
      // Should have links to other letters
      cy.get('a[href*="/browse/letter/"]').should('exist');
    });

    it('should have proper metadata', () => {
      cy.title().should('match', /A|Letter/i);
      cy.get('meta[name="description"]').should('exist');
    });
  });

  describe('Browse by Length', () => {
    beforeEach(() => {
      cy.visit('/browse/length');
    });

    it('should load length index successfully', () => {
      cy.get('main').should('be.visible');
    });

    it('should display length options', () => {
      // Should have links for different word lengths
      cy.get('a[href*="/browse/length/"]').should('have.length.at.least', 3);
    });

    it('should navigate to a specific length', () => {
      // Click on a length link
      cy.get('a[href*="/browse/length/"]').first().click();

      // Should navigate to length page
      cy.url().should('match', /\/browse\/length\/\d+/);
      cy.get('main').should('be.visible');
    });
  });

  describe('Browse by Specific Length', () => {
    beforeEach(() => {
      // Visit words with length 9 (like "awareness")
      cy.visit('/browse/length/9');
    });

    it('should load successfully', () => {
      cy.get('main').should('be.visible');
    });

    it('should display length in heading', () => {
      cy.get('h1, h2').should('contain.text', '9');
    });

    it('should display words of that length', () => {
      // Should have word links
      cy.get('a[href^="/word/"]').should('have.length.at.least', 1);
    });

    it('should have proper metadata', () => {
      cy.title().should('include', '9');
      cy.get('meta[name="description"]').should('exist');
    });
  });

  describe('Browse by Part of Speech', () => {
    beforeEach(() => {
      cy.visit('/browse/part-of-speech');
    });

    it('should load part of speech index successfully', () => {
      cy.get('main').should('be.visible');
    });

    it('should display part of speech options', () => {
      // Should have links for different parts of speech
      cy.get('a[href*="/browse/part-of-speech/"]').should('have.length.at.least', 3);
    });

    it('should navigate to a specific part of speech', () => {
      // Click on noun link
      cy.get('a[href*="/browse/part-of-speech/noun"]').first().click();

      // Should navigate to part of speech page
      cy.url().should('include', '/browse/part-of-speech/noun');
      cy.get('main').should('be.visible');
    });
  });

  describe('Browse by Specific Part of Speech', () => {
    beforeEach(() => {
      cy.visit('/browse/part-of-speech/noun');
    });

    it('should load successfully', () => {
      cy.get('main').should('be.visible');
    });

    it('should display part of speech in heading', () => {
      cy.get('h1, h2').should('contain.text', 'noun');
    });

    it('should display words of that part of speech', () => {
      // Should have word links
      cy.get('a[href^="/word/"]').should('have.length.at.least', 1);
    });

    it('should have links to other parts of speech', () => {
      // Should have navigation to other parts of speech
      cy.get('a[href*="/browse/part-of-speech/"]').should('exist');
    });

    it('should have proper metadata', () => {
      cy.title().should('include', 'noun');
      cy.get('meta[name="description"]').should('exist');
    });
  });

  describe('Browse Navigation Flow', () => {
    it('should allow browsing from hub to year to month to word', () => {
      // Start at browse hub
      cy.visit('/browse');

      // Navigate to a year
      cy.get('a[href*="/browse/2025"]').first().click();
      cy.url().should('include', '/browse/2025');

      // Navigate to a month (if available)
      cy.get('a[href*="/browse/2025/"]').first().then(($link) => {
        const href = $link.attr('href');
        if (href && href.includes('/browse/2025/')) {
          cy.wrap($link).click();

          // Navigate to a word
          cy.get('a[href^="/word/"]').first().click();
          cy.url().should('include', '/word/');
          cy.get('main').should('be.visible');
        }
      });
    });

    it('should allow browsing by letter flow', () => {
      // Start at letter index
      cy.visit('/browse/letter');

      // Click on a letter
      cy.get('a[href*="/browse/letter/"]').first().click();
      cy.url().should('match', /\/browse\/letter\/[a-z]/i);

      // Click on a word
      cy.get('a[href^="/word/"]').first().click();
      cy.url().should('include', '/word/');
      cy.get('main').should('be.visible');
    });
  });

  describe('Browse Accessibility', () => {
    it('should have accessible markup on browse hub', () => {
      cy.visit('/browse');

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
  });
});
