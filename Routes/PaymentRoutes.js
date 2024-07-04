const {Addcashpayment,Addcreditpaymentbyditributor,Addcreditpayment,Addcashpaymentbyditributor ,getAllpaymentsbyID,getMyPayments} = require("../Controllers/Payment")
const express = require("express");
const { AuthenticateUser,Authenticatedornot } = require("../utils");

const router = express.Router();
router.post("/addcash"  ,AuthenticateUser,  Addcashpayment )
router.post("/addcredit"  ,AuthenticateUser,  Addcreditpayment )
router.post("/addcashbydistributor"  ,AuthenticateUser,  Addcashpaymentbyditributor )
router.post("/addcreditbydistributor"  ,AuthenticateUser,  Addcreditpaymentbyditributor )
router.get("/getpaymentsbyid/:id",AuthenticateUser,getAllpaymentsbyID)
router.get("/getmypayments",AuthenticateUser,getMyPayments)
module.exports = router;