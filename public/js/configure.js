/**
 * Name : Arewa (Morountudun) Ojelade
 * Date : 3/4/2025
 * File Name: configure.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Budgetier Capstone Project
 * Description : The purpose of the configure.js file is to provide 
 * connection to the Budgetier Accounts database via mongoose. An error is 
 * caught and logged if connection fails. 
 */
const mongoose = require("mongoose");
mongoose.set('strictQuery', false)
require('dotenv').config();
const uri = process.env.URI;

 async function connectDB(){
    const connect = mongoose.connect(uri);
    connect.then(() =>{
        console.log("Database connected successfully!");
        return(mongoose.connection);
    })
    .catch((error) => {
        console.log(error)
        console.log("Database cannot be connected.");
    })
    
}

module.exports = connectDB;