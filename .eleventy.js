module.exports = function (eleventyConfig) {

  // Pass static assets through.
  // When `input` is "src", addPassthroughCopy paths are relative to the
  // project root — so we use "src/css" etc. BUT the output strips the
  // "src/" prefix, giving us "_site/css", "_site/js", "_site/images".
  // The fix is to use an object form { "src/css": "css" } to be explicit.
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/images": "images" });

  // Collect all gradient pages into a "gradients" collection,
  // sorted newest first by the `date` frontmatter field
  eleventyConfig.addCollection("gradients", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/gradients/*.md")
      .sort((a, b) => b.date - a.date);
  });

  // Filter: get all unique tags across the gradients collection
  eleventyConfig.addFilter("allTags", function (collection) {
    const set = new Set();
    collection.forEach(item => {
      (item.data.tags || []).forEach(t => set.add(t));
    });
    return [...set].sort();
  });

  // Filter: safe JSON for passing data into data attributes
  eleventyConfig.addFilter("jsonify", val => JSON.stringify(val));

  // Filter: format a Date object or ISO string → "January 10, 2024"
  eleventyConfig.addFilter("dateFormat", function (dateVal) {
    if (!dateVal) return "";
    const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  });

  // Filter: slug from title (fallback)
  eleventyConfig.addFilter("slugify", str =>
    str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  );

  return {
    pathPrefix: "/Gradients/",
    dir: {
      input:    "src",
      output:   "_site",
      includes: "_includes",
      data:     "_data",
    },
    templateFormats: ["njk", "html", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};