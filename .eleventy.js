module.exports = function(eleventyConfig) {

  // ── Passthrough Copy ─────────────────────────────────────
  // These folders are copied straight to _site without processing
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("favicon.svg");

  // ── Collections ──────────────────────────────────────────

  // Articles — all .md files in _articles/, sorted newest first
  eleventyConfig.addCollection("articles", function(api) {
    return api.getFilteredByGlob("_articles/*.md").reverse();
  });

  // Team members — all .md files in _team/
  eleventyConfig.addCollection("team", function(api) {
    return api.getFilteredByGlob("_team/*.md");
  });

  // ── Custom Filters ───────────────────────────────────────

  // "Family Law" → "family-law"  (used on data-cat attributes for filter buttons)
  eleventyConfig.addFilter("catSlug", str =>
    str ? str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : ''
  );

  // 2026-04-10 → "10 April 2026"  (human-readable date for article cards)
  eleventyConfig.addFilter("postDate", dateObj => {
    const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
    return d.toLocaleDateString('en-KE', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  });

  // 2026-04-10 → "2026-04-10"  (machine-readable date for <time datetime="">)
  eleventyConfig.addFilter("htmlDateString", dateObj => {
    const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
    return d.toISOString().split('T')[0];
  });

  // articles | map("data.category") → ["Family Law", "Commercial", ...]
  // Plucks a dot-notation key from every item in an array
  eleventyConfig.addFilter("map", (arr, key) =>
    (arr || []).map(item =>
      key.split('.').reduce((obj, k) => obj && obj[k], item)
    )
  );

  // ["Family Law", "Commercial", "Family Law"] → ["Family Law", "Commercial"]
  // Removes duplicate values from an array
  eleventyConfig.addFilter("unique", arr => [...new Set(arr || [])]);

  // ── Eleventy Config ──────────────────────────────────────
  return {
    dir: {
      input: ".",           // Look for templates in the root
      includes: "_includes", // Layouts and partials live here
      data: "_data",         // Global data files live here
      output: "_site"        // Built site goes here
    },
    templateFormats: ["njk", "html", "md"],
    htmlTemplateEngine: "njk",   // Process .html files with Nunjucks
    markdownTemplateEngine: "njk" // Process .md files with Nunjucks first, then Markdown
  };
};