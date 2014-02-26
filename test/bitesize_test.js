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
});

describe('Post', function () {
  describe('#sections', function () {
    it('should have a header and body if post is an empty string', function () {
      var post = new Post({content: ''});
      expect(post.sections()).to.deep.equal({header: '', body: ''});
    });

    it('should have a header and body and trim whitespace (without leading "---")', function () {
      var post = new Post({content: 'title: A Blog Post\n---\n\nBlog content start here...'});
      expect(post.sections()).to.deep.equal({header: {title: 'A Blog Post'}, body: 'Blog content start here...'});
    });

    it('should have a header and body and trim whitespace', function () {
      var post = new Post({content: '---\ntitle: A Blog Post\n---\n\nBlog content start here...'});
      expect(post.sections()).to.deep.equal({header: {title: 'A Blog Post'}, body: 'Blog content start here...'});
    });

    it('should have a header and body and trim whitespace (if too many "---")', function () {
      var post = new Post({content: '---\ntitle: A Blog Post\n---\n\nBlog content start here...--- and should continue.'});
      expect(post.sections()).to.deep.equal({header: {title: 'A Blog Post'}, body: 'Blog content start here...'});
    });

  });
});
