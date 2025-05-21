 /**
 * Name : Arewa (Morountudun) Ojelade
 * Date : 3/4/2025
 * File Name: route.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Budgetier Capstone Project
 * Description : The purpose of the route.js file is to 
 * handle requests for the Budgetier application.
 */
const express = require('express');
const router = express.Router();


const userController = require('../controllers/userController');
const navController = require('../controllers/navController');
const transactionController = require('../controllers/transactionController');
const budgetController = require('../controllers/budgetController');
const goalController = require('../controllers/goalController');

// Get Homepage
router.get('/', navController.home);

// Get User Pages
router.get('/login', navController.login);
router.get('/register', navController.register);
router.get('/logout', navController.logout)

// Post User Forms
router.post('/login', navController.loginPost);
router.post('/register', navController.registerPost);

 
// Get User Dashboard Pages
router.get("/dashboard", userController.dashboard);
//router.get("/export", userController.export);

// Get Transaction Pages
router.get("/transactions", userController.transactions);
router.get("/transactions/*", userController.transactions);
router.get("/viewTransaction/:id", transactionController.viewTransaction);

// Get Transaction Forms
router.get("/addIncome", transactionController.addIncome);
router.get("/addExpense", transactionController.addExpense);
router.get("/editTransaction/:id", transactionController.editTransaction);

// Post Transactiton Forms
router.post("/addIncome", transactionController.addIncomePost);
router.post("/addExpense", transactionController.addExpensePost);
router.post("/editTransaction/:id", transactionController.editTransactionPost);
router.post("/deleteTransaction/:id", transactionController.deleteTransaction);

// Get Budget Pages
router.get("/budgets", userController.budgets);
router.get("/viewBudget/:id", budgetController.viewBudget);

// Get Budget Forms
router.get("/addBudget", budgetController.addBudget);
router.get("/editBudget/:id", budgetController.editBudget);

// Post Budget Forms
router.post("/addBudget", budgetController.addBudgetPost);
router.post("/editBudget/:id", budgetController.editBudgetPost);
router.post("/deleteBudget/:id", budgetController.deleteBudget);

//Get Goal Pages
router.get("/goals", userController.goals);
router.get("/viewGoal/:id", goalController.viewGoal);

// Get Goal Forms
router.get("/addGoal", goalController.addGoal);
router.get("/editGoal/:id", goalController.editGoal);

// Post Goal Forms
router.post("/addGoal", goalController.addGoalPost);
router.post("/editGoal/:id", goalController.editGoalPost);
router.post("/deleteGoal/:id", goalController.deleteGoal);

// Get Profile Pages
router.get("/profile", userController.profile);
router.get('/editProfile', userController.editProfile);
router.get('/editEntry', userController.editEntry);

// Post Search
router.post('/search', userController.search);
router.post('/searchDisplay', userController.searchDisplay);
// Post Profile Forms
router.post('/editProfile', userController.editProfilePost);
router.post('/editEntry', userController.editEntryPost);

module.exports = router;