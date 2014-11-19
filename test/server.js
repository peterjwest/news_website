var assert = require('assert');
var nock = require('nock');
var supertest = require('supertest');
var fs = require('fs');

// Utility method to strip whitespace from test HTML
var stripIndentation = function(html) {
  return html.replace(/\n\s+/g, '\n').replace(/^\s+|\s+$/g, '');
};


describe('News app server', function () {
  it('should produce HTML with items from the correct feeds', function (done) {

    nock('http://tapir.com')
      .get('/rss')
      .delay(100)
      .replyWithFile(200, __dirname + '/fixtures/rss.xml');

    nock('http://badger.com')
      .get('/xml')
      .replyWithFile(200, __dirname + '/fixtures/rss2.xml');

    process.env.FEEDS = 'http://tapir.com/rss,http://badger.com/xml';

    fs.readFile(__dirname + '/fixtures/output.html', 'utf8', function (err, expected) {
      supertest(require('../app.js'))
        .get('/')
        .expect(function(res) {
          assert.equal(stripIndentation(res.text), stripIndentation(expected));
        })
        .end(done);
    });
  });
});
