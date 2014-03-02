/*globals describe, it */
var chai = require("chai"),
  chaiAsPromised = require("chai-as-promised"),
  // sinon = require('sinon'),
  // sinonChai = require("sinon-chai"),
  expect = chai.expect;

chai.use(chaiAsPromised);
// chai.use(sinonChai);

var GH = require('../lib/bitesize.js').GH,
  Post = require('../lib/bitesize.js').Post;

/**
 * Pass in an err parameter to mock up an error.
 * Pass in a body parameter to mock up data coming back.
 * @param  {[type]} err  [description]
 * @param  {[type]} body [description]
 * @return {[type]}      [description]
 */
function mockContents(err, body) {
  return {
    contents: function (path, cb) {
      cb(err, body);
    }
  };
}

describe('GH', function () {
  describe('defaults', function () {
    it('should have a postPath', function () {
      var gh = new GH({ghrepo: mockContents(null, [])});
      expect(gh.postPath).to.equal('');
    });
  });

  describe('#listPosts', function () {
    it('should return an empty list if no results', function (done) {
      var gh = new GH({ghrepo: mockContents(null, null)});
      expect(gh.contents()).to.eventually.become([]).and.notify(done);
    });

    it('should list all file names', function (done) {
      var gh = new GH({ghrepo: mockContents(null, [{name: 'file.markdown'}])});
      expect(gh.contents()).to.eventually.become([{name: 'file.markdown'}]).and.notify(done);
    });

    it('should return a rejected promise if an error occurs', function (done) {
      var gh = new GH({ghrepo: mockContents({message: 'some error'}, null)});
      expect(gh.contents()).to.eventually.be.rejectedWith('Can not retrieve posts: some error').and.notify(done);
    });
  });

  describe('#getFile', function () {
    it('should not change body.content if body.encoding !== "base64"', function (done) {
      var gh = new GH({ghrepo: mockContents(null, {content: 'abc'})});
      expect(gh.getFile()).to.eventually.become({content: 'abc'}).and.notify(done);
    });

    it('should decode body.content if body.encoding === "base64"', function (done) {
      var gh = new GH({ghrepo: mockContents(null, {encoding: 'base64', content: 'dGVzdAo='})});
      expect(gh.getFile()).to.eventually.become({encoding: 'base64', content: 'test\n'}).and.notify(done);
    });

    it('should not error even if body is null', function (done) {
      var gh = new GH({ghrepo: mockContents(null, null)});
      expect(gh.getFile()).to.eventually.become(null).and.notify(done);
    });
  });
});

describe('Post', function () {
  describe('constructor', function () {
    it('should default to sane values if no data', function () {
      var post = new Post();
      expect(post.name).to.equal('2013-01-01-no-title.markdown');
      expect(post.title).to.equal('No Title');
      expect(post.date).to.equal('2013-01-01 12:00');
      expect(post.categories).to.deep.equal([]);
      expect(post.tags).to.deep.equal([]);
      expect(post.body).to.equal('');
    });

    it('should have all the normal fields', function () {
      var post = new Post({
        name: '2012-10-24-testing-for-google-closure-library.markdown',
        content: '---\n' +
          'title: "Testing JavaScript Code Running Google Closure Library"\n' +
          'date: 2012-10-24 12:24\n' +
          'categories:\n' +
          '- Programming\n' +
          'tags:\n' +
          '- testing\n' +
          '- JavaScript\n' +
          '---\n' +
          'CONTENT\nHERE\n'
      });
      expect(post.name).to.equal('2012-10-24-testing-for-google-closure-library.markdown');
      expect(post.title).to.equal('Testing JavaScript Code Running Google Closure Library');
      expect(post.date).to.equal('2012-10-24 12:24');
      expect(post.categories).to.deep.equal(['Programming']);
      expect(post.tags).to.deep.equal(['testing', 'JavaScript']);
      expect(post.body).to.equal('CONTENT\nHERE');
    });

    describe('route', function () {
      it('should have a default route if invalid filename', function () {
        var post = new Post({name: ''});
        expect(post.route).to.equal('/2013/01/01/no-title');
      });

      it('should have a route based on the correct filename', function () {
        var post = new Post({name: '2013-04-09-one-letter-repository-status-for-git-mercurial-subversion.markdown'});
        expect(post.route).to.equal('/2013/04/09/one-letter-repository-status-for-git-mercurial-subversion');
      });

      it('should have a route based on the filename (even without a file extension)', function () {
        var post = new Post({name: '2013-04-09-one-letter-repository-status-for-git-mercurial-subversion'});
        expect(post.route).to.equal('/2013/04/09/one-letter-repository-status-for-git-mercurial-subversion');
      });

      it('should have a default route (without a leading date)', function () {
        var post = new Post({
          name: 'one-letter-repository-status-for-git-mercurial-subversion'
        });
        expect(post.route).to.equal('/2013/01/01/no-title');
      });

    });
  });

  describe('#sections', function () {
    it('should have a header and body if post is an empty string', function () {
      var post = new Post();
      expect(post.sections('')).to.deep.equal({header: '', body: ''});
    });

    it('should have a header and body and trim whitespace (without leading "---")', function () {
      var post = new Post();
      expect(post.sections('title: A Blog Post\n---\n\nBlog content start here...')).to.deep.equal({header: {title: 'A Blog Post'}, body: 'Blog content start here...'});
    });

    it('should have a header and body and trim whitespace', function () {
      var post = new Post();
      expect(post.sections('---\ntitle: A Blog Post\n---\n\nBlog content start here...')).to.deep.equal({header: {title: 'A Blog Post'}, body: 'Blog content start here...'});
    });

    it('should have a header and body and trim whitespace (if too many "---")', function () {
      var post = new Post();
      expect(post.sections('---\ntitle: A Blog Post\n---\n\nBlog content start here...--- and should continue.')).to.deep.equal({header: {title: 'A Blog Post'}, body: 'Blog content start here...'});
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
