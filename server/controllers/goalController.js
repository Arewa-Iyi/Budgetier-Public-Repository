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

// Display the addGoal page.
exports.addGoal = async(req, res)=>{   
   if(!(req.session.athenticated)){
      res.redirect('/login');
   }
   const userID = req.session.user.userID;
    const locals = {
        title : 'Add Goal',
        description : 'Budgetier Add Goal Form',
        file : './dashboard/add/addGoal.ejs',
        board : "goal",        
        user : await findUser(userID),
        info : {
           name : 'Add Goal',
           page : "Goal"
        }
     }
     res.render('main', locals);
}

// Handle post request to add a goal object
exports.addGoalPost = async(req, res)=>{
    if(!(req.session.athenticated)){
      res.redirect('/login');
   }
   const userID = req.session.user.userID;
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
      
    }
    const {name, saved, target, date, category, description} = req.body;
    const validSaved = /^\d*(\.\d+)?([eE]\d+)?$/.test(saved);
    const validTarget = /^\d*(\.\d+)?([eE]\d+)?$/.test(target);
    if(!(validSaved && validTarget)){
       locals.info.error = "Please enter a positive number."
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
    locals.user = await findUser(userID);    
    locals.goals = await getGoalList(userID,1,10);  
    res.render('main', locals);
}

// Display the viewGoal page populated with passed param.id object.
exports.viewGoal = async(req, res) => {
    if(!(req.session.athenticated)){
      res.redirect('/login');
   }
   try{ 
      const userID = req.session.user.userID;
      if(req.params.id){
     
         const user = await findUser(userID);
         const goal = await getGoal(userID,req.params.id);
         
         const locals = {
            title : 'View Goal',
            description : 'Budgetier View Goal',
            file : './dashboard/view/viewGoal.ejs',
            messages : "",
            board : "goal",
            user : user,
            info : {
               name : 'View Goal',          
               page : 'Goal',
               error : "",
            },
            goal : goal,
         }
         res.render('main', locals);
      
      }
   }catch(error){
         console.log(error);
   }
}

// Display editGoal page populated with passed params.id object
exports.editGoal = async(req, res) => {
    if(!(req.session.athenticated)){
      res.redirect('/login');
   }
   const userID = req.session.user.userID;
   console.log(req.params.id);

   if(req.params.id){
      try{
         const budget = await getGoal(userID,req.params.id);
         console.log(budget.updatedAt);
         const locals = {
            title : 'Edit Goal',
            description : 'Budgetier Edit Goal',
            file : './dashboard/edit/editGoal.ejs',
            messages : "",
            board : "goal",
            user : await findUser(userID),
            info : {
               name : `Edit Goal`,          
               page : 'Goal',
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
exports.editGoalPost = async(req, res) =>{
    if(!(req.session.athenticated)){
      res.redirect('/login');
   }
   const userID = req.session.user.userID;
   const goalID = req.params.id || locals.goalID;
   
   try{
      const goal = await getGoal(userID, goalID); 
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
         
      }
      
      if(!goal){            
         locals.file = './dashboard/goal.ejs'
         locals.messages = ["Goal not found."];
      }
      else{         
         var {name, saved, target, category, description} = req.body; 
         const validSaved = /^\d*(\.\d+)?([eE]\d+)?$/.test(saved);
         const validTarget = /^\d*(\.\d+)?([eE]\d+)?$/.test(target);
         if(!(validSaved && validTarget)){
            locals.info.error = "Please enter a positive number."
         }        
         else{
            name = name ? name : goal.name;
            target = target ? target : goal.targetAmount;
            saved = saved ? saved : goal.savedAmount;
            category = category ? category : goal.categoryID;
            description = description ? description : goal.description;
            console.log(name, target, saved, category, description);
            const result = await updateGoal(userID, goalID, name, target, 
                                 saved, category, description);
            console.log(result);
            if(result){
               locals.messages = [`${result.name} Goal updated.`];               
            }  else{
               locals.messages = [`Operation failed. ${result.name} Goal not updated.`];           
            }                             
            locals.file = './dashboard/goal.ejs'        
         }
      } 
      
   locals.user = await findUser(userID)   
   locals.goals = await getGoalList(userID,1,10);
   res.render('main', locals);   
   }catch(error){
      console.log(error);
   }
}

// Handle post request to delete passed params.id object
exports.deleteGoal = async(req, res)=>{
   if(!(req.session.athenticated)){
      res.redirect('/login');
   }
   try{
      const goalID = req.params.id;   
      const userID = req.session.user.userID;
      const locals = {
         title : 'Goals Dashboard',
         description : 'Free NodeJS User Management Syestem',
         file : './dashboard/goal.ejs',
         messages : [],      
         board : "goal",         
         
      }

      const goal = await removeGoal(userID, goalID);
      if(!goal){
         locals.messages = ["Operation failed. Goal not removed."]
      }else{
         locals.messages = [`${goal.name} Goal removed.`]
      }
      
      locals.user = await findUser(userID);
      locals.goals = await getGoalList(userID,1,10); 
      res.render('main',locals);
   }catch(error){
      console.log(error);
   }

}