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

/* GET users listing. */
router.get('/', function(req, res, next) {
    const redirect = req.query.redirect;
    console.log(req.query);
    if (redirect == null)
        res.render('login', { redirect : false });
    else 
        res.render('login', { redirect : true });
    
});

router.post('/', function(req, res, next) {
    const username = req.params.username;
    const password = req.params.password;

    if (username == null || password == null) {
        res.status(401).send("UNAUTHORIZED");
    } else {

    }
    res.status(200).send("SUCCESS");
  })

module.exports = router;
