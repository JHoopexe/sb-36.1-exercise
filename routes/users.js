
const express = require("express");
const User = require("../models/user");
const router = new express.Router();
const {authenticateJWT, ensureLoggedIn} = require("../middleware/auth");

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get('/',
    authenticateJWT,
    async (req, res, next) => {
    try{
        const users = await User.all();
        console.log(req.user);
        return res.json({"users": users});
    }
    catch(err){
        return next(err);
    }
});

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get('/:username', 
    // ensureLoggedIn,
    async (req, res, next) => {
    try{
        let user = await User.get(req.params.username);
        return res.json({user});
    }
    catch(err){
        return next(err);
    }
});

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/to", 
    // ensureLoggedIn,
    async (req, res, next) => {
    try{
        let user = await User.get(req.params.username);
        let message = await User.messagesTo(user.username);
        return res.json({"message": message});
    }
    catch(err){
        return next(err);
    }
});

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
 router.get("/:username/from", 
    // ensureLoggedIn,
    async (req, res, next) => {
    try{
        let user = await User.get(req.params.username);
        let message = await User.messagesFrom(user.username);
        return res.json({"message": message});
    }
    catch(err){
        return next(err);
    }
});

module.exports = router;
