 /**
 * Name : Arewa (Morountudun) Ojelade
 * Date : 3/4/2025
 * File Name: budgetController.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Budgetier Capstone Project
 * Description : The purpose of the budgetController.js file is to 
 * execute appropriate logic in accordance with requests for the 
 * Budget web framework of the Budgetier application.
 */
const {addBudget, removeBudget, updateBudget, getBudget, getBudgetList} = require('../../db/budget.js');
const {findUser} = require('../../db/user.js');
const {findSession, logActivity, updateMessages} = require('../../db/session.js');
const os = require('os');
const hostname = os.hostname();
// Display the addBudget page.
exports.addBudget = async(req, res)=>{
   try{
      var session = await findSession(hostname);

      if(!(session.authenticated)){
         res.redirect('/login');
      }
      
      await logActivity(hostname);
      const locals = {
         title : 'Add Budget',
         description : 'Budgetier Add Budget Form',
         file : './dashboard/add/addBudget.ejs',
         info : {
            name : 'Add Budget',
            page : "Budget"
         }
      }
      res.render('main', locals);
   }catch(error){
      console.log(error);      
      await updateMessages(hostname, [`Error Encountered. Budget not added.`]);
      res.redirect('/budgets');
   }
}

// Handle post request to add a budget object
exports.addBudgetPost = async(req, res)=>{
   try{
      var session = await findSession(hostname);

      if(!(session.authenticated)){
         res.redirect('/login');
      }
   
      const userID = session.userID;
      const user = await findUser(userID);
      
      await logActivity(hostname);
      console.log("Adding Budget");
      const locals = {
         title : 'Add Budget',
         description : 'Budgetier Add Budget',
         file : './dashboard/add/addBudget.ejs',
         messages : "",
         info : {
            name : 'Add Budget',
            page : "Budget",
            error : "",
         },
         user
      }
      const {name,amount, category, description} = req.body;
      console.log(req.body)
      const validAmount = /^\d*(\.\d+)?([eE]\d+)?$/.test(amount);
      if(!validAmount || parseFloat(validAmount) <= 0){
         locals.info.error = "Please enter a positive number."
      }
      else{
         const result = await addBudget(userID, name, amount, category,
                                          description);
         console.log(result);
         if(result){

            locals.messages = [`'${name}'Budget added.`];
         }  else{
            locals.messages = [`Operation failed. '${name}' Budget not added.`];
         
         }                              
         locals.file = './dashboard/Budget.ejs';
      }
      locals.budgets = await getBudgetList(userID,1,10);
      res.render('main', locals);
   }catch(error){
      console.log(error);      
      await updateMessages(hostname, [`Error Encountered. Budget not added.`]);
      res.redirect('/budgets');
   }
}

// Display the viewBudget page populated with passed param.id object.
exports.viewBudget = async(req, res) => {
   try{
      var session = await findSession(hostname);

      if(!(session.authenticated)){
         res.redirect('/login');
      }
   
      const userID = session.userID;
      const user = await findUser(userID);
      
      const budgetID = req.params.id;
      const budget = await getBudget(userID, budgetID);

      await logActivity(hostname);
      if(budget){
         const locals = {
            title : 'View Budget',
            description : 'Budgetier View Budget',
            file : './dashboard/view/viewBudget.ejs',
            messages : [],
            board : "budget",
            user,
            info : {
               name : 'View Budget',          
               page : 'Budget',
               error : "",
            },
            budget : budget,
            
         }
         res.render('main', locals);
      }
      else{         
         await updateMessages(hostname, [`Operation failed. Budget ${budgetID} not found.`]);
         res.redirect('/budgets')
      }
   }catch(error){
      console.log(error);      
      await updateMessages(hostname, [`Error Encountered. Budget ${budgetID} not found.`]);
      res.redirect('/budgets');
   }
   
}

