var fs = require('fs');
var handlebars = require('handlebars');
var handlebarStream = require('handlebars-stream');

/**
 * Creates a renderer which streams data to a repeated handlebar template, including a layout
 */
module.exports = function (viewDir, layout) {

  // Splits a layout in half and compiles each half
  // Takes advantage of the fact that handlebars layouts all use {{{body}}} for their content
  var compileLayout = function (data, next) {
    fs.readFile(viewDir + '/' + layout, 'utf8', function (err, markup) {
        if (err) {
          return next(err);
        }

        var wrap = markup.split("{{{body}}}");

        next(null, {
          open: handlebars.compile(wrap[0])(data),
          close: handlebars.compile(wrap[1])(data)
        });
    });
  };

  // Renders a simple template for each streamed value, wrapped in the configured layout
  return function (template, data, stream, output) {
    compileLayout(data, function(err, layout) {
      if (err) {
        return output.end('Sorry, an error occurred');
      }

      fs.readFile(viewDir + '/' + template, 'utf8', function (err, markup) {
        if (err) {
          return output.end('Sorry, an error occurred');
        }

        // Layout append/prepend handled by handlebars-stream
        stream.pipe(handlebarStream(markup, layout)).pipe(output)
      });
    });
  };
};
