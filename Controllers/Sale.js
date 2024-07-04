const user = require("../models/Users.schema")
const draw = require("../models/Draw.schema")
const sale = require("../models/Sale.schema")
const jwt = require("jsonwebtoken")
const mongoose = require('mongoose');

const Addsale = async (req, res) => {
  if (req.Tokendata.role === "merchant") {
      let { bundle, drawid, type, salenumber, f, s, salecode } = req.body;
      let addedbyuserid = req.Tokendata._id;

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        let newobj=false
          let User = await user.findOne({ _id: addedbyuserid }).session(session);

          if (!User || User.payment.availablebalance < (Number(f) + Number(s))) {
              await session.abortTransaction();
              session.endSession();
              return res.status(400).json({ status: false, "Message": "Insufficient balance" });
          }

          let users = await draw.findOne({ _id: drawid }).session(session);
          if (users) {
              let numbertoadd1 = "";
              let numbertoadd2 = "";
              if (salenumber === 1) {
                numbertoadd1 = "onedigita";
                numbertoadd2 = "onedigitb";
            } else if (salenumber === 2) {
                numbertoadd1 = "twodigita";
                numbertoadd2 = "twodigitb";
            } else if (salenumber === 3) {
                numbertoadd1 = "threedigita";
                numbertoadd2 = "threedigitb";
            } else if (salenumber === 4) {
                numbertoadd1 = "fourdigita";
                numbertoadd2 = "fourdigitb";
            }
              let soldnumbertoadd1 = "sold" + bundle + "a";
              let soldnumbertoadd2 = "sold" + bundle + "b";
              let oversalenumbertoadd1 = "oversale" + bundle + "a";
              let oversalenumbertoadd2 = "oversale" + bundle + "b";

              if (!users.type) {
                  users.type = new Map();
              }

              if (!(users.type.has(soldnumbertoadd1)) || !(users.type.has(soldnumbertoadd2))) {
                  users.type.set(soldnumbertoadd1, 0);
                  users.type.set(soldnumbertoadd2, 0);
                  users.type.set(oversalenumbertoadd1, 0);
                  users.type.set(oversalenumbertoadd2, 0);
                  newobj=true
              }

              if (((Number(users[numbertoadd1]) - Number(users.type.get(soldnumbertoadd1))) >= Number(f)) &&
                  ((Number(users[numbertoadd2]) - Number(users.type.get(soldnumbertoadd2))) >= Number(s))) {

                  let saleData = { bundle, salecode, drawid, salenumber, type, f, s, addedby: addedbyuserid };
                  let newSale = await sale.create([saleData], { session });

                  let updateData = {};
                  updateData[`type.${soldnumbertoadd1}`] = Number(users.type.get(soldnumbertoadd1)) + Number(f);
                  updateData[`type.${soldnumbertoadd2}`] = Number(users.type.get(soldnumbertoadd2)) + Number(s);
                    if(newobj){
                      updateData[`type.${oversalenumbertoadd1}`] =0
                      updateData[`type.${oversalenumbertoadd2}`] =0
                    }
                  await draw.updateOne(
                      { _id: drawid },
                      { $set: updateData },
                      { session }
                  );
                  User.payment.availablebalance -= (Number(f) + Number(s));
                  await User.save({ session });
                  await session.commitTransaction();
                  session.endSession();

                  res.status(200).json({ status: true, data: newSale });

              } else {
                  let diff_of_f = ((Number(users[numbertoadd1]) - Number(users.type.get(soldnumbertoadd1))) === 0) ? f : (Number(f) - ((Number(users[numbertoadd1]) - Number(users.type.get(soldnumbertoadd1)))));
                  let diff_of_s = ((Number(users[numbertoadd2]) - Number(users.type.get(soldnumbertoadd2))) === 0) ? s : (Number(s) - ((Number(users[numbertoadd2]) - Number(users.type.get(soldnumbertoadd2)))));
                  let saleData = { bundle, drawid, salecode, salenumber, type: "oversale", f: diff_of_f, s: diff_of_s, addedby: addedbyuserid };
                  let saleData1 = null, newSale1 = null;
                  let updateData = {};

                  if (diff_of_f !== f && diff_of_s !== s) {
                      saleData1 = { bundle, drawid, salecode, salenumber, type: "sale", f: Number(f) - Number(diff_of_f), s: Number(s) - Number(diff_of_s), addedby: addedbyuserid };
                      updateData[`type.${soldnumbertoadd1}`] = Number(users.type.get(soldnumbertoadd1)) + Number(saleData1.f);
                      updateData[`type.${soldnumbertoadd2}`] = Number(users.type.get(soldnumbertoadd2)) + Number(saleData1.s);
                  } else if (diff_of_f !== f && diff_of_s === s) {
                      saleData1 = { bundle, drawid, salecode, salenumber, type: "sale", f: Number(f) - Number(diff_of_f), s: diff_of_s, addedby: addedbyuserid };
                      updateData[`type.${soldnumbertoadd1}`] = Number(users.type.get(soldnumbertoadd1)) + Number(saleData1.f);
                      updateData[`type.${soldnumbertoadd2}`] = Number(users.type.get(soldnumbertoadd2)) + Number(saleData1.s);
                  } else if (diff_of_f === f && diff_of_s !== s) {
                      saleData1 = { bundle, drawid, salecode, salenumber, type: "sale", f: diff_of_f, s: Number(s) - Number(diff_of_s), addedby: addedbyuserid };
                      updateData[`type.${soldnumbertoadd1}`] = Number(users.type.get(soldnumbertoadd1)) + Number(saleData1.f);
                      updateData[`type.${soldnumbertoadd2}`] = Number(users.type.get(soldnumbertoadd2)) + Number(saleData1.s);
                  }
                  console.log("called",users.type.get(oversalenumbertoadd1))
                  if (saleData1) {
                      newSale1 = await sale.create([saleData1], { session });
                  }

                  let newSale = await sale.create([saleData], { session });

                  updateData[`type.${oversalenumbertoadd1}`] = Number(users.type.get(oversalenumbertoadd1)) + Number(saleData.f);
                  updateData[`type.${oversalenumbertoadd2}`] = Number(users.type.get(oversalenumbertoadd2)) + Number(saleData.s);

                  await draw.updateOne(
                      { _id: drawid },
                      { $set: updateData },
                      { session }
                  );

                  if (newSale1) {
                      User.payment.availablebalance -= (Number(saleData1.f) + Number(saleData1.s));
                      await User.save({ session });
                  }
                  await session.commitTransaction();
                  session.endSession();
                  if (newSale1) {
                      res.status(200).json({ status: true, data: [...newSale, ...newSale1] });
                  } else {
                      res.status(200).json({ status: true, data: newSale });
                  }

              }
          } else {
              await session.abortTransaction();
              session.endSession();
              res.status(404).json({ status: false, "Message": "Draw not found" });
          }
      } catch (err) {
          await session.abortTransaction();
          session.endSession();
          res.status(500).json({ status: false, "Message": err.message, "Error": err.message });
      }
  } else {
      res.status(403).json({ status: false, "Message": "You don't have access" });
  }
};

    const DeleteSales = async (req, res) => {
    if (req.Tokendata.role === "merchant") {
        const saleIds = req.body.saleIds;  // Assuming the sale IDs are sent in the request body as an array
        const addedbyuserid = req.Tokendata._id;

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            for (let saleId of saleIds) {
                let saleRecord = await sale.findOne({ _id: saleId, addedby: addedbyuserid }).session(session);
                if (!saleRecord) {
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(404).json({ status: false, "Message": `Sale not found for ID: ${saleId}` });
                }
                let { drawid,bundle, salenumber, type, f, s } = saleRecord;
                let drawRecord = await draw.findOne({ _id: drawid }).session(session);
                if (!drawRecord) {
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(404).json({ status: false, "Message": `Draw not found for sale ID: ${saleId}` });
                }
                let numbertoadd1 = "", numbertoadd2 = "";
                if (salenumber === 1) {
                    numbertoadd1 = "onedigita";
                    numbertoadd2 = "onedigitb";
                } else if (salenumber === 2) {
                    numbertoadd1 = "twodigita";
                    numbertoadd2 = "twodigitb";
                } else if (salenumber === 3) {
                    numbertoadd1 = "threedigita";
                    numbertoadd2 = "threedigitb";
                } else if (salenumber === 4) {
                    numbertoadd1 = "fourdigita";
                    numbertoadd2 = "fourdigitb";
                } 
                let soldnumbertoadd1 = "sold" + bundle + "a";
                let soldnumbertoadd2 = "sold" + bundle + "b";
                let oversalenumbertoadd1 = "oversale" + bundle + "a";
                let oversalenumbertoadd2 = "oversale" + bundle + "b";
  
                let updateData = {};
                if (type === "sale") {
                    updateData[`type.${soldnumbertoadd1}`] = Number(drawRecord.type.get(soldnumbertoadd1)) - Number(f);
                    updateData[`type.${soldnumbertoadd2}`] = Number(drawRecord.type.get(soldnumbertoadd1)) - Number(s);
                    let User = await user.findOne({ _id: addedbyuserid }).session(session);
                    User.payment.availablebalance += (Number(f) + Number(s));
                    await User.save({ session });
                } else if (type === "oversale") {
                    updateData[`type.${oversalenumbertoadd1}`] = Number(drawRecord.type.get(oversalenumbertoadd1) ) - Number(f);
                    updateData[`type.${oversalenumbertoadd2}`]  = Number(drawRecord.type.get(oversalenumbertoadd1) ) - Number(s);
                }
                await draw.updateOne(
                    { _id: drawid },
                    { $set: updateData },
                    { session }
                );
                // console.log(Number(f) , Number(s))
                // let User = await user.findOne({ _id: addedbyuserid }).session(session);
                // User.payment.availablebalance += (Number(f) + Number(s));
                // await User.save({ session });

                await sale.deleteOne({ _id: saleId }).session(session);
            }

            await session.commitTransaction();
            session.endSession();

            res.status(200).json({ status: true, "Message": "Sales deleted successfully" });
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            res.status(500).json({ status: false, "Message": "There was an error", "Error": err.message });
        }
    } else {
        res.status(403).json({ status: false, "Message": "You don't have access" });
    }
};
let getMySaleDetail=async(req,res)=>{
    let id = req.params.id;
    let userid=req.Tokendata._id
    let users = await sale.find({drawid:id,addedby:userid})
    if(users)
      {
         res.status(200).json({users})
      }else
      {
        res.status(404).json({status:false,"Message":"Error"})
      }
  }
  let Addmultiplesale = async (req, res) => {
    if (req.Tokendata.role === "merchant") {
      const salesArray = req.body.sales; // Expecting an array of sale objects
      const addedbyuserid = req.Tokendata._id;
  
      const session = await mongoose.startSession();
      session.startTransaction();
  
      try {
        let User = await user.findOne({ _id: addedbyuserid }).session(session);
  
        // Calculate the total amount needed for all sales
        let totalF = 0;
        let totalS = 0;
        salesArray.forEach(sale => {
          totalF += Number(sale.f);
          totalS += Number(sale.s);
        });
  
        if (!User || User.payment.availablebalance < (totalF + totalS)) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ status: false, "Message": "Insufficient balance" });
        }
  
        let allSales = [];
        let insufficientSales = [];
  
        for (let sale of salesArray) {
          let newobj=false
          let { bundle,drawid, type, salenumber, f, s, salecode } = sale;
     
          let users = await draw.findOne({ _id: drawid }).session(session);
  
          if (!users) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ status: false, "Message": "Draw not found" });
          }
  
          let numbertoadd1 = "", numbertoadd2 = "";
  
          switch (salenumber) {
            case 1:
              numbertoadd1 = "onedigita";
              numbertoadd2 = "onedigitb";
              break;
            case 2:
              numbertoadd1 = "twodigita";
              numbertoadd2 = "twodigitb";
              break;
            case 3:
              numbertoadd1 = "threedigita";
              numbertoadd2 = "threedigitb";
              break;
            case 4:
              numbertoadd1 = "fourdigita";
              numbertoadd2 = "fourdigitb";
              break;
          }
          let soldnumbertoadd1 = "sold" + bundle + "a";
          let soldnumbertoadd2 = "sold" + bundle + "b";
          let oversalenumbertoadd1 = "oversale" + bundle + "a";
          let oversalenumbertoadd2 = "oversale" + bundle + "b";

          if (!users.type) {
              users.type = new Map();
          }

          if (!(users.type.has(soldnumbertoadd1)) || !(users.type.has(soldnumbertoadd2))) {
              users.type.set(soldnumbertoadd1, 0);
              users.type.set(soldnumbertoadd2, 0);
              users.type.set(oversalenumbertoadd1, 0);
              users.type.set(oversalenumbertoadd2, 0);
              newobj=true;
          }

          if (((Number(users[numbertoadd1]) - Number(users.type.get(soldnumbertoadd1))) >= Number(f)) &&
              ((Number(users[numbertoadd2]) - Number(users.type.get(soldnumbertoadd2))) >= Number(s))) {
            let saleData = {bundle, salecode, drawid, salenumber, type, f, s, addedby: addedbyuserid };
            allSales.push(saleData);
  
            let updateData = {};
            updateData[`type.${soldnumbertoadd1}`] = Number(users.type.get(soldnumbertoadd1)) + Number(f);
            updateData[`type.${soldnumbertoadd2}`] = Number(users.type.get(soldnumbertoadd2)) + Number(s);
            if(newobj){
              updateData[`type.${oversalenumbertoadd1}`] =0
              updateData[`type.${oversalenumbertoadd2}`] =0
            }
            await draw.updateOne(
              { _id: drawid },
              { $set: updateData },
              { session }
            );
  
          } else {
            let diff_of_f = ((Number(users[numbertoadd1]) - Number(users.type.get(soldnumbertoadd1))) === 0) ? f : (Number(f) - ((Number(users[numbertoadd1]) - Number(users.type.get(soldnumbertoadd1)))));
            let diff_of_s = ((Number(users[numbertoadd2]) - Number(users.type.get(soldnumbertoadd2))) === 0) ? s : (Number(s) - ((Number(users[numbertoadd2]) - Number(users.type.get(soldnumbertoadd2)))));
            
            let saleData = {bundle, drawid, salecode, salenumber, type: "oversale", f: diff_of_f, s: diff_of_s, addedby: addedbyuserid };
            allSales.push(saleData);
  
            let updateData = {};
            if (diff_of_f !== f && diff_of_s !== s) {
              let saleData1 = {bundle, drawid, salecode, salenumber, type: "sale", f: Number(f) - Number(diff_of_f), s: Number(s) - Number(diff_of_s), addedby: addedbyuserid };
              allSales.push(saleData1);
              updateData[`type.${soldnumbertoadd1}`] = Number(users.type.get(soldnumbertoadd1)) + Number(saleData1.f);
              updateData[`type.${soldnumbertoadd2}`] = Number(users.type.get(soldnumbertoadd2)) + Number(saleData1.s);
            } else if (diff_of_f !== f && diff_of_s === s) {
              let saleData1 = {bundle, drawid, salecode, salenumber, type: "sale", f: Number(f) - Number(diff_of_f), s: diff_of_s, addedby: addedbyuserid };
              allSales.push(saleData1);
              updateData[`type.${soldnumbertoadd1}`] = Number(users.type.get(soldnumbertoadd1)) + Number(saleData1.f);
              updateData[`type.${soldnumbertoadd2}`] = Number(users.type.get(soldnumbertoadd2)) + Number(saleData1.s);
            } else if (diff_of_f === f && diff_of_s !== s) {
              let saleData1 = {bundle, drawid, salecode, salenumber, type: "sale", f: diff_of_f, s: Number(s) - Number(diff_of_s), addedby: addedbyuserid };
              allSales.push(saleData1);
              updateData[`type.${soldnumbertoadd1}`] = Number(users.type.get(soldnumbertoadd1)) + Number(saleData1.f);
              updateData[`type.${soldnumbertoadd2}`] = Number(users.type.get(soldnumbertoadd2)) + Number(saleData1.s);
            }
  
            updateData[`type.${oversalenumbertoadd1}`] = Number(users.type.get(oversalenumbertoadd1)) + Number(saleData.f);
            updateData[`type.${oversalenumbertoadd2}`] = Number(users.type.get(oversalenumbertoadd2))  + Number(saleData.s);
  
            await draw.updateOne(
              { _id: drawid },
              { $set: updateData },
              { session }
            );
          }
        }
  
        if (allSales.length > 0) {
          let newSales = await sale.create(allSales, { session });
          User.payment.availablebalance -= (totalF + totalS);
          await User.save({ session });
          await session.commitTransaction();
          session.endSession();
          res.status(200).json({ status: true, data: newSales });
        } else {
          await session.commitTransaction();
          session.endSession();
          res.status(400).json({ status: false, "Message": "No valid sales processed" });
        }
  
      } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ status: false, "Message": err.message, "Error": err.message });
      }
    } else {
      res.status(403).json({ status: false, "Message": "You don't have access" });
    }
  };
  
module.exports = {
    Addsale,
    getMySaleDetail,
    DeleteSales,
    Addmultiplesale
}