// Display editBudget page populated with passed params.id object
exports.editBudget = async(req, res) => {
   try{
      var session = await findSession(hostname);

      if(!(session.authenticated)){
         res.redirect('/login');
      }
   
      const userID = session.userID;
      const user = await findUser(userID);

      const budgetID = req.params.id;
      const budget = await getBudget(userID,req.params.id);

      await logActivity(hostname);   

      if(budget){
         const locals = {
            title : 'Edit Budget',
            description : 'Budgetier Edit Budget',
            file : './dashboard/edit/editBudget.ejs',
            messages : "",
            board : "budget",
            user,
            info : {
               name : `Edit Budget`,          
               page : 'Budget',
               error : "",
            },
            element : budget,
            
         }
         res.render('main', locals);
      }
          else{         
         await updateMessages(hostname, [`Operation failed. Budget ${budgetID} not found.`]);
         res.redirect('/budgets')
      }
   }catch(error){
      console.log(error);      
      await updateMessages(hostname, [`Error Encountered. Budget ${budgetID} not edited.`]);
      res.redirect('/budgets');
   }
   
}
// Handle post request to edit passed params.id object
exports.editBudgetPost = async(req, res) =>{
   try{
      var session = await findSession(hostname);

      if(!(session.authenticated)){
         res.redirect('/login');
      }
   
      const userID = session.userID;
      const user = await findUser(userID);
      await logActivity(hostname);   
      const budgetID = req.params.id || locals.budgetID;
      const budget = await getBudget(userID, budgetID);
      if(budget){
         const locals = {
            title : 'Edit Budget',
            description : 'Budgetier Edit Budget Form',
            file : './dashboard/edit/editBudget.ejs',
            messages : [],
            board : "budget",
            info : {
               name : 'Edit Budget',          
               page : 'Budget',
               error : "",
            },
            params : budgetID,
            user
         }
         
         var {name, amount, category, description} = req.body; 
         if(amount && !(/^\d*(\.\d+)?([eE]\d+)?$/.test(amount))){           
            locals.info.error = "Please enter a positive number.";
         }          
         else{
            name = name ? name : budget.name;
            amount = amount ? amount : budget.amount;
            category = category ? category : budget.categoryID;
            description = description ? description : budget.description;
            console.log(name, amount, category, description);
            const result = await updateBudget(userID, budgetID,name, amount, 
                                 category,description);
            console.log(result);
            if(result){
               locals.messages = [`${result.name} Budget updated.`];               
            }  else{
               locals.messages = [`Operation failed. ${result.name} Budget not updated.`];           
            }                             
            locals.file = './dashboard/budget.ejs'        
         }
   
         locals.budgets = await getBudgetList(userID,1,10);
         res.render('main', locals);   
      }else{         
         await updateMessages(hostname, [`Operation failed. Budget ${budgetID} not found.`]);
         res.redirect('/budgets')
      }
   }catch(error){
      console.log(error);      
      await updateMessages(hostname, [`Error Encountered. Budget ${budgetID} not updated.`]);
      res.redirect('/budgets');
   }
   
}

// Handle post request to delete passed params.id object
exports.deleteBudget = async(req, res)=>{
   try{
      var session = await findSession(hostname);

      if(!(session.authenticated)){
         res.redirect('/login');
      }
   
      const userID = session.userID;
      const user = await findUser(userID);
      await logActivity(hostname);   
      const budgetID = req.params.id;   
      const budget = await removeBudget(userID, budgetID);
      if(budget){
         const locals = {
            title : 'Budgets Dashboard',
            description : 'Free NodeJS User Management Syestem',
            file : './dashboard/budget.ejs',
            messages : [`${budget.name} Budget removed.`],      
            board : "budget",   
            user,
            budgets : await getBudgetList(userID,1,10)
            
         }
         res.render('main',locals);
      }
      else{         
         await updateMessages(hostname, [`Operation failed. Budget ${budgetID} not found.`]);
         res.redirect('/budgets')
      }
   }catch(error){
      console.log(error);      
      await updateMessages(hostname, [`Error Encountered. Budget ${budgetID} not removed.`]);
      res.redirect('/budgets');
   }
   

}