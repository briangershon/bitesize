/**
 * This sample app loads up a git repo full of files, processes them
 * as blog posts, and displays the title from the YAML header in the
 * markdown files.
 */

var github = require('octonode'),
  GH = require('./lib/bitesize.js').GH,
  Blog = require('./lib/bitesize.js').Blog,
  yfm = require('yfm');

var envAccessToken = process.env.BITESIZE_GITHUB_ACCESS_TOKEN,
  envGitHubRepo = process.env.BITESIZE_BLOG_GITHUB_REPO,
  envPostPath = process.env.BITESIZE_BLOG_GITHUB_POST_PATH;

var client = github.client(envAccessToken);
var ghrepo = client.repo(envGitHubRepo);

var gh = new GH({
  ghrepo: ghrepo,
  postPath: envPostPath
});

console.log('Retrieving files, then displaying titles:');

gh.getAllFiles().then(function (files) {
  var incomingPosts = files.map(function (post) {
    return {name: post.name, content: yfm(post.content)};
  });

  var blog = new Blog(incomingPosts);
  blog.posts.forEach(function (post) {
    console.log(post.title);
  });
});
