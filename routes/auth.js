
const express = require("express");
const User = require("../models/user");
const router = new express.Router();
const bcrypt = require("bcrypt");
const {SECRET_KEY} = require("../config");
const jwt = require("jsonwebtoken");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
 router.post("/login", async (req, res, next) => {
   try{
      const user = await User.get(req.body.username);
      const pass = await bcrypt.compare(req.body.password, user.password);
      const payload = {
         "username": user.username, 
         "password": user.password
      }

      if(pass === true){
         await User.updateLoginTimestamp(req.body.username);
         let token = jwt.sign({payload}, SECRET_KEY);
         
         return res.json({token});
      }
      else{
         const err = new Error(`Invalid username/password`);
         err.status = 400;
         throw err;
      }
   }
   catch(err){
      return next(err);
   }
 });

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
 router.post("/register", async (req, res, next) => {
    try{
      const username = req.body.username;
      const password = await bcrypt.hash(req.body.password, 12);
      const first_name = req.body.first_name;
      const last_name = req.body.last_name;
      const phone = req.body.phone;
      const user = await User.register(
         username, 
         password, 
         first_name, 
         last_name, 
         phone
    );

    let token = jwt.sign({user}, SECRET_KEY);
 
     return res.json({token});
    }
    catch(err){
     return next(err);
    }
 });

 module.exports = router;
