var Promise = require('es6-promise').Promise;

/**
 * [Blog description]
 * @param {[type]} params [description]
 * accessToken not required, but gives you more api requests.
 */
function Blog(params) {
  this.ghrepo = params.ghrepo;
  this.postPath = params.postPath || '';
}

/**
 * Return a promise for a list of posts.
 */
Blog.prototype.listPosts = function () {
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

Blog.prototype.endsWith = function (str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

/**
 * Return a promise for a single post.
 */
Blog.prototype.getPost = function (postPath) {
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

/**
 * Return a promise for an array of all posts.
 */
Blog.prototype.getAllPosts = function () {
  var self = this,
    promises = [];

  return self.listPosts().then(function (postList) {
    postList.forEach(function (postListItem) {
      promises.push(self.getPost(postListItem.path));
    });
    return Promise.all(promises);
  });
};

exports.Blog = Blog;