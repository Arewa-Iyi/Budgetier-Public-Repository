/**
 * Name : Arewa (Morountudun) Ojelade
 * Date : 3/4/2025
 * File Name: Category.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Budgetier Capstone Project
 * Description : The purpose of the Category.js file is to build
 * and export the schema for the Category collection in the 
 * Budgetier Accounts database.
 */
const mongoose = require("mongoose");
const { Schema, SchemaTypes, model } = mongoose;
const categorySchema = new Schema({
  categoryID: {type: SchemaTypes.Int32, required: true, unique: true},
  name: {type: String, required: true, trim: true, minlength: 1, maxlength: 50},
  icon: String,
  color: String,
  description: String,
  version: {type: SchemaTypes.Int32, default: 3},
}, { collection : 'Category',timestamps: true });

const Category = model('Category', categorySchema);
module.exports = Category;
