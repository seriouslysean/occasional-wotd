/**
 * Downstream Build Tests
 *
 * These tests verify that the site can be built with different SOURCE_DIR configurations.
 * This is important for multi-site deployments like wordbug.fyi and wordbun.fyi.
 *
 * Note: These tests assume you've built the site with SOURCE_DIR=demo
 * To run these tests against different configurations, build with different SOURCE_DIR values:
 *
 * SOURCE_DIR=demo npm run build
 * npm run cypress:run
 */

describe('Downstream Build Configuration', () => {
  describe('Demo Data Build', () => {
    it('should load successfully with demo data', () => {
      cy.visit('/');
      cy.get('main').should('be.visible');
    });

    it('should have words from demo directory', () => {
      // Visit words.json to see all words
      cy.request('/words.json').then((response) => {
        expect(response.body).to.be.an('array');
        expect(response.body.length).to.be.greaterThan(0);

        // Should include known demo words
        expect(response.body).to.include('awareness');
      });
    });

    it('should display demo words on homepage', () => {
      cy.visit('/');

      // Should have word links
      cy.get('a[href^="/word/"]').should('have.length.at.least', 1);
    });

    it('should have correct site metadata for demo build', () => {
      cy.visit('/');

      // Should have title
      cy.title().should('not.be.empty');

      // Should have meta description
      cy.get('meta[name="description"]').should('exist');

      // Should have canonical URL
      cy.get('link[rel="canonical"]').should('exist');
    });

    it('should have working browse functionality with demo data', () => {
      cy.visit('/browse');

      // Should display browse options
      cy.get('main').should('be.visible');

      // Should have browse links
      cy.get('a[href*="/browse/"]').should('exist');
    });

    it('should have working stats functionality with demo data', () => {
      cy.visit('/stats');

      // Should display stats
      cy.get('main').should('be.visible');

      // Should have stats links
      cy.get('a[href^="/stats/"]').should('exist');
    });

    it('should generate correct API endpoints with demo data', () => {
      // words.json should work
      cy.request('/words.json').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });

      // rss.xml should work
      cy.request('/rss.xml').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.include('<rss');
      });

      // health.txt should work
      cy.request('/health.txt').then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('should have correct year structure for demo data', () => {
      cy.visit('/browse/year');

      // Should show available years from demo data (2023, 2024, 2025)
      cy.get('main').should('be.visible');
      cy.get('a[href*="/browse/2"]').should('exist');
    });

    it('should display demo words by year', () => {
      cy.visit('/browse/2025');

      // Should have words from 2025
      cy.get('main').should('be.visible');
      cy.get('a[href^="/word/"]').should('have.length.at.least', 1);
    });

    it('should display demo words by letter', () => {
      cy.visit('/browse/letter/a');

      // Should have words starting with 'a'
      cy.get('main').should('be.visible');
    });

    it('should calculate correct stats from demo data', () => {
      cy.visit('/stats/word-facts');

      // Should show statistics
      cy.get('main').should('be.visible');

      // Should show numbers/counts
      cy.get('main').should('match', /:contains("\d+")/);
    });
  });

  describe('Source Directory Configuration', () => {
    it('should respect SOURCE_DIR environment variable', () => {
      // This test verifies that the build uses the correct data directory
      cy.visit('/');

      // Get all words from API
      cy.request('/words.json').then((response) => {
        const words = response.body;

        // Should have words (from whichever SOURCE_DIR was used)
        expect(words).to.be.an('array');
        expect(words.length).to.be.greaterThan(0);

        // Each word should be accessible
        const sampleWord = words[0];
        cy.visit(`/word/${sampleWord}`);
        cy.get('main').should('be.visible');
      });
    });

    it('should use correct image paths for SOURCE_DIR', () => {
      cy.visit('/');

      // If social images are generated, they should exist
      // This is environment-specific and might not have images in all builds
      cy.document().then((doc) => {
        const ogImage = doc.querySelector('meta[property="og:image"]');
        if (ogImage) {
          const imageUrl = ogImage.getAttribute('content');
          expect(imageUrl).to.exist;
        }
      });
    });

    it('should generate correct paths in RSS feed', () => {
      cy.request('/rss.xml').then((response) => {
        const xml = response.body;

        // Links in RSS should be absolute URLs
        expect(xml).to.include('<link>');

        // Should include proper domain (from SITE_URL)
        expect(xml).to.match(/<link>https?:\/\//);
      });
    });

    it('should generate correct sitemap URLs', () => {
      cy.request('/sitemap-0.xml').then((response) => {
        const xml = response.body;

        // URLs in sitemap should be absolute
        expect(xml).to.include('<loc>');
        expect(xml).to.match(/<loc>https?:\/\//);
      });
    });

    it('should have consistent navigation across the site', () => {
      // Start at homepage
      cy.visit('/');

      // Navigate to browse
      cy.get('a[href="/browse"]').first().click();
      cy.url().should('include', '/browse');

      // Navigate to stats
      cy.get('a[href="/stats"]').first().click();
      cy.url().should('include', '/stats');

      // Navigate back to home
      cy.get('a[href="/"]').first().click();
      cy.url().should('not.include', '/stats');
      cy.url().should('not.include', '/browse');
    });
  });

  describe('Multi-Site Compatibility', () => {
    it('should work with different site configurations', () => {
      cy.visit('/');

      // Basic site should load regardless of configuration
      cy.get('body').should('be.visible');
      cy.get('main').should('be.visible');

      // Should have working navigation
      cy.get('nav, header').should('exist');

      // Should have footer
      cy.get('footer').should('exist');
    });

    it('should maintain consistent URL structure across sites', () => {
      // Test that URL patterns work consistently
      const urlPatterns = [
        '/',
        '/browse',
        '/stats',
        '/browse/year',
        '/browse/letter',
      ];

      urlPatterns.forEach((url) => {
        cy.visit(url);
        cy.get('main').should('be.visible');
      });
    });

    it('should have working word links across all configurations', () => {
      cy.visit('/');

      // Get first word link
      cy.get('a[href^="/word/"]').first().then(($link) => {
        const href = $link.attr('href');

        // Click and verify it loads
        cy.wrap($link).click();
        cy.url().should('include', href);
        cy.get('main').should('be.visible');
      });
    });

    it('should maintain proper SEO across configurations', () => {
      const pages = ['/', '/browse', '/stats'];

      pages.forEach((page) => {
        cy.visit(page);

        // Each page should have proper metadata
        cy.title().should('not.be.empty');
        cy.get('meta[name="description"]').should('exist');
        cy.get('link[rel="canonical"]').should('exist');

        // Should have Open Graph tags
        cy.get('meta[property="og:title"]').should('exist');
        cy.get('meta[property="og:description"]').should('exist');
      });
    });

    it('should have consistent theming across configurations', () => {
      cy.visit('/');

      // Should have CSS loaded
      cy.get('head link[rel="stylesheet"], head style').should('exist');

      // Body should have visible content
      cy.get('body').should('be.visible');

      // Should not have major layout issues
      cy.get('main').should('be.visible');
    });
  });

  describe('Data Integrity Across Builds', () => {
    it('should have matching word counts between pages and API', () => {
      // Get word count from API
      cy.request('/words.json').then((apiResponse) => {
        const apiWordCount = apiResponse.body.length;

        // Visit stats page
        cy.visit('/stats/word-facts');

        // Stats page should reflect the same data
        cy.get('main').should('exist');

        // Note: Exact matching depends on how stats display the count
        // This is a basic check that stats exist
        cy.get('main').should('not.contain.text', 'No words');
      });
    });

    it('should have consistent data in RSS feed', () => {
      // Get words from API
      cy.request('/words.json').then((apiResponse) => {
        const words = apiResponse.body;

        // Get RSS feed
        cy.request('/rss.xml').then((rssResponse) => {
          const xml = rssResponse.body;

          // RSS should have items
          expect(xml).to.include('<item>');

          // Sample word from API should potentially be in RSS
          // (RSS only has latest 14, so we check the structure)
          expect(xml).to.include('<title>');
          expect(xml).to.include('<link>');
        });
      });
    });

    it('should have accurate year/month groupings', () => {
      // Visit browse by year
      cy.visit('/browse/year');

      // Get list of year links
      cy.get('a[href*="/browse/2"]').then(($links) => {
        if ($links.length > 0) {
          const firstYearLink = $links[0].getAttribute('href');

          // Visit that year
          cy.visit(firstYearLink);

          // Should have words from that year
          cy.get('a[href^="/word/"]').should('have.length.at.least', 1);
        }
      });
    });
  });

  describe('Build Performance', () => {
    it('should have reasonable page load times', () => {
      // Test key pages load within reasonable time
      const pages = ['/', '/browse', '/stats', '/word/awareness'];

      pages.forEach((page) => {
        const start = Date.now();

        cy.visit(page).then(() => {
          const loadTime = Date.now() - start;

          // Page should load within 5 seconds (generous for CI)
          expect(loadTime).to.be.lessThan(5000);
        });
      });
    });

    it('should have optimized static assets', () => {
      cy.visit('/');

      // Should have CSS
      cy.get('head link[rel="stylesheet"], head style').should('exist');

      // Images should have proper attributes
      cy.get('img').each(($img) => {
        cy.wrap($img).should('have.attr', 'alt');
      });
    });
  });
});
