var express = require('express');
var bodyParser = require('body-parser');
var rssParser = require('./lib/rss-parser');
var templateStream = require('./lib/template-stream')(__dirname + '/views', 'layout_.handlebars');

var app = express();

var feeds = ['http://feeds.bbci.co.uk/news/rss.xml', 'http://feeds.skynews.com/feeds/rss/home.xml'];

app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function (req, res) {
  res.locals.title = 'The newest news';
  var articles = rssParser(feeds, 10);
  templateStream('article.handlebars', res.locals, articles).pipe(res);
});

app.use(express.static('public'));

app.listen(process.env.PORT || 3000);
