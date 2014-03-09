/**
 * Contains these objects:
 *   GH
 *   Blog
 *   Post
 */
var Promise = require('es6-promise').Promise;

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
      } else {
        if (body && body.encoding === 'base64') {
          body.content = new Buffer(body.content, 'base64').toString('utf8');
        }
        resolve(body);
      }
    });
  });
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
 * Represents a single blog post in markdown format with YAML Front-Matter.
 * @param {String} filename   Name of file
 * @param {Object} yfmDoc     YAML Front-Matter formatted document.
 * @param {Object} options    [description]
 */
function Post(filename, yfmDoc, options) {
  this.options = options;

  this.filename = '';
  this.title = 'No Title';
  this.categories = [];
  this.tags = [];
  this.body = '';
  this.route = this.createRoute(filename) || '/2013/01/01/no-title/';

  if (filename) {
    this.filename = filename;
  }

  if (yfmDoc) {
    if ('string' === typeof yfmDoc) {
      throw new Error('Missing YAML Front-Matter object. Expecting yfm object instead of a string.');
    }

    var header = yfmDoc.context,
      body = yfmDoc.content;

    if (header.title) {
      this.title = header.title;
    }

    if (header) {
      if (header.date) {
        this.date = new Date(header.date);
      }

      if (header.categories && header.categories.length) {
        this.categories = header.categories;
      }

      if (header.tags && header.tags.length) {
        this.tags = header.tags;
      }
    }

    if (body) {
      this.body = body.trim();
    }
  }
}

/**
 * STATIC METHOD
 * Replace content with other content if search and replace text exists.
 * e.g. Useful for replacing relative URL prefixes with absolute ones to a server.
 * @param  {String} content        The original content.
 * @param  {String} imagePrefix    text to replace
 * @param  {String} imageNewPrefix new text
 * @return {String}                updated content
 */
Post.searchAndReplace = function (content, searchText, replaceText) {
  if (searchText && replaceText) {
    var re = new RegExp(searchText, 'g');
    return content.replace(re, replaceText);
  }
  return content;
};

Post.prototype.createRoute = function (filename) {
  var route;

  if (filename && typeof filename === 'string') {
    var filename_without_extension = filename.split('.')[0];
    var re = /(\d{4})-(\d{2})-(\d{2})-(.*)/;
    if (re.test(filename_without_extension)) {
      var parts = filename_without_extension.match(re);
      route = '/' + parts[1] + '/' + parts[2] + '/' + parts[3] + '/' + parts[4] + '/';
    }
  }
  return route;
};

/**
 * Represents a series of blog posts.
 * @param {Array} docs List of objects
 */
function Blog(docs, options) {
  var self = this;
  this.posts = [];
  docs.forEach(function (doc) {
    var newPost = new Post(doc.name, doc.content, options);
    if (newPost.date) {
      self.posts.push(newPost);
    }
  });
}

exports.GH = GH;
exports.Post = Post;
exports.Blog = Blog;