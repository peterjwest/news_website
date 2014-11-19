var assert = require('assert');
var nock = require('nock');
var streamSpec = require('stream-spec');
var rssParser = require('../lib/rss-parser');

describe('RSS parser module', function () {
  it('should return a readable stream', function () {
    streamSpec(rssParser([], false))
      .readable()
      .pausable({strict: true})
      .validateOnExit();
  });

  it('should request the feeds provided', function (done) {
    var feeds = [
      nock('http://tapir.com').get('/rss').reply(200),
      nock('http://badger.com').get('/xml').reply(200),
    ];

    rssParser(['http://tapir.com/rss', 'http://badger.com/xml'], false)
      .on('data', function () {
        // Prompts the stream to output data
      })
      .on('end', function () {
        feeds.forEach(function (feed) {
          assert(feed.isDone(), 'URL was not visited');
        });
        done();
      });
  });

  it('should parse and stream items from a feed', function (done) {
    nock('http://badger.com')
      .get('/xml')
      .replyWithFile(200, __dirname + '/fixtures/rss.xml');

    var expected = ['Title one', 'Title two', 'Title three'];
    var items = [];

    rssParser(['http://badger.com/xml'], false)
      .on('data', function (data) {
        items.push(data);
      })
      .on('end', function () {
        var titles = items.map(function(item) {
          return item.title;
        })

        assert.deepEqual(titles, expected);

        done();
      });
  });

  it('should parse and stream items from multiple feeds', function (done) {
    nock('http://tapir.com')
      .get('/rss')
      .delay(100)
      .replyWithFile(200, __dirname + '/fixtures/rss.xml');

    nock('http://badger.com')
      .get('/xml')
      .replyWithFile(200, __dirname + '/fixtures/rss2.xml');

    var expected = ['Title A','Title B','Title C','Title one','Title two','Title three'];
    var items = [];

    rssParser(['http://tapir.com/rss', 'http://badger.com/xml'], false)
      .on('data', function (data) {
        items.push(data);
      })
      .on('end', function () {
        var titles = items.map(function(item) {
          return item.title;
        });

        assert.deepEqual(titles, expected);

        done();
      });
  });

  it('should parse and stream items up to the specified limit', function (done) {
    nock('http://tapir.com')
      .get('/rss')
      .delay(100)
      .replyWithFile(200, __dirname + '/fixtures/rss.xml');

    nock('http://badger.com')
      .get('/xml')
      .delay(150)
      .replyWithFile(200, __dirname + '/fixtures/rss2.xml');

    var expected = ['Title one', 'Title A'];
    var items = [];

    rssParser(['http://tapir.com/rss', 'http://badger.com/xml'], 1)
      .on('data', function (data) {
        items.push(data);
      })
      .on('end', function () {
        var titles = items.map(function(item) {
          return item.title;
        });

        assert.deepEqual(titles, expected);

        done();
      });
  });
});
