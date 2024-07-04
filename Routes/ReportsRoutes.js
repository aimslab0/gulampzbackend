const {Addsheetmerchant,getSheetsByDate} = require("../Controllers/Report")
const express = require("express");
const { AuthenticateUser,Authenticatedornot } = require("../utils");

const router = express.Router();
router.post("/addsheetmerchant"  ,AuthenticateUser,  Addsheetmerchant )
router.post("/getsheetmerchant/:date"  ,AuthenticateUser,  getSheetsByDate )
module.exports = router;