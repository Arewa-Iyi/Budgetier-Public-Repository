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

// Display the addBudget page.
exports.addBudget = async(req, res)=>{
   if(!(req.session.athenticated)){
      res.redirect('/login');
   }
   try{
      const userID = req.session.user.userID;
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
      console.log(error)
      res.redirect('/budgets')
   }
}

// Handle post request to add a budget object
exports.addBudgetPost = async(req, res)=>{
   if(!(req.session.athenticated)){
      res.redirect('/login');
   }
   try{
      const userID = req.session.user.userID;
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
         
      }
      const {name,amount, category, description} = req.body;
      console.log(req.body)
      const validAmount = /^\d*(\.\d+)?([eE]\d+)?$/.test(amount);
      if(!validAmount || parseFloat(validAmount) <= 0){
         locals.info.error = "Please enter a positive number."
      }
      else{
         const result = await addBudget(userID, name, amount, category,
                                          description,);
                                          console.log(result);
         if(result){
            locals.messages = [`'${name}'Budget added.`];
         }  else{
            locals.messages = [`Operation failed. '${name}' Budget not added.`];
         
         }                              
         locals.file = './dashboard/Budget.ejs'
      }
      locals.user = await findUser(userID);
      locals.budgets = await getBudgetList(userID,1,10);
      res.render('main', locals);
   }catch(error){
      console.log(error)
      res.redirect('./budgets')
   }
}

// Display the viewBudget page populated with passed param.id object.
exports.viewBudget = async(req, res) => {
   if(!(req.session.athenticated)){
      res.redirect('/login');
   }
   const userID = req.session.user.userID;
   try{
         const user = await findUser(userID);
         const budget = await getBudget(userID,req.params.id);
          
         const locals = {
            title : 'View Budget',
            description : 'Budgetier View Budget',
            file : './dashboard/view/viewBudget.ejs',
            messages : [],
            board : "budget",
            user : user,
            info : {
               name : 'View Budget',          
               page : 'Budget',
               error : "",
            },
            budget : budget,
            
         }
         res.render('main', locals);
   }catch(error){
      console.log(error);
   }
   
}

// Display editBudget page populated with passed params.id object
exports.editBudget = async(req, res) => {
   if(!(req.session.athenticated)){
      res.redirect('/login');
   }
   const userID = req.session.user.userID;
   console.log(req.params.id);

   if(req.params.id){
      try{
         const budget = await getBudget(userID,req.params.id);
         console.log(budget.updatedAt);
         const locals = {
            title : 'Edit Budget',
            description : 'Budgetier Edit Budget',
            file : './dashboard/edit/editBudget.ejs',
            messages : "",
            board : "budget",
            user : await findUser(userID),
            info : {
               name : `Edit Budget`,          
               page : 'Budget',
               error : "",
            },
            element : budget,
            
         }
         res.render('main', locals);
      }catch(error){
         console.log(error);
      }
   }
}

// Handle post request to edit passed params.id object
exports.editBudgetPost = async(req, res) =>{
   if(!(req.session.athenticated)){
      res.redirect('/login');
   }
      const userID = req.session.user.userID;
      const budgetID = req.params.id || locals.budgetID;
   try{
      const budget = await getBudget(userID, budgetID);
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
         
      }
      
      if(!budget){            
         locals.file = './dashboard/budget.ejs'
         locals.messages = ["Budget not found."];
      }
      else{         
         var {name, amount, category, description} = req.body; 
         if(amount && !(/^\d*(\.\d+)?([eE]\d+)?$/.test(amount))){           
            locals.info.error = "Please enter a positive number."
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
      } 
        
   locals.user = await findUser(userID)   
   locals.budgets = await getBudgetList(userID,1,10);
   res.render('main', locals);   
   }catch(error){
      console.log(error);
   }
}

// Handle post request to delete passed params.id object
exports.deleteBudget = async(req, res)=>{
   if(!(req.session.athenticated)){
      res.redirect('/login');
   }
   
   try{
      const budgetID = req.params.id;   
      const userID = req.session.user.userID;
      const locals = {
         title : 'Budgets Dashboard',
         description : 'Free NodeJS User Management Syestem',
         file : './dashboard/budget.ejs',
         messages : [],      
         board : "budget",         
         
      }

      const budget = await removeBudget(userID, budgetID);
      if(!budget){
         locals.messages = ["Operation failed. Budget not removed."]
      }else{
         locals.messages = [`${budget.name} Budget removed.`]
      }
      
      locals.user = await findUser(userID);
      locals.budgets = await getBudgetList(userID,1,10); 
      res.render('main',locals);
   }catch(error){
      console.log(error);
   }

}