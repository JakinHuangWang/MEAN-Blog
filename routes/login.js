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

// import bcrypt package
const bcrypt = require('bcryptjs');

// import json web token
const jwt = require('jsonwebtoken');


/* GET users listing. */
router.get('/', function(req, res, next) {
    const redirect = req.query.redirect;
    if (redirect == null)
        res.render('login', { redirect : "" });
    else 
        res.render('login', { redirect : redirect });
    
});

router.post('/', function(req, res, next) {
    const username = req.body.username;
    const password = req.body.password;
    const redirect = req.body.redirect;
    const users = client.db('BlogServer').collection('Users');

    if (username == null || password == null) {
        return res.status(401).send("UNAUTHORIZED");
    } else {

        users.findOne({"username" : username}, function(err, docs) {
            if (err) throw err;
            if (docs == null) {
                res.status(401).render('login', { redirect : "" });
                return;
            } else {
                const userCheck = bcrypt.compareSync(password, docs.password);
    
                // Set authentication session cookie in JWT
                if (!userCheck) {
                    return res.status(401).render('login', { redirect : "" });
                } else {
                    const token = jwt.sign({
                            "exp" : Math.round(Date.now() / 1000) + 7200,
                            "usr" : username
                        }, 
                            "C-UFRaksvPKhx1txJYFcut3QGxsafPmwCY6SCly3G6c",
                        {
                            header: {
                                "alg": "HS256",
                                "typ": "JWT"
                            }
                        });
                    res.cookie("jwt", token);
                    if (redirect == "") {
                        return res.status(200).send("SUCCESS");
                    } else {
                        return res.redirect(301, redirect);
                    }
                }
            }
            
        })
    }
  })

module.exports = router;
