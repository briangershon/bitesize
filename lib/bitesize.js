/**
 * Contains these objects:
 *   GH
 *   BlogPosts
 */
var Promise = require('es6-promise').Promise;
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

function BlogPosts(posts) {
  this.posts = posts;
}

BlogPosts.prototype.show = function () {
  this.posts.forEach(function (post) {
    // if (post.type === 'markdown') {
    //   console.log(post.name, marked(post.content));
    // } else {
    console.log(post.name, post.content);
    // }
  });
  console.log('total posts:', this.posts.length);
};

/**
 * Parse the YAML blog post header and convert post to Markdown
 * @return {Object} header and content as object properties
 */
BlogPosts.prototype.createYAMLHeaderAndBody = function () {

};

exports.GH = GH;
exports.BlogPosts = BlogPosts;