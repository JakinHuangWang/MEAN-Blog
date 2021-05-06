var express = require('express');
var router = express.Router();

// import Json Web Token
const jwt = require('jsonwebtoken');

// import MongoDB driver
const MongoClient = require('mongodb').MongoClient;
const options = { useUnifiedTopology: true, writeConcern: { j: true } };

// connection URL
const url = 'mongodb://localhost:27017';

// create a new MongoClient
const client = new MongoClient(url, options);
client.connect();

router.get('/posts', function(req, res, next) {
    const username = req.query.username;
    const postid = req.query.postid;

    if (req.cookies == null || req.cookies.jwt == null) {
        return res.status(401).send("UNAUTHORIZED");
    } else {
        const decoded = jwt.verify(req.cookies.jwt, "C-UFRaksvPKhx1txJYFcut3QGxsafPmwCY6SCly3G6c");
        const curr_time = Math.round(Date.now() / 1000);
        
        // Check valid JWT
        if (decoded.usr !== username 
            || curr_time > decoded.exp) {
            return res.status(401).send("UNAUTHORIZED");
        } else {
            const posts = client.db('BlogServer').collection('Posts');
            if  (postid == null) {
                posts.find({"username" : username}).toArray((err, docs) => {
                    res.setHeader("Content-Type", "application/json")
                    return res.json(docs);
                });
            } else {
               posts.findOne({"username" : username, "postid": parseInt(postid)}, function(err, docs) {
                    res.setHeader("Content-Type", "application/json");
                    return res.json(docs);
               });
            }
        }
    }
});

module.exports = router;