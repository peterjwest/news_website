var request = require('request');
var async = require('async');
var FeedParser = require('feedparser');
var Transform = require('stream').Transform;
var util = require('util');
var _ = require('underscore');

// Simple read/write stream to pass items through
var ObjectStream = function () {
    Transform.call(this);

    this._writableState.objectMode = true;
    this._readableState.objectMode = true;
};
util.inherits(ObjectStream, Transform);

ObjectStream.prototype._transform = function(obj, encoding, next) {
    this.push(obj);
    next();
};

/**
 * Reads and parses RSS feeds with an optional limit on the amount of items per feed
 * Returns a readable stream of the items
 * Fails soft - if errors occur in a feed, the others are still processed
 */
module.exports = function (feeds, limit) {

  var feedStream = new ObjectStream();
  var items = [];

  // Request RSS feeds in parallel
  async.eachLimit(feeds, 5, function (feed, nextIterator) {

    var feedParser = new FeedParser();

    // Request feed and pipe response to stream based feed parser
    request(feed)
      // Ignore errors, since this should fail soft
      .on('error', _.bind(nextIterator, this, null))
      .on('response', function (res) {
        if (res.statusCode != 200) {
          return nextIterator();
        }

        this.pipe(feedParser);
      });

    var i = 0;

    // Pass items from the parser to the output stream, within the limit
    feedParser
      // Ignore errors, since this should fail soft
      .on('error', _.bind(nextIterator, this, null))
      .on('data', function (data) {
        if (limit === false || i < limit) {
          feedStream.write(data);
        }
        i++;
      })
      .on('end', function() {
        nextIterator();
      });

  }, function () {
    feedStream.end();
  });

  return feedStream;
};
