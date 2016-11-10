'use strict';
var express = require('express');
var router = express.Router();
var tweetBank = require('../tweetBank');
var pg = require('../db/index');
var ID = 1;;


module.exports = function makeRouterWithSockets (io) {

  // a reusable function
  function respondWithAllTweets (req, res, next){
    //var allTheTweets = tweetBank.list();
    pg.query('SELECT * FROM tweets', function (err, result) {
      if (err) return next(err); // pass errors to Express
      var tweets = result.rows;
      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
    });
  }



  // here we basically treet the root view and tweets view as identical
  router.get('/', respondWithAllTweets);
  router.get('/tweets', respondWithAllTweets);

  // single-user page
  router.get('/users/:username', function(req, res, next){
    //var tweetsForName = tweetBank.find({ name: req.params.username });
    
    pg.query('SELECT name from Users where name=$1', [req.params.username], function(err, result){
      if (err) return next(err);
      var tweetsForName = result.rows;
      console.log(tweetsForName);
      res.render('index', {
        title: 'Twitter.js',
        tweets: tweetsForName,
        showForm: true,
        username: req.params.username
      });

    })

  });

  // single-tweet page
  router.get('/tweets/:id', function(req, res, next){
    //var tweetsWithThatId = tweetBank.find({ id: Number(req.params.id) });
    var newNum = Number(req.params.id);
    pg.query('SELECT * FROM Tweets WHERE id=$1', [newNum], function(err, result){
      
      if(err) return next(err);
      var tweetsWithThatId = result.rows;
      res.render('index', {
        title: 'Twitter.js',
        tweets: tweetsWithThatId // an array of only one element ;-)
      });
    })
  });

  // create a new tweet
  router.post('/tweets', function(req, res, next){
   // var newTweet = tweetBank.add(req.body.name, req.body.content);
   //get the ID from req.body.name 
   //var id = SELECT id from Users where name='Tom Hanks')
   //vr ID = undefined;


   pg.query('SELECT id from Users where name=$1', [req.body.name], function(err, result){
      if(err) return next(err);
      ID = Number(result.rows);

      
   });
   console.log(ID);

    pg.query('INSERT INTO tweets (userId, content) VALUES ($1, $2)', [ID, req.body.content], function (err, data) {
        console.log("TEST");
        if(err) return next(err);
        var newTweet = result.rows;
        io.sockets.emit('new_tweet', newTweet);
        res.redirect('/');


    });

  });

  // // replaced this hard-coded route with general static routing in app.js
  // router.get('/stylesheets/style.css', function(req, res, next){
  //   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
  // });

  return router;
}
