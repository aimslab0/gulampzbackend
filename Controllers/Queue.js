const Queue = require('bull');
const mongoose = require('mongoose');
const user = require("../models/Users.schema");
const draw = require("../models/Draw.schema");
const sale = require("../models/Sale.schema");

// Create a new queue
const saleQueue = new Queue('saleQueue', {
    redis: {
        host: '127.0.0.1',
        port: 6379
    }
});

saleQueue.on('error', (error) => {
    console.error("Queue error: ", error);
});

saleQueue.on('waiting', (jobId) => {
    console.log(`Job waiting: ${jobId}`);
});

saleQueue.on('active', (job, jobPromise) => {
    console.log(`Job started: ${job.id}`);
});

saleQueue.on('completed', (job, result) => {
    console.log(`Job completed: ${job.id} with result: `, result);
});

saleQueue.on('failed', (job, err) => {
    console.log(`Job failed: ${job.id} with error: `, err);
});

// Processing the queue
saleQueue.process(async (job, done) => {
    console.log("Processing job with data: ", job.data);
    const { drawid, type, salenumber, f, s, addedbyuserid } = job.data;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        let User = await user.findOne({ _id: addedbyuserid }).session(session);

        if (!User || User.payment.availablebalance < (Number(f) + Number(s))) {
            await session.abortTransaction();
            session.endSession();
            console.log("Insufficient balance for user: ", addedbyuserid);
            return done(null, { status: 400, data: { status: false, "Message": "Insufficient balance" } });
        }

        let users = await draw.findOne({ _id: drawid }).session(session);

        if (users) {
            let numbertoadd1 = "", numbertoadd2 = "";
            let soldnumbertoadd1 = "", soldnumbertoadd2 = "";
            let oversalenumbertoadd1 = "", oversalenumbertoadd2 = "";

            switch (salenumber) {
                case 1:
                    numbertoadd1 = "onedigita";
                    numbertoadd2 = "onedigitb";
                    soldnumbertoadd1 = "soldonedigita";
                    soldnumbertoadd2 = "soldonedigitb";
                    oversalenumbertoadd1 = "oversaleonedigita";
                    oversalenumbertoadd2 = "oversaleonedigitb";
                    break;
                case 2:
                    numbertoadd1 = "twodigita";
                    numbertoadd2 = "twodigitb";
                    soldnumbertoadd1 = "soldtwodigita";
                    soldnumbertoadd2 = "soldtwodigitb";
                    oversalenumbertoadd1 = "oversaletwodigita";
                    oversalenumbertoadd2 = "oversaletwodigitb";
                    break;
                case 3:
                    numbertoadd1 = "threedigita";
                    numbertoadd2 = "threedigitb";
                    soldnumbertoadd1 = "soldthreedigita";
                    soldnumbertoadd2 = "soldthreedigitb";
                    oversalenumbertoadd1 = "oversalethreedigita";
                    oversalenumbertoadd2 = "oversalethreedigitb";
                    break;
                case 4:
                    numbertoadd1 = "fourdigita";
                    numbertoadd2 = "fourdigitb";
                    soldnumbertoadd1 = "soldfourdigita";
                    soldnumbertoadd2 = "soldfourdigitb";
                    oversalenumbertoadd1 = "oversalefourdigita";
                    oversalenumbertoadd2 = "oversalefourdigitb";
                    break;
                case 5:
                    numbertoadd1 = "fivedigita";
                    numbertoadd2 = "fivedigitb";
                    soldnumbertoadd1 = "soldfivedigita";
                    soldnumbertoadd2 = "soldfivedigitb";
                    oversalenumbertoadd1 = "oversalefivedigita";
                    oversalenumbertoadd2 = "oversalefivedigitb";
                    break;
            }

            if (((Number(users[numbertoadd1]) - Number(users[soldnumbertoadd1])) >= Number(f)) &&
                ((Number(users[numbertoadd2]) - Number(users[soldnumbertoadd2])) >= Number(s))) {

                let saleData = { drawid, salenumber, type, f, s, addedby: addedbyuserid };
                let newSale = await sale.create([saleData], { session });

                let updateData = {};
                updateData[soldnumbertoadd1] = Number(users[soldnumbertoadd1]) + Number(f);
                updateData[soldnumbertoadd2] = Number(users[soldnumbertoadd2]) + Number(s);

                await draw.updateOne(
                    { _id: drawid },
                    { $set: updateData },
                    { session }
                );

                User.payment.availablebalance -= (Number(f) + Number(s));
                await User.save({ session });

                await session.commitTransaction();
                session.endSession();

                console.log("Sale created successfully for user: ", addedbyuserid);
                return done(null, { status: 200, data: { status: true, data: newSale } });
            } else {
                let saleData = { drawid, salenumber, type: "oversale", f, s, addedby: addedbyuserid };
                let newSale = await sale.create([saleData], { session });

                let updateData = {};
                updateData[oversalenumbertoadd1] = Number(users[oversalenumbertoadd1]) + Number(f);
                updateData[oversalenumbertoadd2] = Number(users[oversalenumbertoadd2]) + Number(s);

                await draw.updateOne(
                    { _id: drawid },
                    { $set: updateData },
                    { session }
                );

                User.payment.availablebalance -= (Number(f) + Number(s));
                await User.save({ session });

                await session.commitTransaction();
                session.endSession();

                console.log("Oversale created successfully for user: ", addedbyuserid);
                return done(null, { status: 200, data: { status: true, data: newSale } });
            }
        } else {
            await session.abortTransaction();
            session.endSession();
            console.log("Draw not found for id: ", drawid);
            return done(null, { status: 404, data: { status: false, "Message": "Draw not found" } });
        }
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error processing job: ", err);
        return done(null, { status: 500, data: { status: false, "Message": "There was an error", "Error": err.message } });
    }
});

module.exports = saleQueue;
