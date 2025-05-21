 /**
 * Name : Arewa (Morountudun) Ojelade
 * Date : 3/4/2025
 * File Name: transactionController.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Budgetier Capstone Project
 * Description : The purpose of the transactionController.js file is to 
 * execute appropriate logic in accordance with requests for the 
 * Transaction web framework of the Budgetier application.
 */
const {addTransaction, getTransaction, getTransactionList,
      updateTransaction, removeTransaction} = require('../../db/transaction.js');
const { findUser } = require('../../db/user.js');
const {findSession, logActivity, updateMessages} = require('../../db/session.js');
const os = require('os');
const hostname = os.hostname();
// Display the addIncome page.
exports.addIncome = async(req, res)=>{
   try{
      var session = await findSession(hostname);

      if(!(session.authenticated)){
         res.redirect('/login');
      }
   
      const userID = session.userID;
      const user = await findUser(userID);
      await logActivity(hostname);
      const locals = {
         title : 'Add Income Transaction',
         description : 'Budgetier Add Income Transaction Form',
         file : './dashboard/add/addIncome.ejs',      
         board : "transaction",
         user,
         info : {
            name : 'Add Income',
            page : 'Transaction'
         },
      }
      res.render('main', locals)
   }catch(error){
      console.log(error);      
      await updateMessages(hostname, [`Error Encountered. Income Transaction not added.`]);
      res.redirect('/transactions');
   }
}

// Handle post request to add income transaction object 
exports.addIncomePost = async(req, res)=>{
   try{
      var session = await findSession(hostname);

      if(!(session.authenticated)){
         res.redirect('/login');
      }
   
      const userID = session.userID;
      const user = await findUser(userID);
      await logActivity(hostname);
      const locals = {
         title : 'Add Income Transaction',
         description : 'Budgetier Add Income Transaction',
         file : './dashboard/add/addIncome.ejs',
         messages : "",
         board : "transaction",
         info : {
            name : 'Add Income',
            page : 'Transaction',
            error : "",
         },
         user
         
      }
      const {amount, date, category, description} = req.body;
      console.log(req.body)
      const validAmount = /^\d*(\.\d+)?([eE]\d+)?$/.test(amount);
      if(!validAmount){
         locals.info.error = "Please enter a positive number."
      }
      else{
         const result = await addTransaction(userID, amount, 1, category,
                                          description, date);
                                          console.log(result);
         
         if(result){
         locals.messages = ["Income Transaction added."];
         }  else{
         locals.messages = ["Operation failed. Income Transaction not added."];
         }   
                                    
         locals.file = './dashboard/transaction.ejs'
         
      }
      locals.transactions = await getTransactionList(userID,1,10);
      res.render('main', locals);
   }catch(error){
      console.log(error);      
      await updateMessages(hostname, [`Error Encountered. Income Transaction not added.`]);
      res.redirect('/transactions');
   }
}

// Display the addExpense page.
exports.addExpense = async(req, res)=>{
   try{
      var session = await findSession(hostname);

      if(!(session.authenticated)){
         res.redirect('/login');
      }
   
      const userID = session.userID;
      const user = await findUser(userID);
      await logActivity(hostname);
      const locals = {
         title : 'Add Expense Transaction',
         description : 'Budgetier Add Expense Transaction Form',
         file : './dashboard/add/addExpense.ejs', 
         board : "transaction",
         info : {
            name : 'Add Expense',          
            page : 'Transaction'
         },
         user
      }
      res.render('main', locals);
   }catch(error){
      console.log(error);      
      await updateMessages(hostname, [`Error Encountered. Expense Transaction not added.`]);
      res.redirect('/transactions');
   }
}

// Handle post request to add an expense transaction object
exports.addExpensePost = async(req, res)=>{
   try{
      var session = await findSession(hostname);

      if(!(session.authenticated)){
         res.redirect('/login');
      }
   
      const userID = session.userID;
      const user = await findUser(userID);
      await logActivity(hostname);
      const locals = {
         title : 'Add Expense Transaction',
         description : 'Budgetier Add Expense Transaction Form',
         file : './dashboard/add/Expense.ejs',
         messages : "",
         board : "transaction",
         info : {
            name : 'Add Expense',          
            page : 'Transaction',
            error : "",
         },
         user
      }
      const {amount, date, category, description} = req.body;
      console.log(req.body)
      const validAmount = /^\d*(\.\d+)?([eE]\d+)?$/.test(amount);
      if(!validAmount){
         locals.info.error = "Please enter a positive number."
      }
      else{
      const result = await addTransaction(userID, amount, 0, category,
                                          description, date);
                                          console.log(result);
         if(result){
            locals.messages = ["Expense Transaction added."];
         }  else{
            locals.messages = ["Operation failed. Expense Transaction not added."];
         
         }                              
         locals.file = './dashboard/transaction.ejs'
         
      }    
      locals.transactions = await getTransactionList(userID,1,10);
      res.render('main', locals);
   }catch(error){
      console.log(error);      
      await updateMessages(hostname, [`Error Encountered. Expense Transaction not added.`]);
      res.redirect('/transactions');
   }
}

