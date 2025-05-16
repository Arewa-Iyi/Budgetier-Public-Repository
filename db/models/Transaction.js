/**
 * Name : Arewa (Morountudun) Ojelade
 * Date : 3/4/2025
 * File Name: Transaction.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Budgetier Capstone Project
 * Description : The purpose of the Transaction.js file is to build
 * and export the schema for the Transaction collection in the 
 * Budgetier Accounts database..
 */
const mongoose = require("mongoose");
const { Schema, SchemaTypes, model } = mongoose;

const transactionSchema = new Schema({
  userID: { type: SchemaTypes.ObjectId, ref: 'User', required: true },
  amount: { type: SchemaTypes.Double, required: true },
  type: { type: SchemaTypes.Int32, required: true },
  date: { type: SchemaTypes.Date, default: Date.now },
  categoryID: { type: SchemaTypes.Int32, default : 0},
  category : {type: SchemaTypes.String, default : "All"},
  description: { type: String },
  version: {type: SchemaTypes.Int32, default : 3}
}, { collection : 'Transaction', timestamps: true });
transactionSchema.index({updatedAt : -1});

const Transaction = model('Transaction', transactionSchema);
module.exports = Transaction;