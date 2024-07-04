const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    drawid:String,
    sheetname:String,
    date:String,
    addedby:String
}, { timestamps: true });

const User = mongoose.model("Sheet", userSchema);
module.exports = User;
