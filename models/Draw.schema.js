const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const drawSchema = new mongoose.Schema({
    title: String,
    time: String,
    date: String,
    onedigita: Number,
    onedigitb: Number,
    twodigita: Number,
    twodigitb: Number,
    threedigita: Number,
    threedigitb: Number,
    fourdigita: Number,
    fourdigitb: Number,
    status: String,
    firstprize: String,
    secondprize1: String,
    secondprize2: String,
    secondprize3: String,
    secondprize4: String,
    secondprize5: String,
    addedby: String,
    type: {
        type: Map,
        of: Number
    }
}, { timestamps: true });

drawSchema.plugin(AutoIncrement, { inc_field: 'drawid' });

const Draw = mongoose.model("Draw", drawSchema);

module.exports = Draw;
