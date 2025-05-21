/**
 * Name : Arewa (Morountudun) Ojelade
 * Date : 3/4/2025
 * File Name: Session.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Budgetier Post Capstone Future Improvements 
 * Description : The purpose of the Session.js file is to build
 * and export the schema for the Section collection in the 
 * Budgetier Accounts database. 
 */
const mongoose = require("mongoose");
const { Schema,SchemaTypes, model} = mongoose;

const sessionSchema = new Schema({
  userID: { type: String, required: true},
  authenticated: {type: SchemaTypes.Boolean, required : true, default : false},
  duration: {
    type: Date,
    default: () => new Date(Date.now() + 15 * 60 * 1000), // default 15 minutes
  },
  hostname: { type: String, unique: true, required: true},
  ip: { type: String},
  messages: [{ type: String }],
  transactionList: [{ type: SchemaTypes.Mixed }],
  budgetList: [{ type: SchemaTypes.Mixed }],
  goalList: [{ type: SchemaTypes.Mixed }],
  
  transactionRag: [{ type: SchemaTypes.Mixed }],
  budgetRag: [{ type: SchemaTypes.Mixed }],
  goalRag: [{ type: SchemaTypes.Mixed }],
  version: {type: SchemaTypes.Int32, default: 3},
}, { collection: 'Session', timestamps: true });
const User = model('Session', sessionSchema);
module.exports = User;