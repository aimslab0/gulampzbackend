const {Addsale,getMySaleDetail,DeleteSales,Addmultiplesale} = require("../Controllers/Sale")
const express = require("express");
const { AuthenticateUser,Authenticatedornot } = require("../utils");

const router = express.Router();
router.post("/addsale"  ,AuthenticateUser,  Addsale )
router.get("/getmysaledetail/:id"  ,AuthenticateUser,  getMySaleDetail )
router.post("/deletesale"  ,AuthenticateUser,  DeleteSales )
router.post("/addmultiplesale"  ,AuthenticateUser,  Addmultiplesale )
module.exports = router;