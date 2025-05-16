/**
 * Name : Arewa (Morountudun) Ojelade
 * Date : 3/4/2025
 * File Name: Budget.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Budgetier Capstone Project
 * Description : The purpose of the Goal.js file is to build
 * and export the schema for the Goal collection in the 
 * Budgetier Accounts database.
 */
const mongoose = require("mongoose");
const { Schema, SchemaTypes, model } = mongoose;

const goalSchema = new Schema({
  userID: { type: SchemaTypes.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  targetAmount: { type: SchemaTypes.Double, required: true },
  savedAmount: { type: SchemaTypes.Double, default: 0 },
  savedToDate: { type: Date, 
    default: ()=> new Date(Date.now() + 30 * 24 * 3600 * 1000), // default month duration
  }, 
  description: { type: String },
  categoryID: { type: SchemaTypes.Int32, default : 0},
  category : {type: SchemaTypes.String, default : "All"},
  version : {type : SchemaTypes.Int32, default : 3}
}, { collection : 'Goal', timestamps: true });
goalSchema.index({updatedAt : -1});
const Goal = model('Goal', goalSchema);
module.exports = Goal;