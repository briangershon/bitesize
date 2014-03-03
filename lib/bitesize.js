/**
 * Contains these objects:
 *   GH
 *   Blog
 *   Post
 */
var Promise = require('es6-promise').Promise;
var YAML = require('yamljs');

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
 * Represents a single blog post in markdown format with YAML header.
 */
function Post(doc, options) {
  this.options = options;

  this.name = '';
  this.route = '';
  this.title = 'No Title';
  this.categories = [];
  this.tags = [];
  this.body = '';

  if (doc) {
    var sections = this.sections(doc.content),
      header = sections.header,
      body = sections.body;

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
      this.body = body;
    }

    if (doc.name) {
      this.name = doc.name;
    }

    this.route = this.createRoute(doc.name);
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
  var route = '/2013/01/01/no-title/';

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

Post.prototype.sections = function (content) {
  var header = '',
    body = '';

  if (content) {
    var sections = content.split('---');
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
  }

  if (this.options) {
    // rewrite image URLs if image_prefix and image_new_prefix have values
    body = Post.searchAndReplace(body, this.options.image_prefix, this.options.image_new_prefix);
  }

  return {
    header: header.trim() ? YAML.parse(header.trim()) : '',
    body: body.trim()
  };
};

/**
 * Represents a series of blog posts.
 * @param {Array} docs List of objects
 */
function Blog(docs, options) {
  var self = this;
  this.posts = [];
  docs.forEach(function (doc) {
    var newPost = new Post(doc, options);
    if (newPost.date) {
      self.posts.push(newPost);
    }
  });
}

exports.GH = GH;
exports.Post = Post;
exports.Blog = Blog;