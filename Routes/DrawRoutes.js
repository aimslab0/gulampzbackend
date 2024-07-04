const {getAllDraws,Createdraw,getAllActiveDraws,updatedrawById,getDrawfieldsvalue,activatedrawById,deactivatedrawById } = require("../Controllers/Draw")
const express = require("express");
const { AuthenticateUser,Authenticatedornot } = require("../utils");

const router = express.Router();
router.get("/"  ,AuthenticateUser,  getAllDraws )
router.post("/createdraw"  ,AuthenticateUser,  Createdraw )
router.patch("/editdraw"  ,AuthenticateUser,  updatedrawById )
router.patch("/activatedraw"  ,AuthenticateUser,  activatedrawById )
router.patch("/deactivatedraw"  ,AuthenticateUser,  deactivatedrawById )
router.get("/getallactivedraws"  ,AuthenticateUser,  getAllActiveDraws )
router.post("/getdrawfieldsvalue"  ,AuthenticateUser,  getDrawfieldsvalue )
module.exports = router;