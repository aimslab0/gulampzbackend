const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const userSchema = new mongoose.Schema({
    drawid: String,
    salenumber: Number,
    addedby: String,
    type: String,
    f: Number,
    s: Number,
    bundle:String,
    salecode: String,
    sheetid: { type: String, default: '' } // Set default value for sheetid
}, { timestamps: true });

userSchema.plugin(AutoIncrement, { inc_field: 'saleid' });

const User = mongoose.model("Sale", userSchema);
module.exports = User;
