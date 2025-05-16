/**
 * Name : Arewa (Morountudun) Ojelade
 * Date : 3/4/2025
 * File Name: transaction.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Budgetier Capstone Project
 * Description : The purpose of the dbconnet.js file is to provide 
 * connection to the Budgetier Accounts database. An error is 
 * caught and logged if connection fails. 
 */
const mongoose = require("mongoose");
require('dotenv').config();
const uri = process.env.URI;

const connectDB = async ()=>{
  mongoose.connect(uri).then(() =>{
          console.log("Database connected successfully!");
          return(mongoose.connection);
      })
      .catch(() => {
          console.log("Database cannot be connected.");
  })
};
connectDB();
module.exports = connectDB;