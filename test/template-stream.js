var streamSpec = require('stream-spec');
var assert = require('assert');
var templateStreamModule = require('../lib/template-stream');
var Readable = require('stream').Readable;
var util = require('util');

// Readable stream for testing
var TestStream = function (data) {
  Readable.call(this);

  this.testData = data || [];

  this._readableState.objectMode = true;
};
util.inherits(TestStream, Readable);

TestStream.prototype._read = function () {
  this.push(this.testData.shift());
};

// Utility method to strip whitespace from test HTML
var stripWhitespace = function(html) {
  return html.replace(/>\s+</g, '><').replace(/^\s+|\s+$/g, '');
};


describe('Template streaming module', function () {
  it('should return a readable stream', function () {

    var templateStream = templateStreamModule(__dirname + '/fixtures', 'layout_.handlebars');

    var input = new TestStream([]);

    streamSpec(templateStream('template.handlebars', {}, input))
      .readable()
      .pausable({strict: true})
      .validateOnExit();
  });

  it('should render data in the layout', function (done) {

    var templateStream = templateStreamModule(__dirname + '/fixtures', 'layout_.handlebars');

    var inputData = {header: 'Ocelot', footer: 'Pug'};
    var inputItems = [{title: 'Cat'}];
    var html = '';

    templateStream('template.handlebars', inputData, new TestStream(inputItems))
      .on('data', function (data) {
        html = html + data.toString('utf8');
      })
      .on('end', function () {
        assert.equal(
          stripWhitespace(html),
          '<header>Ocelot</header><ul><li>Cat</li></ul><footer>Pug</footer>'
        );
        done();
      });
  });

  it('should render data from a readable stream', function (done) {

    var templateStream = templateStreamModule(__dirname + '/fixtures', 'layout_.handlebars');

    var inputItems = [{title: 'Cat'}, {title: 'Dog'}, {title: 'Haggis'}];
    var html = '';

    templateStream('template.handlebars', {}, new TestStream(inputItems))
      .on('data', function (data) {
        html = html + data.toString('utf8');
      })
      .on('end', function () {
        assert.equal(
          stripWhitespace(html),
          '<header></header><ul><li>Cat</li><li>Dog</li><li>Haggis</li></ul><footer></footer>'
        );
        done();
      });
  });

});
