const user = require("../models/Users.schema");
const draw = require("../models/Draw.schema");
const sale = require("../models/Sale.schema");
const sheet = require("../models/Sheet.schema");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');

let Addsheetmerchant = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { drawid, sheetname } = req.body;

        // Fetch the draw to get the date
        const drawData = await draw.findById(drawid).session(session);
        if (!drawData) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Draw not found" });
        }

        const date = drawData.date;
        const addedby = req.token._id;

        // Create the new sheet
        const newSheet = new sheet({
            drawid,
            sheetname,
            date,
            addedby
        });

        const savedSheet = await newSheet.save({ session });

        // Update sales with the new sheetid
        await sale.updateMany(
            { drawid, addedby, sheetid: '' },
            { sheetid: savedSheet._id },
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: "Sheet created and sales updated", sheet: savedSheet });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error in Addsheetmerchant:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
let getSheetsByDate = async (req, res) => {
    try {
        const { date } = req.params;

        // Fetch sheets by date
        const sheets = await sheet.find({ date: date });

        if (!sheets.length) {
            return res.status(404).json({ message: "No sheets found for the given date" });
        }

        res.status(200).json(sheets);
    } catch (error) {
        console.error("Error in getSheetsByDate:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
let getSalesBySheet = async (req, res) => {
    try {
        const { sheetId } = req.params;

        // Fetch sales by sheet ID
        const sales = await sale.find({ sheetid: sheetId });

        if (!sales.length) {
            return res.status(404).json({ message: "No sales found for the given sheet ID" });
        }

        res.status(200).json(sales);
    } catch (error) {
        console.error("Error in getSalesBySheet:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
let getSalesBySheetTypeSale = async (req, res) => {
    try {
        const { sheetId } = req.params;

        // Fetch sales by sheet ID and type "sale"
        const sales = await sale.find({ sheetid: sheetId, type: "sale" });

        if (!sales.length) {
            return res.status(404).json({ message: "No sales found for the given sheet ID and type" });
        }

        res.status(200).json(sales);
    } catch (error) {
        console.error("Error in getSalesBySheetType:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
let getSalesBySheetTypeOverSale = async (req, res) => {
    try {
        const { sheetId } = req.params;

        // Fetch sales by sheet ID and type "sale"
        const sales = await sale.find({ sheetid: sheetId, type: "oversale" });

        if (!sales.length) {
            return res.status(404).json({ message: "No sales found for the given sheet ID and type" });
        }

        res.status(200).json(sales);
    } catch (error) {
        console.error("Error in getSalesBySheetType:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
let getSalesBySheetformerchant = async (req, res) => {
    try {
        const { sheetId } = req.params;
        const userid=req.Tokendata._id
        // Fetch sales by sheet ID
        const sales = await sale.find({ sheetid: sheetId,addedby:userid });

        if (!sales.length) {
            return res.status(404).json({ message: "No sales found for the given sheet ID" });
        }

        res.status(200).json(sales);
    } catch (error) {
        console.error("Error in getSalesBySheet:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
let getSalesBySheetTypeSaleformerchant = async (req, res) => {
    try {
        const { sheetId } = req.params;
        const userid=req.Tokendata._id

        // Fetch sales by sheet ID and type "sale"
        const sales = await sale.find({ sheetid: sheetId, type: "sale" ,addedby:userid });

        if (!sales.length) {
            return res.status(404).json({ message: "No sales found for the given sheet ID and type" });
        }

        res.status(200).json(sales);
    } catch (error) {
        console.error("Error in getSalesBySheetType:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
let getSalesBySheetTypeOverSaleformerchant = async (req, res) => {
    try {
        const { sheetId } = req.params;
        const userid=req.Tokendata._id

        // Fetch sales by sheet ID and type "sale"
        const sales = await sale.find({ sheetid: sheetId, type: "oversale",addedby:userid  });

        if (!sales.length) {
            return res.status(404).json({ message: "No sales found for the given sheet ID and type" });
        }

        res.status(200).json(sales);
    } catch (error) {
        console.error("Error in getSalesBySheetType:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
module.exports = {
    Addsheetmerchant,
    getSheetsByDate,
    getSalesBySheet
};
