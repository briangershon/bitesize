/*globals describe, it */
var chai = require("chai"),
  chaiAsPromised = require("chai-as-promised"),
  // sinon = require('sinon'),
  // sinonChai = require("sinon-chai"),
  expect = chai.expect;

chai.use(chaiAsPromised);
// chai.use(sinonChai);

var Blog = require('../lib/bitesize.js').Blog;

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

describe('Blog', function () {
  describe('defaults', function () {
    it('should have a postPath', function () {
      var blog = new Blog({ghrepo: mockContents(null, [])});
      expect(blog.postPath).to.equal('');
    });
  });

  describe('#listPosts', function () {
    it('should return an empty list if no results', function (done) {
      var blog = new Blog({ghrepo: mockContents(null, null)});
      expect(blog.listPosts()).to.eventually.become([]).and.notify(done);
    });

    it('should list all file names', function (done) {
      var blog = new Blog({ghrepo: mockContents(null, [{name: 'file.markdown'}])});
      expect(blog.listPosts()).to.eventually.become([{name: 'file.markdown'}]).and.notify(done);
    });

    it('should return a rejected promise if an error occurs', function (done) {
      var blog = new Blog({ghrepo: mockContents({message: 'some error'}, null)});
      expect(blog.listPosts()).to.eventually.be.rejectedWith('Can not retrieve posts: some error').and.notify(done);
    });
  });

  describe('#getPost', function () {

  });

  describe('#getAllPosts', function () {

  });

});
