var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
router.use(bodyParser.json());
/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', (req, res, next) => {
  User.register(new User({ username: req.body.username }),req.body.password,(err,user)=>{
    if(err){
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    }else{
      passport.authenticate("local")(req,res,()=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, status: 'Registration Successful!'});
      });
    }
  })
  // User.findOne({ username: req.body.username })
  //   .then((user) => {
  //     if (user != null) {
  //       var err = new Error('User ' + req.body.username + ' already exists!');
  //       err.status = 403;
  //       next(err);
  //     }
  //     else {
  //       return User.create({
  //         username: req.body.username,
  //         password: req.body.password
  //       });
  //     }
  //   })
  //   .then((user) => {
  //     res.statusCode = 200;
  //     res.setHeader('Content-Type', 'application/json');
  //     res.json({ status: 'Registration Successful!', user: user });
  //   }, (err) => next(err))
  //   .catch((err) => next(err));
});

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, status: 'You are successfully logged in!'});
});

router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }
  else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});
module.exports = router;
