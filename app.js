/**
 * Name : Arewa (Morountudun) Ojelade
 * Date : 2/18/2025
 * File Name : app.js
 * Course : CMSC 495 Capstone in Computer Science
 * Description : This is the main file for the Budgetier
 * application. It is responsible for creating the application,
 * authenticating database connection, generating secure routes,
 * and authenticating user sessions.
 * 
 * Update 5/21/2025 
 * Removed express session handling.
 * Restructured with internal database Session handling.
 */


const express = require('express');

const app = express();

const flash = require('connect-flash');
// add static path to js folder
app.use(express.static('public/js')); 

// add static path to css folder
app.use(express.static('public/css'));

// add static path to image folder
app.use(express.static('public/img'));

// add static path to views folder
app.use(express.static('views'));   

// add static path to views folder
app.use(express.static('db')); 

const connectDB = require('./public/js/configure.js');  connectDB();

require('dotenv').config();

app.use(flash());

// Returns middleware that only parses urlencoded bodies
app.use(express.urlencoded({extended : true}));

// Return middleware that only parses json 
app.use(express.json());

// use EJS as view engine
app.set('view engine', 'ejs');

app.use('/', require('./server/routes/routes.js'));

// Redirects to 404 if pagination is not requested
app.get("*", (req, res)=>{
    locals = {
        title :"404",
        description : "Page not found",
        file : './404.ejs'
    }
    var {page,board} = req.query;

    // Redirect to transactions dashboard with requested page
    if(board == "transactions"){
        res.redirect(`/transactions/?page=${page}`)
    }
    
    // Redirect to budgets dashboard with requested page
    if(board == "budgets"){
        res.redirect(`/budgets/?page=${page}`)
    }
    
    // Redirect to goals dashboard with requested page
    if(board == "goals"){
        res.redirect(`/goals/?page=${page}`)
    }
    
    // Redirect to searchDispy with requested page
    if(board == "search"){
        var {t_page, b_page, g_page} = req.query;
            res.redirect(`/searchDisplay/?t_page=${t_page}?b_page=${b_page}?g_page=${g_page}`)
        }
    
    res.status(404).render('main.ejs',);
});

// Listen on port 5000
const port = 5000;
app.listen(port, () =>{
    console.log(`Server running on Port : ${port}`);
});
