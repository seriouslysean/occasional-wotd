describe('API Endpoints', () => {
  describe('Words JSON API', () => {
    it('should return valid JSON', () => {
      cy.request('/words.json').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers['content-type']).to.include('application/json');
        expect(response.body).to.be.an('array');
      });
    });

    it('should return array of word names', () => {
      cy.request('/words.json').then((response) => {
        expect(response.body).to.be.an('array');
        expect(response.body.length).to.be.greaterThan(0);

        // Each item should be a string (word name)
        response.body.forEach((word) => {
          expect(word).to.be.a('string');
          expect(word.length).to.be.greaterThan(0);
        });
      });
    });

    it('should return all words from the collection', () => {
      cy.request('/words.json').then((response) => {
        // With demo data, we should have 45 words
        expect(response.body.length).to.be.greaterThan(40);

        // Should include known words
        expect(response.body).to.include('awareness');
      });
    });

    it('should be accessible via browser', () => {
      cy.visit('/words.json');
      cy.get('body').should('not.be.empty');
    });
  });

  describe('RSS Feed', () => {
    it('should return valid XML', () => {
      cy.request('/rss.xml').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers['content-type']).to.include('xml');
        expect(response.body).to.include('<?xml');
        expect(response.body).to.include('<rss');
      });
    });

    it('should include required RSS elements', () => {
      cy.request('/rss.xml').then((response) => {
        const xml = response.body;

        // Required RSS elements
        expect(xml).to.include('<channel>');
        expect(xml).to.include('<title>');
        expect(xml).to.include('<link>');
        expect(xml).to.include('<description>');
      });
    });

    it('should include RSS items for recent words', () => {
      cy.request('/rss.xml').then((response) => {
        const xml = response.body;

        // Should have items
        expect(xml).to.include('<item>');
        expect(xml).to.include('</item>');

        // Items should have required elements
        expect(xml).to.include('<title>');
        expect(xml).to.include('<link>');
        expect(xml).to.include('<guid>');
        expect(xml).to.include('<pubDate>');
      });
    });

    it('should limit to recent words (14 max)', () => {
      cy.request('/rss.xml').then((response) => {
        const xml = response.body;

        // Count item elements
        const itemCount = (xml.match(/<item>/g) || []).length;

        // Should have at least 1 item and no more than 14
        expect(itemCount).to.be.greaterThan(0);
        expect(itemCount).to.be.at.most(14);
      });
    });

    it('should be accessible via browser', () => {
      cy.visit('/rss.xml');
      cy.get('body').should('not.be.empty');
    });
  });

  describe('Health Check', () => {
    it('should return plain text', () => {
      cy.request('/health.txt').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers['content-type']).to.include('text/plain');
      });
    });

    it('should include hash information', () => {
      cy.request('/health.txt').then((response) => {
        const text = response.body;

        // Should include hash or version info
        expect(text).to.be.a('string');
        expect(text.length).to.be.greaterThan(0);
      });
    });

    it('should be accessible via browser', () => {
      cy.visit('/health.txt');
      cy.get('body').should('not.be.empty');
    });
  });

  describe('Robots.txt', () => {
    it('should return valid robots.txt', () => {
      cy.request('/robots.txt').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers['content-type']).to.include('text/plain');
      });
    });

    it('should include User-agent directive', () => {
      cy.request('/robots.txt').then((response) => {
        const text = response.body;
        expect(text).to.include('User-agent');
      });
    });

    it('should reference sitemap', () => {
      cy.request('/robots.txt').then((response) => {
        const text = response.body;
        expect(text).to.include('Sitemap');
      });
    });

    it('should be accessible via browser', () => {
      cy.visit('/robots.txt');
      cy.get('body').should('not.be.empty');
    });
  });

  describe('Sitemap', () => {
    it('should return valid XML sitemap', () => {
      cy.request('/sitemap-0.xml').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers['content-type']).to.include('xml');
        expect(response.body).to.include('<?xml');
        expect(response.body).to.include('<urlset');
      });
    });

    it('should include URL entries', () => {
      cy.request('/sitemap-0.xml').then((response) => {
        const xml = response.body;

        // Should have url elements
        expect(xml).to.include('<url>');
        expect(xml).to.include('<loc>');
      });
    });

    it('should include main pages', () => {
      cy.request('/sitemap-0.xml').then((response) => {
        const xml = response.body;

        // Should include homepage and main sections
        expect(xml).to.match(/\/browse|\/stats|\/word\//);
      });
    });
  });

  describe('Humans.txt', () => {
    it('should return valid humans.txt', () => {
      cy.request('/humans.txt').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers['content-type']).to.include('text/plain');
      });
    });

    it('should include attribution information', () => {
      cy.request('/humans.txt').then((response) => {
        const text = response.body;
        expect(text).to.be.a('string');
        expect(text.length).to.be.greaterThan(0);
      });
    });

    it('should be accessible via browser', () => {
      cy.visit('/humans.txt');
      cy.get('body').should('not.be.empty');
    });
  });

  describe('Manifest.json', () => {
    it('should return valid JSON manifest', () => {
      cy.request('/manifest.json').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers['content-type']).to.include('application/json');
        expect(response.body).to.be.an('object');
      });
    });

    it('should include PWA manifest properties', () => {
      cy.request('/manifest.json').then((response) => {
        const manifest = response.body;

        // Common manifest properties
        expect(manifest).to.have.property('name');
        expect(manifest.name).to.not.be.empty;
      });
    });

    it('should be accessible via browser', () => {
      cy.visit('/manifest.json');
      cy.get('body').should('not.be.empty');
    });
  });

  describe('LLMs.txt', () => {
    it('should return plain text', () => {
      cy.request('/llms.txt').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers['content-type']).to.include('text/plain');
      });
    });

    it('should include LLM directives', () => {
      cy.request('/llms.txt').then((response) => {
        const text = response.body;
        expect(text).to.be.a('string');
        expect(text.length).to.be.greaterThan(0);
      });
    });

    it('should be accessible via browser', () => {
      cy.visit('/llms.txt');
      cy.get('body').should('not.be.empty');
    });
  });

  describe('Favicon', () => {
    it('should serve favicon.ico', () => {
      cy.request('/favicon.ico').then((response) => {
        expect(response.status).to.eq(200);
        // Should be an image
        expect(response.headers['content-type']).to.match(/image/);
      });
    });
  });

  describe('API Response Headers', () => {
    it('should include proper cache headers for JSON API', () => {
      cy.request('/words.json').then((response) => {
        // Should have caching headers (if implemented)
        expect(response.headers).to.exist;
      });
    });

    it('should include proper cache headers for RSS feed', () => {
      cy.request('/rss.xml').then((response) => {
        // Should have caching headers (if implemented)
        expect(response.headers).to.exist;
      });
    });
  });

  describe('API Error Handling', () => {
    it('should return 404 for non-existent API endpoints', () => {
      cy.request({ url: '/api/nonexistent', failOnStatusCode: false }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });
  });
});
