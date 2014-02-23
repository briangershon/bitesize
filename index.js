/**
 * This sample app displays the name and contents of all files in a GitHub repository,
 * (for a specific path in that repository) and converts .md and .markdown files into HTML.
 */

var github = require('octonode'),
  marked = require('marked'),
  Blog = require('./lib/bitesize.js').Blog;

var envAccessToken = process.env.BITESIZE_GITHUB_ACCESS_TOKEN,
  envGitHubRepo = process.env.BITESIZE_GITHUB_REPO,
  envPostPath = process.env.BITESIZE_POST_PATH;

var client = github.client(envAccessToken);
var ghrepo = client.repo(envGitHubRepo);

var blog = new Blog({
  ghrepo: ghrepo,
  postPath: envPostPath
});

console.log('Retrieving all posts...');
blog.getAllPosts().then(function (posts) {
    posts.forEach(function (post) {
      if (post.type === 'markdown') {
        console.log(post.name, marked(post.content));
      } else {
        console.log(post.name, post.content);
      }
    });
    console.log('total posts:', posts.length);
  });
