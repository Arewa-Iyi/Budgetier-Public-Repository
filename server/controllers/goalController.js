 /**
 * Name : Arewa (Morountudun) Ojelade
 * Date : 3/4/2025
 * File Name: goalController.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Budgetier Capstone Project
 * Description : The purpose of the goalController.js file is to 
 * execute appropriate logic in accordance with requests for the 
 * Goal web framework of the Budgetier application.
 */
const {addGoal, removeGoal, updateGoal, getGoal, getGoalList} = require('../../db/goal.js');
const {findUser} = require('../../db/user.js');
const {findSession, logActivity, updateMessages} = require('../../db/session.js');
const os = require('os');
const hostname = os.hostname();
// Display the addGoal page.
exports.addGoal = async(req, res)=>{   
   try{
      var session = await findSession(hostname);

      if(!(session.authenticated)){
         res.redirect('/login');
      }
   
      const userID = session.userID;
      const user = await findUser(userID);
      await logActivity(hostname);   
      const locals = {
        title : 'Add Goal',
        description : 'Budgetier Add Goal Form',
        file : './dashboard/add/addGoal.ejs',
        board : "goal",        
        user,
        info : {
           name : 'Add Goal',
           page : "Goal"
        }
     }
     res.render('main', locals);
   }catch(error){
      console.log(error);      
      await updateMessages(hostname, [`Error Encountered. Goal not added.`]);
      res.redirect('/goals');
   }
}

// Handle post request to add a goal object
exports.addGoalPost = async(req, res)=>{
   try{
      var session = await findSession(hostname);

      if(!(session.authenticated)){
         res.redirect('/login');
      }
   
      const userID = session.userID;
      const user = await findUser(userID);
      await logActivity(hostname);   
      const locals = {
         title : 'Add Goal',
         description : 'Budgetier Add Goal',
         file : './dashboard/add/addGoal.ejs',
         messages : "",
         board : "goal",
         info : {
            name : 'Add Goal',
            page : "Goal",
            error : "",
         }, 
         user    
         
      }
      const {name, saved, target, date, category, description} = req.body;
      const validSaved = /^\d*(\.\d+)?([eE]\d+)?$/.test(saved);
      const validTarget = /^\d*(\.\d+)?([eE]\d+)?$/.test(target);
      if(!(validSaved && validTarget)){
         locals.info.error = "Please enter a positive number.";
      }
      else{
         const result = await addGoal(userID, name, target, saved,
                                       description, date, category);
         console.log(result);
         if(result){
            locals.messages = [`' ${name} ' Goal added.`];
         }  else{
            locals.messages = [`Operation failed. ' ${name} ' Goal not added.`];
         
         }                            
         locals.file = './dashboard/Goal.ejs'       
      }  
      locals.goals = await getGoalList(userID,1,10);  
      res.render('main', locals);
     }catch(error){
      console.log(error);      
      await updateMessages(hostname, [`Error Encountered. Goal not added.`]);
      res.redirect('/goals');
   }
}

// Display the viewGoal page populated with passed param.id object.
exports.viewGoal = async(req, res) => {
   try{
      var session = await findSession(hostname);

      if(!(session.authenticated)){
         res.redirect('/login');
      }
   
      const userID = session.userID;
      const user = await findUser(userID);
      await logActivity(hostname); 
      const goalID = req.params.id;
      const goal = await getGoal(userID,goalID);
      if(goal){
         
         const locals = {
            title : 'View Goal',
            description : 'Budgetier View Goal',
            file : './dashboard/view/viewGoal.ejs',
            messages : "",
            board : "goal",
            user,
            info : {
               name : 'View Goal',          
               page : 'Goal',
               error : "",
            },
            goal : goal,
         }
         res.render('main', locals);
      
      }
      else{
         await updateMessages(hostname, [`Goal ID ${goalID} not found.`]);
         res.redirect('/goals')
      }
   }catch(error){
      console.log(error);      
         await updateMessages(hostname, [`Error Encountered. Goal ID not found.`]);
         res.redirect('/goals');
   }
}

