const {Loginasanother,getAllUsers,getBalance , GetUserById,getAlldetailsbyId, Createuser, updateuserById, DeleteUserById, Login,Edituser,getAllDistributors,getAllMyDistributors,getAllMerchants,getAllMyMerchants,getAllSubDistributors,getAllMySubDistributors} = require("../Controllers/Users")

const express = require("express");
const { AuthenticateUser,Authenticatedornot } = require("../utils");

const router = express.Router();
router.get("/"  ,AuthenticateUser,  getAllUsers )
router.get("/getalldistributors"  ,AuthenticateUser,  getAllDistributors )
router.get("/getallsubdistributors"  ,AuthenticateUser,  getAllSubDistributors )
router.get("/getallmydistributors"  ,AuthenticateUser,  getAllMyDistributors )
router.get("/getallmysubdistributors"  ,AuthenticateUser,  getAllMySubDistributors )
router.get("/getallMerchants"  ,AuthenticateUser,  getAllMerchants )
router.get("/getallmyMerchants"  ,AuthenticateUser,  getAllMyMerchants )
router.get("/"  ,AuthenticateUser,  getAllUsers )
router.get("/auth"  ,Authenticatedornot )
router.get("/getbalance" ,AuthenticateUser ,getBalance )
router.post("/login" , Login )
router.post("/adduser",AuthenticateUser , Createuser )
router.put("/edituser",AuthenticateUser , Edituser )
router.post("/loginasanotheruser" , Loginasanother ) 
router.get("/:id" , GetUserById)
router.get("/getuserdetailbyid/:id",AuthenticateUser,getAlldetailsbyId)
router.patch("/updateprofile",AuthenticateUser , updateuserById)
module.exports = router;






