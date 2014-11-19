var express = require('express');
var bodyParser = require('body-parser');
var rssParser = require('./lib/rss-parser');
var templateStream = require('./lib/template-stream')(__dirname + '/views', 'layout_.handlebars');

require('dotenv').load();

var app = module.exports = express();

var feeds = process.env.FEEDS ? process.env.FEEDS.split(',') : [];

app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function (req, res) {
  res.locals.title = 'The newest news';
  var articles = rssParser(feeds, process.env.FEED_LIMIT || 10);
  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
  templateStream('article.handlebars', res.locals, articles).pipe(res);
});

app.use(express.static('public'));

if (require.main === module) {
  app.listen(process.env.PORT || 3000);
}