// Display editGoal page populated with passed params.id object
exports.editGoal = async(req, res) => {
   try{
      var session = await findSession(hostname);

      if(!(session.authenticated)){
         res.redirect('/login');
      }
   
      const userID = session.userID;
      const user = await findUser(userID);

      await logActivity(hostname);   

      const goalID = req.params.id;
      const goal = await getGoal(userID,goalID);
      if(goal){
         const locals = {
            title : 'Edit Goal',
            description : 'Budgetier Edit Goal',
            file : './dashboard/edit/editGoal.ejs',
            messages : "",
            board : "goal",
            user,
            info : {
               name : `Edit Goal`,          
               page : 'Goal',
               error : "",
            },
            params : goalID,
            element : goal,
            
         }
         res.render('main', locals);
      }
     else{
         await updateMessages(hostname, [`Goal ID ${goalID} not found.`]);
         res.redirect('/goals')
      }
   }catch(error){
      console.log(error);      
         await updateMessages(hostname, [`Error Encountered. Goal ID not updated.`]);
         res.redirect('/goals');
   }
   
}

// Handle post request to edit passed params.id object
exports.editGoalPost = async(req, res) =>{
   try{
      var session = await findSession(hostname);

      if(!(session.authenticated)){
         res.redirect('/login');
      }
   
      const userID = session.userID;
      const user = await findUser(userID);

      await logActivity(hostname);   

      const goalID = req.params.id;
      const goal = await getGoal(userID,goalID);

      if(goal){
         const locals = {
            title : 'Edit Goal',
            description : 'Budgetier Edit Goal Form',
            file : './dashboard/edit/editGoal.ejs',
            messages : [],
            board : "goal",
            info : {
               name : 'Edit Goal',          
               page : 'Goal',
               error : "",
            },
            params : goalID,
            user,
            
         }
        
         var {name, saved, date, target, category, description} = req.body; 
         const validSaved = /^\d*(\.\d+)?([eE]\d+)?$/.test(saved);
         const validTarget = /^\d*(\.\d+)?([eE]\d+)?$/.test(target);
         if(!(validSaved && validTarget)){
            locals.info.error = "Please enter a positive number."
         }        
         else{
            name = name ? name : goal.name;
            target = target ? target : goal.targetAmount;
            saved = saved ? saved : goal.savedAmount;
            date = (!isNaN(Date.parse(date))) ? date : goal.savedToDate;
            category = category ? category : goal.categoryID;
            description = description ? description : goal.description;
            console.log(name, target, saved, category, description);
            const result = await updateGoal(userID, goalID, name, target, 
                                 saved, date, category, description);
            console.log(result);
            if(result){
               locals.messages = [`${result.name} Goal updated.`];               
            }  else{
               locals.messages = [`Operation failed. ${result.name} Goal not updated.`];           
            }                             
            locals.file = './dashboard/goal.ejs'      
         }
         locals.goals = await getGoalList(userID,1,10);
         res.render('main', locals);   
      } 
      else{
         await updateMessages(hostname, [`Goal ID ${goalID} not found.`]);
         res.redirect('/goals')
      }
   }catch(error){
      console.log(error);      
         await updateMessages(hostname, [`Error Encountered. Goal ID not found.`]);
         res.redirect('/goals');
   }
}

// Handle post request to delete passed params.id object
exports.deleteGoal = async(req, res)=>{
   try{
      var session = await findSession(hostname);

      if(!(session.authenticated)){
         res.redirect('/login');
      }
   
      const userID = session.userID;
      const user = await findUser(userID);
       
      const goalID = req.params.id;  
      const goal = await removeGoal(userID, goalID);
      await logActivity(hostname); 
      if(goal){
         const locals = {
            title : 'Goals Dashboard',
            description : 'Free NodeJS User Management Syestem',
            file : './dashboard/goal.ejs',
            messages : [`${goal.name} Goal removed.`],      
            board : "goal",     
            user,
            goals : await getGoalList(userID,1,10)
            
         }
         res.render('main',locals);
      }
      else{
         await updateMessages(hostname, [`Operation failed. Goal ${goalID} not found.`]);
         res.redirect('/goals')
      }
   }catch(error){
      console.log(error);      
      await updateMessages(hostname, [`Error Encountered. Goal not removed.`]);
      res.redirect('/goals');
   }

}