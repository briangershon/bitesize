/**
 * This sample app displays the name and contents of all files in a GitHub repository,
 * (for a specific path in that repository) and converts .md and .markdown files into HTML.
 */

var github = require('octonode'),
  GH = require('./lib/bitesize.js').GH,
  BlogPosts = require('./lib/bitesize.js').BlogPosts;

var envAccessToken = process.env.BITESIZE_GITHUB_ACCESS_TOKEN,
  envGitHubRepo = process.env.BITESIZE_BLOG_GITHUB_REPO,
  envPostPath = process.env.BITESIZE_BLOG_GITHUB_POST_PATH;

var client = github.client(envAccessToken);
var ghrepo = client.repo(envGitHubRepo);

var gh = new GH({
  ghrepo: ghrepo,
  postPath: envPostPath
});

console.log('Retrieving all posts...');
var posts;
gh.getAllFiles().then(function (posts) {
  posts = new BlogPosts(posts);
  posts.show();
});