// Display the viewTransaction page populated with passed param.id object.
exports.viewTransaction = async(req, res) => {
   try{
      var session = await findSession(hostname);

      if(!(session.authenticated)){
         res.redirect('/login');
      }
   
      const userID = session.userID;
      const user = await findUser(userID);
      const transactionID = req.params.id;
      const transaction = await getTransaction(userID,transactionID);
      if(transaction){
         const locals = {
            title : 'View Transaction',
            description : 'Budgetier View Transaction',
            file : './dashboard/view/viewTransaction.ejs',
            messages : "",
            board : "transaction",
            user,
            info : {
               name : 'View Transaction',          
               page : 'Transaction',
               error : "",
            },
            transaction : transaction,
         
         }
         res.render('main', locals);
      }
      else{
         await updateMessages(hostname, [`Operation failed. Transaction ${transactionID} not found.`]);
         res.redirect('/transactions')
      }
   }catch(error){ 
      console.log(error);      
      await updateMessages(hostname, [`Error Encountered. Transaction not found.`]);
      res.redirect('/transactions');
   }
   
}

// Display editTransaction page populated with passed params.id object
exports.editTransaction = async(req, res) => {
   try{
      var session = await findSession(hostname);

      if(!(session.authenticated)){
         res.redirect('/login');
      }
   
      const userID = session.userID;
      const user = await findUser(userID);
      const transactionID = req.params.id;
      const transaction = await getTransaction(userID,transactionID);
      await logActivity(hostname);
      if(transaction){
         const locals = {
            title : 'Edit Transaction',
            description : 'Budgetier Edit Transaction',
            file : './dashboard/edit/editTransaction.ejs',
            messages : "",
            board : "transaction",
            user,
            info : {
               name : `Edit Transaction`,          
               page : 'Transaction',
               error : "",
            },
            element : transaction,
         }
         res.render('main', locals);
      }
      else{
         await updateMessages(hostname, [`Operation failed. Transaction ${transactionID} not found.`]);
         res.redirect('/transactions')
      }
   }catch(error){ 
      console.log(error);      
      await updateMessages(hostname, [`Error Encountered. Transaction not updated.`]);
      res.redirect('/transactions');
   }
}

// Handle post request to edit passed params.id object
exports.editTransactionPost = async(req, res) =>{
      try{
      var session = await findSession(hostname);

      if(!(session.authenticated)){
         res.redirect('/login');
      }
   
      const userID = session.userID;
      const user = await findUser(userID);
      await logActivity(hostname);
      const transactionID = req.params.id || locals.transactionID;
      const transaction = await getTransaction(userID, transactionID);
      const locals = {
         title : 'Edit Transaction',
         description : 'Budgetier Edit Transaction Form',
         file : './dashboard/edit/editTransaction.ejs',
         messages : [],
         board : "transaction",
         info : {
            name : 'Edit Transaction',          
            page : 'Transaction',
            error : "",
         },
         params : transactionID,
         user
      }
      
      if (transaction){         
         var {amount, type, date, category, description} = req.body; 
         if(amount && !(/^\d*(\.\d+)?([eE]\d+)?$/.test(amount))){           
            locals.info.error = "Please enter a positive number."
         }          
         else {
            amount = amount ? amount : transaction.amount;
            type = type ? type : transaction.type;
            date = date ? new Date(date) : transaction.date;
            category = category ? category : transaction.categoryID;
            description = description ? description : transaction.description;
            console.log(amount, date, category, description);
            const result = await updateTransaction(userID, transactionID, amount, 
                                  type, category,description, date);
            console.log(result);
            if(result){
               locals.messages = [`Transaction ${transaction._id} updated.`];
            }else{
               locals.messages = [`Operation failed. Transaction ${transaction._id} not updated.`];          
            }                                         
            locals.file = './dashboard/transaction.ejs'        
         }
         locals.transactions = await getTransactionList(userID,1,10); 
         res.render('main', locals);   
      } 
      else{
         await updateMessages(hostname, [`Operation failed. Transaction ${transactionID} not found.`]);
         res.redirect('/transactions')
      }
  
   }catch(error){ 
      console.log(error);      
      await updateMessages(hostname, [`Error Encountered. Transaction not updated.`]);
      res.redirect('/transactions');
   }
}

// Handle post request to delete passed params.id object
exports.deleteTransaction = async(req, res)=>{
   try{
      var session = await findSession(hostname);

      if(!(session.authenticated)){
         res.redirect('/login');
      }
   
      const userID = session.userID;
      const user = await findUser(userID);
      await logActivity(hostname);   

      const transactionID = req.params.id;    
      const transaction = await removeTransaction(userID, transactionID);
      if(transaction){
         const locals = {
            title : 'Transactions Dashboard',
            description : 'Free NodeJS User Management Syestem',
            file : './dashboard/transaction.ejs',
            messages :  [`Transaction ${transaction._id} removed.`],      
            board : "transaction",         
            user, 
            transactions : await getTransactionList(userID,1,10)
         }
         res.render('main',locals);
      }
      else{
         await updateMessages(hostname, [`Operation failed. Transaction ${transactionID} not found.`]);
         res.redirect('/transactions')
      }
   }catch(error){
      console.log(error);      
      await updateMessages(hostname, [`Error Encountered. Transaction not removed.`]);
      res.redirect('/transactions');
   }
}