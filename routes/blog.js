// import MongoDB driver
const MongoClient = require('mongodb').MongoClient;
const options = { useUnifiedTopology: true, writeConcern: { j: true } };

// import commonmark library
const commonmark = require('commonmark');
const reader = new commonmark.Parser();
const writer = new commonmark.HtmlRenderer();

const express = require('express');
const router = express.Router();

// connection URL
const url = 'mongodb://localhost:27017';

// create a new MongoClient
const client = new MongoClient(url, options);

client.connect();

/* Get the blog post with the postid from a user */
router.get('/:username/:postid', (req, res, next) => {
    const posts = client.db('BlogServer').collection('Posts');
    const username = req.params.username;
    const postid = parseInt(req.params.postid);
    posts.find({
        "username" : username, 
        "postid": postid
    }).toArray((err, docs) => {
        if (docs.length == 0) {
            res.sendStatus(404);
        } else {
            var parsed = reader.parse(docs[0].title);
            const title = writer.render(parsed);
            parsed = reader.parse(docs[0].body);
            const body = writer.render(parsed);
            res.render('blog', { title: title, body: body });
        }
    });
});

/* Get the first 5 blog posts from a user */
router.get('/:username', (req, res, next) => {
    const posts = client.db('BlogServer').collection('Posts');
    const username = req.params.username;
    const start = req.query.start;
    posts.find({"username" : username}).toArray((err, docs) => {
        if (docs.length == 0) {
            return res.sendStatus(404);
        }
        if (start == null ) {
            res.render('blogList', { user: username, data: docs, start: 0});
        } else {
            res.render('blogList', { user: username, data: docs, start: parseInt(start) });
        }
    });
});

module.exports = router;