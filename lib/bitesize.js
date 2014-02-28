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
      }

      //decode body.content if needed
      if (body.encoding === 'base64') {
        body.content = new Buffer(body.content, 'base64').toString('utf8');
      }

      resolve(body);
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
function Post(doc) {
  this.title = 'No Title';
  this.date = '2013-01-01 12:00';
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
        this.date = header.date;
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
  }
}

Post.prototype.sections = function (content) {
  var header = '',
    body = '';

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

  return {
    header: header.trim() ? YAML.parse(header.trim()) : '',
    body: body.trim()
  };
};

/**
 * Represents a series of blog posts.
 * @param {Array} docs List of objects
 */
function Blog(docs) {
  var self = this;
  this.posts = [];
  docs.forEach(function (doc) {
    self.posts.push(new Post(doc));
  });
}

exports.GH = GH;
exports.Post = Post;
exports.Blog = Blog;