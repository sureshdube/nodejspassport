var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var User = require("./models/user");
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config.js');

// authenticate user while login.

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// get token when used loggin first time.

exports.getToken = function (user) {
    return jwt.sign(user, config.secretKey,
        { expiresIn: 3600 });
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        User.findOne({ _id: jwt_payload._id }, (err, user) => {
            if (err) {
                return done(err, false);
            }
            else if (user) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        });
    }));
    passport.use('admin', new JwtStrategy(opts,
        (jwt_payload, done) => {
            console.log("JWT payload: ", jwt_payload);
            User.findOne({ _id: jwt_payload._id }, (err, user) => {
                if (err) {
                    return done(err, false);
                }
                else if (user.admin === true) {
                    return done(null, user);
                }
                else {
                    return done(new Error("You are not authorized to perform this operation!"), false);
                }
            });
        }));
// after loggedin verify User where authentication is enabled for routers.
exports.verifyUser = passport.authenticate('jwt', { session: false });
exports.verifyAdmin = passport.authenticate('admin', { session: false });
// exports.verifyAdmin = function (req, res, next) {
//     if (req.user && req.user.admin) {
//         next();
//     } else {
//         var err = new Error("You are not authorized to perform this operation!");
//         err.status = 403;
//         next(err);
//     }
// }