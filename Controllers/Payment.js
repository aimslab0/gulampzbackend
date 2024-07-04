const mongoose = require("mongoose"); 
const user = require("../models/Users.schema")
const draw = require("../models/Draw.schema")
const payment = require("../models/Payment.schema")
const jwt = require("jsonwebtoken")
let getAllpaymentsbyID= async(req , res)=>{
    let id=req.params.id
    let customerid=id;
      let payments = await payment.find({customerid});
      if(payments)
      {
         payments.sort((a,b)=>a.paymentid-b.paymentid)
         res.status(200).json(payments)
      }else
      {
        res.status(404).json({"Message":"Error" })
      }
  }
  let getMyPayments=async(req,res)=>{
    let id=req.Tokendata._id
    let customerid=id;
   
      let payments = await payment.find({customerid});
      if(payments)
      {
         payments.sort((a,b)=>a.paymentid-b.paymentid)
         res.status(200).json(payments)
      }else
      {
        res.status(404).json({"Message":"Error" })
      }
  }

  let Addcashpayment = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      let { type, description, amount, id } = req.body;
      let addedbyuserid = req.Tokendata.userid;
      let users1 = await user.findOne({ _id: id }).session(session);
      
      if (!users1) {
        throw new Error('User not found');
      }
  
      let cash = 0, credit = 0, balanceupline = 0,availablebalance = 0;
      let last = users1.payment;
  
      if (users1.payment.cash !== 0 || users1.payment.credit !== 0 || users1.payment.balanceupline !== 0) {
        if (type === "Draw") {
          cash = Number(last.cash) + Number(amount);
          credit = last.credit;
          balanceupline = last.balanceupline + Number(amount);
          availablebalance= Number(cash)+Number(credit)
        } else if (type === "Withdraw") {
          cash = Number(last.cash) - Number(amount);
          credit = last.credit;
          balanceupline = last.balanceupline - Number(amount);
          availablebalance= Number(cash)+Number(credit)
        }
      } else {
        cash = type === "Draw" ? amount : -amount;
        balanceupline = type === "Draw" ? amount : -amount;
        availablebalance= Number(cash)+Number(credit)
      }
  
      let data = { cash, credit, type, description, amount, customerid: id,availablebalance, addedby: Number(addedbyuserid), balanceupline };
      let paymentData = await payment.create([data], { session });
  
      let updatedUser = {
        payment: {
          cash: paymentData[0].cash,
          credit: paymentData[0].credit,
          balanceupline: paymentData[0].balanceupline,
          availablebalance:data.availablebalance
        }
      };
  
      let users = await user.findByIdAndUpdate(id, updatedUser, { session, new: true });
  
      if (!users) {
        throw new Error('Error updating user');
      }
  
      await session.commitTransaction();
      session.endSession();
      
      res.status(200).json({ status: true, data: users, payment: paymentData[0] });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      res.status(500).json({ status: false, "Message": error.message });
    }
  };
  
  const Addcreditpayment = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      let { type, description, amount, id } = req.body;
      let addedbyuserid = req.Tokendata.userid;
      let users1 = await user.findOne({ _id: id }).session(session);
  
      if (!users1) {
        throw new Error('User not found');
      }
  
      let credit = 0, cash = 0, balanceupline = 0,availablebalance = 0 ;
      let last = users1.payment;
  
      if (users1.payment.cash !== 0 || users1.payment.credit !== 0 || users1.payment.balanceupline !== 0) {
        if (type === "Draw") {
          credit = Number(last.credit) + Number(amount);
          cash = last.cash;
          balanceupline = last.balanceupline;
          availablebalance= Number(cash)+Number(credit)
        } else if (type === "Withdraw") {
          credit = Number(last.credit) - Number(amount);
          cash = last.cash;
          balanceupline = last.balanceupline;
          availablebalance= Number(cash)+Number(credit)
        }
      } else {
        credit = type === "Draw" ? amount : -amount;
        availablebalance= Number(cash)+Number(credit)
      }
  
      let data = { cash, credit, type, amount,availablebalance, description, customerid: id, addedby: Number(addedbyuserid), balanceupline };
      let paymentData = await payment.create([data], { session });
  
      let updatedUser = {
        payment: {
          cash: paymentData[0].cash,
          credit: paymentData[0].credit,
          balanceupline: paymentData[0].balanceupline,
          availablebalance:data.availablebalance
        }
      };
  
      let users = await user.findByIdAndUpdate(id, updatedUser, { session, new: true });
  
      if (!users) {
        throw new Error('Error updating user');
      }
  
      await session.commitTransaction();
      session.endSession();
  
      res.status(200).json({ status: true, data: users, payment: paymentData[0] });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      res.status(500).json({ status: false, "Message": error.message });
    }
  };
  
  let Addcashpaymentbyditributor = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        let { type, description, amount, id } = req.body;
        let addedbyuserid = req.Tokendata._id;
      
        // Fetch the user who is adding the payment
        let addedByUser = await user.findOne({ _id: addedbyuserid }).session(session);
        if (!addedByUser) {
            throw new Error('Added by user not found');
        }
        
        // Check if the adding user's available balance is sufficient
        if (type==="Draw" && Number(addedByUser.payment.availablebalance) < Number(amount)) {
            throw new Error('Insufficient balance for the user adding the payment');
        }

        let users1 = await user.findOne({ _id: id }).session(session);
        if (!users1) {
            throw new Error('User not found');
        }
  
        let cash = 0, credit = 0, balanceupline = 0, availablebalance = 0;
        let last = users1.payment;
  
        if (users1.payment.cash !== 0 || users1.payment.credit !== 0 || users1.payment.balanceupline !== 0 || users1.payment.availablebalance !== 0) {
            if (type === "Draw") {
                cash = Number(last.cash) + Number(amount);
                credit = Number(last.credit);
                balanceupline = Number(last.balanceupline) + Number(amount);
                availablebalance = cash + credit;
            } else if (type === "Withdraw") {
                cash = Number(last.cash) - Number(amount);
                credit = Number(last.credit);
                balanceupline = Number(last.balanceupline) - Number(amount);
                availablebalance = cash + credit;
            }
        } else {
            cash = type === "Draw" ? Number(amount) : -Number(amount);
            balanceupline = type === "Draw" ? Number(amount) : -Number(amount);
            availablebalance = cash + credit;
        }
        let data = { cash, credit, type, availablebalance, description, amount: Number(amount), customerid: id, addedby: addedbyuserid, balanceupline };
        let paymentData = await payment.create([data], { session });
  
        let updatedUser = {
            payment: {
                cash: paymentData[0].cash,
                credit: paymentData[0].credit,
                balanceupline: paymentData[0].balanceupline
            }
        };
  
        let users = await user.findByIdAndUpdate(id, updatedUser, { session, new: true });
        if (!users) {
            throw new Error('Error updating user');
        }

        // Update the available balance of the user who added the payment
        if(type==="Draw")
        {addedByUser.payment.availablebalance = Number(addedByUser.payment.availablebalance) - Number(amount);}
        else{
          addedByUser.payment.availablebalance = Number(addedByUser.payment.availablebalance) + Number(amount);
        }
        await addedByUser.save({ session });

        await session.commitTransaction();
        session.endSession();
        
        res.status(200).json({ status: true, data: users, payment: paymentData[0] });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ status: false, "Message": error.message });
    }
};

