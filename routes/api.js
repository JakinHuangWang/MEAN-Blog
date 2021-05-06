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
                    return res.status(200).json(docs);
                });
            } else {
               posts.findOne({"username" : username, "postid": parseInt(postid)}, function(err, docs) {
                    res.setHeader("Content-Type", "application/json");
                    if (docs == null) {
                        return res.status(404).send("NOT FOUND");
                    } else {
                        return res.status(200).json(docs);
                    }
               });
            }
        }
    }
});

router.delete('/posts', function(req, res, next) {
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
            posts.findOne({"username" : username, "postid": parseInt(postid)}, function(err, docs) {
                if (docs == null) {
                    return res.status(404).send("NOT FOUND");
                } else {
                    posts.deleteOne({"username" : username, "postid": parseInt(postid)}, function(err, docs) {
                        console.log("1 document deleted");
                        return res.status(204).send("NO CONTENT");
                    });
                }
            });
        }
    }
});

router.post('/posts', function(req, res, next) {
    const username = req.body.username;
    const postid = req.body.postid;
    const title = req.body.title;
    const body = req.body.title;

    if (req.cookies == null || req.cookies.jwt == null) {
        return res.status(401).send("UNAUTHORIZED");
    } else {

        // Check valid request body
        if (username == null || postid == null || title == null || body == null) {
            return res.status(400).send("BAD REQUEST");
        } else {
            const decoded = jwt.verify(req.cookies.jwt, "C-UFRaksvPKhx1txJYFcut3QGxsafPmwCY6SCly3G6c");
            const now = Date.now();
            const curr_time = Math.round(Date.now() / 1000);
            const posts = client.db('BlogServer').collection('Posts');
            const users = client.db('BlogServer').collection('Users');
            
            // Check valid JWT
            if (decoded.usr !== username 
                || curr_time > decoded.exp) {
                return res.status(401).send("UNAUTHORIZED");
            } else {
                // Insert new data to database when postid = 0
                if (parseInt(postid) == 0) {
                    users.findOneAndUpdate({username: username }, {$inc: { maxid : 1 }}, {returnNewDocument: true}, (err, docs) => {
                        if(err) throw err;
                        console.log(docs);
                        posts.insertOne({
                            username: username,
                            postid: docs.value.maxid,
                            title: title,
                            body: body,
                            created: now,
                            modified: now
                        }, function(err, docs) {
                            if(err) return err;
                            return res.status(201).json({
                                postid: docs.postid,
                                created: docs.created,
                                modified: docs.modified
                            })
                        });
                    });
                    
                } else if(parseInt(postid) > 0) {
                    // Update data when postid > 0
                    
                    posts.findOneAndUpdate({username: username, postid: parseInt(postid)}, {
                        $set: {
                            title: title,
                            body: body,
                            modified: now
                        }
                    }, (err, docs) => {
                        if (err) throw err;
                        console.log(docs);
                        if (docs.value == null) {
                            return res.status(404).send("NOT FOUND");
                        } else {
                            return res.status(200).send("OK");
                        }
                    })
                } else {
                    return res.status(400).send("BAD REQUEST");
                }

                // posts.findOne({"username" : username, "postid": parseInt(postid)}, function(err, docs) {
                //     if (docs == null) {
                //         return res.status(404).send("NOT FOUND");
                //     } else {
                //         posts.deleteOne({"username" : username, "postid": parseInt(postid)}, function(err, docs) {
                //             console.log("1 document deleted");
                //             return res.status(204).send("NO CONTENT");
                //         });
                //     }
                // });
            }
        }

        
    }
});

module.exports = router;