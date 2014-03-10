/**
 * Contains these objects:
 *   Blog
 *   Post
 */

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

exports.Post = Post;
exports.Blog = Blog;