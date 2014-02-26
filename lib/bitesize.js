/**
 * Contains these objects:
 *   GH
 *   Blog
 *   Post
 */
var Promise = require('es6-promise').Promise;
var YAML = require('yamljs');
// var marked = require('marked');

function GH(params) {
  this.ghrepo = params.ghrepo;
  this.postPath = params.postPath || '';
}

GH.prototype.contents = function () {
  var self = this;
  return new Promise(function (resolve, reject) {
    self.ghrepo.contents(self.postPath, function (err, body) {
      if (err) {
        reject(new Error('Can not retrieve posts: ' + err.message));
      } else {
        var results = [];
        if (body && body.length) {
          body.forEach(function (post) {
            results.push(post);
          });
        }
        resolve(results);
      }
    });
  });

};

GH.prototype.getFile = function (postPath) {
  var self = this;
  return new Promise(function (resolve, reject) {
    self.ghrepo.contents(postPath, function (err, body) {
      if (err) {
        reject(new Error('Can not retrieve post: ' + err.message));
      }

      var content = body.content;
      if (body.encoding === 'base64') {
        content = new Buffer(body.content, 'base64').toString('utf8');
      }

      var fileType = 'unknown';
      if (self.endsWith(body.name, 'markdown') || self.endsWith(body.name, 'md')) {
        fileType = 'markdown';
      }

      resolve({
        name: body.name,
        type: fileType,
        path: body.path,
        content: content,
        sha: body.sha,
        encoding: body.encoding
        // original_body: body
      });
    });
  });
};

GH.prototype.endsWith = function (str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

/**
 * Return a promise for an array of all posts.
 */
GH.prototype.getAllFiles = function () {
  var self = this,
    promises = [];

  return self.contents().then(function (postList) {
    postList.forEach(function (postListItem) {
      promises.push(self.getFile(postListItem.path));
    });
    return Promise.all(promises);
  });
};

/**
 * Represents a single blog entry.
 */
function Post(post) {
  this.post = post;
}

Post.prototype.show = function () {
  console.log(this.post, this.sections());
};

Post.prototype.sections = function () {
  var header = '',
    body = '';
  var sections = this.post.content.split('---');
  switch (sections.length) {
  case 1:
    body = sections[0];
    break;
  case 2:
    header = sections[0];
    body = sections[1];
    break;
  case 3:
    header = sections[1];
    body = sections[2];
    break;
  default:
    header = sections[1];
    body = sections[2];
  }

  return {
    header: header.trim() ? YAML.parse(header.trim()) : '',
    body: body.trim()
  };
};

/**
 * Represents a blog and blog helpers.
 * @param {Array} docs Array of JSON representations of documents.
 */
function Blog(docs) {
  var self = this;
  this.posts = [];
  docs.forEach(function (doc) {
    self.posts.push(new Post(doc));
  });
  console.log('self.posts', self.posts);
}

Blog.prototype.show = function () {
  this.posts.forEach(function (post) {
    post.show();
  });
  console.log('total posts:', this.posts.length);
};

exports.GH = GH;
exports.Post = Post;
exports.Blog = Blog;