/**
 * Name : Arewa (Morountudun) Ojelade
 * Date : 3/4/2025
 * File Name: User.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Budgetier Capstone Project
 * Description : The purpose of the User.js file is to build
 * and export the schema for the User collection in the 
 * Budgetier Accounts database.
 */
const mongoose = require("mongoose");
const { Schema,SchemaTypes, model} = mongoose;

const userSchema = new Schema({
  firstName: { type: String, required: true, trim: true, minlength: 1, maxlength: 30},
  lastName: { type: String, required: true, trim: true, minlength: 1, maxlength: 30},
  entry: { type: String, required: true, trim: true},
  email: { type: String, required: true, lowercase:true, 
          unique: true, trim: true, minlength: 1, maxlength: 30 },
  transactionList: [{ type: SchemaTypes.ObjectId, ref: 'Transaction'}],
  budgetList: [{ type: SchemaTypes.ObjectId, ref: 'Budget' }],
  goalList: [{ type: SchemaTypes.ObjectId, ref: 'Goal' }],
  budgetCategories: [{ type: SchemaTypes.Int32 }],
  totalAmount: { type: SchemaTypes.Double, required: true },
  version: {type: SchemaTypes.Int32, default: 3},
}, { collection: 'User', timestamps: true });
const User = model('User', userSchema);
module.exports = User;