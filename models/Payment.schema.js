const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const userSchema = new mongoose.Schema({
    credit: Number,
    cash: Number,
    description: String,
    addedby:String,
    type: String,
    balanceupline:Number,
    amount:Number,
    customerid:String
}, { timestamps: true });

userSchema.plugin(AutoIncrement, { inc_field: 'paymentid' });

const User = mongoose.model("Payment", userSchema);
module.exports = User;
