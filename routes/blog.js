// import MongoDB driver
const MongoClient = require('mongodb').MongoClient;
const options = { useUnifiedTopology: true, writeConcern: { j: true } };

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
        console.log(docs);
        res.render('blog', { title: docs[0].title, body: docs[0].body });
    });
});

/* Get the first 5 blog posts from a user */
router.get('/:username', (req, res, next) => {
    const posts = client.db('BlogServer').collection('Posts');
    const username = req.params.username;
    posts.find({"username" : username}).toArray((err, docs) => {
        res.render('blogList', { user: username, data: docs });
    });
});

module.exports = router;