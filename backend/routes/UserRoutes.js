const express = require('express');
const UserData =require('../controller/UserController');
const userAuth = require('../middelware/AuthMiddelware');
const router = express.Router();

router.get("/data",userAuth,UserData.getUserData )

module.exports = router