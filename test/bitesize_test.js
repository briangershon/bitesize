/*globals describe, it, beforeEach */
var chai = require("chai"),
  chaiAsPromised = require("chai-as-promised"),
  // sinon = require('sinon'),
  // sinonChai = require("sinon-chai"),
  expect = chai.expect,
  yfm = require('yfm');

chai.use(chaiAsPromised);
// chai.use(sinonChai);

var Post = require('../lib/bitesize.js').Post,
  Blog = require('../lib/bitesize.js').Blog;

describe('Post', function () {
  describe('constructor', function () {
    describe('default fields', function () {
      var post;

      beforeEach(function () {
        post = new Post();
      });

      it('should have a filename', function () {
        expect(post.filename).to.equal('');
      });

      it('should have a title', function () {
        expect(post.title).to.equal('No Title');
      });

      it('should not have a date', function () {
        expect(post.date).to.equal(undefined);
      });

      it('should have no categories', function () {
        expect(post.categories).to.deep.equal([]);
      });

      it('should have no tags', function () {
        expect(post.tags).to.deep.equal([]);
      });

      it('should have no body', function () {
        expect(post.body).to.equal('');
      });

    });

    describe('problematic fields', function () {
      it('should error if ymlDoc is a String', function () {
        var yfmDoc = '---';
        expect(function () {new Post('2012-10-24-testing-for-google-closure-library.markdown', yfmDoc); })
          .to.throw('Missing YAML Front-Matter object. Expecting yfm object instead of a string.');
      });
    });

    describe('expected fields', function () {
      var post,
        yfmDoc = yfm('---\n' +
            'title: "Testing JavaScript Code Running Google Closure Library"\n' +
            'date: 2012-10-24 12:24\n' +
            'categories:\n' +
            '- Programming\n' +
            'tags:\n' +
            '- testing\n' +
            '- JavaScript\n' +
            '---\n' +
            'CONTENT\nHERE\n');

      beforeEach(function () {
        post = new Post('2012-10-24-testing-for-google-closure-library.markdown', yfmDoc);
      });

      it('should have a filename', function () {
        expect(post.filename).to.equal('2012-10-24-testing-for-google-closure-library.markdown');
      });

      it('should have a title', function () {
        expect(post.title).to.equal('Testing JavaScript Code Running Google Closure Library');
      });

      it('should have categories', function () {
        expect(post.categories).to.deep.equal(['Programming']);
      });

      it('should have tags', function () {
        expect(post.tags).to.deep.equal(['testing', 'JavaScript']);
      });

      it('should have content', function () {
        expect(post.body).to.equal('CONTENT\nHERE');
      });

      it('should have a Date object', function () {
        expect(post.date).to.deep.equal(new Date('2012-10-24 12:24'));
      });
    });

    describe('route', function () {
      it('should have a default route if invalid filename', function () {
        var post = new Post('');
        expect(post.route).to.equal('/2013/01/01/no-title/');
      });

      it('should have a route based on the correct filename', function () {
        var post = new Post('2013-04-09-one-letter-repository-status-for-git-mercurial-subversion.markdown');
        expect(post.route).to.equal('/2013/04/09/one-letter-repository-status-for-git-mercurial-subversion/');
      });

      it('should have a route based on the filename (even without a file extension)', function () {
        var post = new Post('2013-04-09-one-letter-repository-status-for-git-mercurial-subversion');
        expect(post.route).to.equal('/2013/04/09/one-letter-repository-status-for-git-mercurial-subversion/');
      });

      it('should have a default route (if name is missing a leading date)', function () {
        var post = new Post('one-letter-repository-status-for-git-mercurial-subversion');
        expect(post.route).to.equal('/2013/01/01/no-title/');
      });

    });
  });

  describe('#rewriteImageURLs', function () {
    it('should not change content if neither parameter is passed in', function () {
      var newContent = Post.searchAndReplace('content', undefined, undefined);
      expect(newContent).to.equal('content');
    });

    it('should not change content if imagePrefix keys do not exist', function () {
      var newContent = Post.searchAndReplace('content', undefined, 'new');
      expect(newContent).to.equal('content');
    });

    it('should not change content if imageNewPrefix keys do not exist', function () {
      var newContent = Post.searchAndReplace('content', 'old', undefined);
      expect(newContent).to.equal('content');
    });

    it('should search and replace all occurences', function () {
      var newContent = Post.searchAndReplace('content content', 'content', 'newcontent');
      expect(newContent).to.equal('newcontent newcontent');
    });
  });
});

describe('Blog', function () {
  it('should skip posts that do not have a date', function () {
    var blog = new Blog([{name: '', content: yfm('---\ntitle: one\ndate: 2014-03-01 10:00\n---')}, {name: '', content: yfm('---\ntitle: two\n---')}]);
    expect(blog.posts.length).to.equal(1);
  });
});