let Addcreditpaymentbyditributor = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let { type, description, amount, id } = req.body;
    let addedbyuserid = req.Tokendata._id;
      
    // Fetch the user who is adding the payment
    let addedByUser = await user.findOne({ _id: addedbyuserid }).session(session);
    if (!addedByUser) {
        throw new Error('Added by user not found');
    }
    
    // Check if the adding user's available balance is sufficient
    if (type==="Draw" && Number(addedByUser.payment.availablebalance) < Number(amount)) {
        throw new Error('Insufficient balance for the user adding the payment');
    }
    let users1 = await user.findOne({ _id: id }).session(session);

    if (!users1) {
      throw new Error('User not found');
    }

    let credit = 0, cash = 0, balanceupline = 0,availablebalance = 0 ;
    let last = users1.payment;

    if (users1.payment.cash !== 0 || users1.payment.credit !== 0 || users1.payment.balanceupline !== 0) {
      if (type === "Draw") {
        credit = Number(last.credit) + Number(amount);
        cash = last.cash;
        balanceupline = last.balanceupline;
        availablebalance= Number(cash)+Number(credit)
      } else if (type === "Withdraw") {
        credit = Number(last.credit) - Number(amount);
        cash = last.cash;
        balanceupline = last.balanceupline;
        availablebalance= Number(cash)+Number(credit)
      }
    } else {
      credit = type === "Draw" ? amount : -amount;
      availablebalance= Number(cash)+Number(credit)
    }

    let data = { cash, credit, type, amount,availablebalance, description, customerid: id, addedby: Number(addedbyuserid), balanceupline };
    let paymentData = await payment.create([data], { session });

    let updatedUser = {
      payment: {
        cash: paymentData[0].cash,
        credit: paymentData[0].credit,
        balanceupline: paymentData[0].balanceupline
      }
    };

    let users = await user.findByIdAndUpdate(id, updatedUser, { session, new: true });

    if (!users) {
      throw new Error('Error updating user');
    }
    if(type==="Draw")
      {addedByUser.payment.availablebalance = Number(addedByUser.payment.availablebalance) - Number(amount);}
      else{
        addedByUser.payment.availablebalance = Number(addedByUser.payment.availablebalance) + Number(amount);
      }
      await addedByUser.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ status: true, data: users, payment: paymentData[0] });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ status: false, "Message": error.message });
  }
};


  module.exports  ={
    Addcashpayment,
    Addcreditpayment,
    getAllpaymentsbyID,
    getMyPayments,
    Addcashpaymentbyditributor,
    Addcreditpaymentbyditributor
}