var express = require('express');
var bodyParser = require('body-parser');
var rssParser = require('./lib/rss-parser');
var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
var feeds = ['http://feeds.bbci.co.uk/news/rss.xml', 'http://feeds.skynews.com/feeds/rss/home.xml'];

app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function(req, res) {
    res.render('index');
});

app.use(express.static('public'));

app.listen(process.env.PORT || 3000);
