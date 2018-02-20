const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');
const Favourites = require('../models/favorite');
const favouriteRouter = express.Router();
const cors = require('./cors');

module.exports = favouriteRouter;
favouriteRouter.route("/")
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        var userId = req.user._id;
        Favourites.findOne({ 'user': userId })
            .populate("user")
            .populate("dishes").then(favourites => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favourites);
            }, err => { next(err) }).catch(err => {
                next(err);
            });
    })
    .post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        var userId = req.user._id;
        Favourites.find({ 'user': userId }).then(favourites => {
            if (!favourites || !favourites.length) {
                Favourites.create({ user: userId, dishes: req.body }).then(favs => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favs);
                })
            } else {
                let favorite = favourites[0];
                let tobeAddDishes = favorite.dishes;
                for (let i = 0, len = req.body.length; i < len; i++) {
                    if (tobeAddDishes.indexOf(req.body[i]._id) == -1) {
                        tobeAddDishes.push(req.body[i]._id);
                    }
                }
                favorite.dishes = tobeAddDishes;
                favorite.save()
                    .then((fav) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(fav);
                    }, (err) => next(err));
            }
        }, err => { next(err) }).catch(err => {
            next(err);
        });
    })
    .delete(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        var userId = req.user._id;
        Favourites.remove({ user: userId }).then(succ => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(succ);
        }, err => {
            next(err);
        }).catch(error => {
            next(error);
        })
    })
favouriteRouter.route("/:dishId")
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favourites.findOne({user: req.user._id})
    .then((favorites) => {
        if (!favorites) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "favorites": favorites});
        }
        else {
            if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "favorites": favorites});
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": true, "favorites": favorites});
            }
        }

    }, (err) => next(err))
    .catch((err) => next(err))
})
    .post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        var userId = req.user._id;
        Favourites.findOne({ 'user': userId }).then(favorite => {
            if (!favorite) {
                Favourites.create({ user: userId, dishes: [req.params.dishId] }).then(favs => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favs);
                })
            } else {
                let tobeAddDishes = favorite.dishes;
                if (tobeAddDishes.indexOf(req.params.dishId) == -1) {
                    tobeAddDishes.push(req.params.dishId);
                }
                favorite.dishes = tobeAddDishes;
                favorite.save()
                    .then((fav) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(fav);
                    }, (err) => next(err));
            }
        }).catch(error => {
            next(error);
        })
    })
    .delete(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        var userId = req.user._id;
        Favourites.findOne({ 'user': userId }).then(favorite => {
            let tobeAddDishes = favorite.dishes;
            if (tobeAddDishes.indexOf(req.params.dishId) !== -1) {
                tobeAddDishes.remove(req.params.dishId);
            }
            favorite.dishes = tobeAddDishes;
            favorite.save()
                .then((fav) => {
                    Favourites.findOne({ 'user': userId })
                    .populate('user')
                    .populate('dishes')
                    .then((favorite) => {
                        console.log('Favorite Dish Deleted!', favorite);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                }, (err) => next(err));
        })
    })