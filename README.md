News website
============

Simple news website in Node.js. Streams loading, parsing and rendering of a number of RSS feeds into a single page app.

##[Demo](https://node-news-website.herokuapp.com)

Setup with:

    npm install

Configure RSS environment variables using a `.env` file in your project root e.g:

    FEEDS="http://feeds.bbci.co.uk/news/rss.xml,http://feeds.skynews.com/feeds/rss/home.xml"
    FEED_LIMIT=10

Run with:

    node app.js

Test with:

    npm install mocha -g
    mocha
