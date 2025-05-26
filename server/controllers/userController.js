 /**
 * Name : Arewa (Morountudun) Ojelade
 * Date : 3/4/2025
 * File Name: userController.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Budgetier Capstone Project
 * Description : The purpose of the userController.js file is to 
 * execute appropriate logic in accordance with requests for the 
 * main dashboard web framework of the Budgetier application.
 * 
 * Update 5/21/2025
 *    Implemented a combination of RegEx and RAG search using a child 
 *    proccess that runs the rag.py file aggregating the most similar
 *    transactions, budgets and goals to the provided user query using
 *    a manual dot product simmilarty search of the hugging face 
 *    'all-MiniLM-L6-v2' LLM model. 
 */
const {getTransactionList,exportTransctionList,searchTransaction} = require('../../db/transaction.js');
const {getBudgetList,searchBudget} = require('../../db/budget.js');
const {getGoalList,searchGoal} = require('../../db/goal.js');
const {loginUser,findUser,getUser, updateUser, updateEntry} = require('../../db/user.js');
const {validateEmail, validateEntry} = require('../../public/js/validate.js');
const {mkConfig, generateCsv, download} = require('export-to-csv');
const {spawn} = require('child_process');
const {findSession, logActivity, updateMessages, 
       saveSearchResults, clearSearch} = require('../../db/session.js');
const fs = require('fs'); 
const os = require('os');
const hostname = os.hostname();
// Display user main dashboard
exports.dashboard = async(req, res)=>{
   try{
      var session = await findSession(hostname);

      // redirect to login if session is not authenticated
      if(!(session.authenticated)){
         res.redirect('/login');
      }
      
      // populate userID and user iformation
      const userID = session.userID;
      const user = await findUser(userID);

      // log activity for session to increase duration by 15 minutes
      await logActivity(hostname);

      // Generate date information for csv file name and transaction export
      const month = ["January","February","March","April","May","June",
         "July","August","September","October","November","December"];
      const date =  new Date(Date.now());
      var tMonth = month[date.getMonth()];
      var tYear = date.getFullYear();

      // Generate csv file
      const csvConfig = mkConfig({useKeysAsHeaders : true});
      // Generate csv file name
      const exportFile = `${tMonth}_${tYear}_transactions.csv`;

       // assign user's current month's tractions to the transactions variable
      var transactions = await exportTransctionList(userID);

      // Assign Transctions field a string of none in transation document
      // if user has no transactions for the requested month.
      if(!transactions){
         transactions = [{
            firstName : user.firstName,
            lastName : user.lastName,
            userID,
            Transactions : "None"
         }]
      }

      // Assign appropriate values for locals document. 
      const locals = {
         title : 'Main Dashboard',
         description : 'Free NodeJS User Management Syestem',
         file : './dashboard/dashboard.ejs',

         // assign a copy of session or locals messages  to to the messages field
         messages : (session.messages).slice() || locals.messages, 

         board : "dashboard",
         user : user,
         exportFile,
         export : await generateCsv(csvConfig)(transactions),

         // Retrieve the three most recent transactions, budgets and goals
         transactions : await getTransactionList(userID,1,3),
         budgets : await getBudgetList(userID,1,3),
         goals : await getGoalList(userID,1,3)
      }

      // clear messages for session
      await updateMessages(hostname, []);
      res.render('main', locals);
   }catch(error){
      console.log(error);
      res.redirect('/404');
   }
}

// Display user transaction dashboard
exports.transactions = async(req, res)=>{
    try{
      var session = await findSession(hostname);
      
      // redirect to login if session is not authenticated
      if(!(session.authenticated)){
         res.redirect('/login');
      }
   
      // populate userID and user information
      const userID = session.userID;
      const user = await findUser(userID);
      
      // log activity for session to increase duration by 15 minutes
      await logActivity(hostname);


      let perPage = 10;  // Display 10 transactions per page
      let page = req.query.page || 1; // page requested for display
   
      const total = await getTransactionList(userID); // Retrieve all transactions
      const result = await getTransactionList(userID,page,perPage); // Retrieve only transactions to be displayed
      
      // Assign appropriate values for locals document.
      const locals = {
         title : 'Transactions Dashboard',
         description : 'Free NodeJS User Management Syestem',
         file : './dashboard/transaction.ejs',
         board : "transaction",
         user,
         transactions : result,
         messages : (session.messages).slice() || locals.messages,  
         pages : Math.ceil(total.length/perPage)
      }
     
      
      await updateMessages(hostname, []);
      res.render('main', locals);
   }catch(error){
      console.log(error);
      await updateMessages(hostname, ["Error Encountered"]);
      res.redirect('/dashboard');
   }
}

// Display user budget dashboard
exports.budgets = async(req, res)=>{
    try{
      var session = await findSession(hostname);

      if(!(session.authenticated)){
         res.redirect('/login');
      }
   
      const userID = session.userID;
      const user = await findUser(userID);
      await logActivity(hostname);
      const locals = {
         title : 'Budgets Dashboard',
         description : 'Free NodeJS User Management Syestem',
         file : './dashboard/budget.ejs',
         messages : (session.messages).slice() || locals.messages,      
         board : "budget",
         user : await findUser(userID),
      }
      let perPage = 10;
      let page = req.query.page || 1;
      console.log(req.query.page);

      const total = await getBudgetList(userID); 
      const result = await getBudgetList(userID,page,perPage); 
      if(result){
         locals.budgets = result;
         locals.current = page;
         locals.pages = Math.ceil(total.length/perPage);
      }else{res.redirect('/404');}
      
      await updateMessages(hostname, []);
      res.render('main', locals);
   }catch(error){
      console.log(error);
      await updateMessages(hostname, ["Error Encountered"]);
      res.redirect('/dashboard');
   }
}

// Display user goal dashboard
exports.goals = async(req, res)=>{
    try{
      var session = await findSession(hostname);

      if(!(session.authenticated)){
         res.redirect('/login');
      }
   
      const userID = session.userID;
      const user = await findUser(userID);
      await logActivity(hostname);
      const locals = {
         title : 'Goals Dashboard',
         description : 'Free NodeJS User Management Syestem',
         file : './dashboard/goal.ejs',
         messages : (session.messages).slice() || locals.messages,      
         board : "goal"
      }
      let perPage = 10;
      let page = req.query.page || 1;
      console.log(req.query.page);
      const total = await getGoalList(userID); 
      const result = await getGoalList(userID,page,perPage); 
      if(result){
         locals.user = user;
         locals.goals = result;
         locals.current = page;
         locals.pages = Math.ceil(total.length/perPage);
      }else{res.redirect('/404');}
      await updateMessages(hostname, []);
      res.render('main', locals);
   }catch(error){
      console.log(error);
      await updateMessages(hostname, ["Error Encountered"]);
      res.redirect('/dashboard');
   }
}

// Display user profile dashboard
exports.profile = async(req, res)=>{
    
   try{
      var session = await findSession(hostname);

      if(!(session.authenticated)){
         res.redirect('/login');
      }
   
      const userID = session.userID;
      const user = await findUser(userID);
      await logActivity(hostname);
      const locals = {
         title : 'Profile',
         description : 'Budgetier User Profile',
         file : './dashboard/profile.ejs',      
         board : "profile",
         messages : session.messages.slice() || locals.messages,
         board : "profile",
         user : user,
      }
      if(!user){
         res.redirect('/404');
      }
      res.render('main', locals);
  }catch(error){
   console.log(error);
  }
}

// Display the editProfile page
exports.editProfile = async(req, res) =>{ 
   try{
      var session = await findSession(hostname);

      if(!(session.authenticated)){
         res.redirect('/login');
      }
   
      const userID = session.userID;
      const user = await findUser(userID);
      await logActivity(hostname);

      const locals = {
         title : 'Edit Profile',
         description : 'Budgetier Edit Profile',
         file : './dashboard/edit/editProfile.ejs',
         messages : "",
         board : "profile",
         user : await findUser(userID),
         info : {
            name : `Edit Profile`,          
            page : 'Profile',
            error : "",
         },
         user : user,
      }
      res.render('main', locals);

   }catch(error){
      console.log(error);
   }
}

// Handle post request to edit profile
exports.editProfilePost = async(req, res) =>{  
   try{
      var session = await findSession(hostname);

      if(!(session.authenticated)){
         res.redirect('/login');
      }
   
      const userID = session.userID;
      const user = await findUser(userID);
      await logActivity(hostname);
      var{firstname,lastname,email,amount} = req.body; 
      const locals = {
            title : 'Edit Profile',
            description : 'Budgetier Edit Profile',
            file : './dashboard/edit/editProfile.ejs',
            messages : "",
            board : "profile",
            info : {
               name : `Edit Profile`,          
               page : 'Profile',
               error : {amount: "", email : ""}
            },
            user : user,
         }
      
      var{firstname,lastname,email,amount} = req.body;
      var validProfile = true; 
      
      console.log(validProfile);
      if(!(/^\d*(\.\d+)?([eE]\d+)?$/.test(amount))){           
         locals.info.error.amount = "Please enter a positive number."
         validProfile = false;
      }
      if(user.email !== email){
         if(!(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(email))){
            locals.info.error.email = "Email is invalid";
            validProfile = false;
         }
         else{
            if(await getUser(email)){            
               locals.info.error.email = "Email already in use.";
               validProfile = false;
            }
         }
      }
      console.log(validProfile);
      if(validProfile){         
         locals.user = await updateUser(userID,firstname,lastname,email,amount);
         locals.messages = ["Profile updated"];
         locals.file = './dashboard/profile.ejs';
      }else{
         console.log("in edit profile post")
         locals.messages = ["Operation Failed. Profile not updated"];
         locals.file = './dashboard/profile.ejs';
      }
   
      res.render('main', locals);

   }catch(error){
      console.log(error);
   }
}
// Display the editEntry page
exports.editEntry = async(req, res) =>{  
   try{
      var session = await findSession(hostname);

      if(!(session.authenticated)){
         res.redirect('/login');
      }
   
      const userID = session.userID;
      const user = await findUser(userID);
      await logActivity(hostname);
      const locals = {
         title : 'Update User Entry',
         description : 'Budgetier Update User Entry',
         file : './dashboard/edit/editEntry.ejs',
         messages : "",
         board : "profile",
         user : await findUser(userID),
         info : {
            name : `Edit Entry`,          
            page : 'Profile',
            error : "",
         },
         user : user,
      }
      res.render('main', locals);

   }catch(error){
      console.log(error);
      await updateMessages(hostname, ["Error : Password not updated."]);
      res.redirect('/dashboard');
   }
}

// Handle post request to edit user entry
exports.editEntryPost = async(req, res) =>{  
   try{
      var session = await findSession(hostname);

      if(!(session.authenticated)){
         res.redirect('/login');
      }
   
      const userID = session.userID;
      const user = await findUser(userID);
      const email = user.email;
      await logActivity(hostname);
      var{entry1,entry2,entry3} = req.body; 
      const locals = {
            title : 'Update User Entry',
            description : 'Budgetier Update User Entry',
            file : './dashboard/edit/editEntry.ejs',
            messages : [],
            board : "profile",
            info : {
               name : `Update User Entry`,          
               page : 'Profile',
               error : {entry1: "", entry2 : "", entry3 : ""}
            },
            user : user,
         }
      var validEntry = true; 
      var validOldEntry = await loginUser(email, entry1);
      var {valid, error} = await validateEntry(entry2);
      var validConfirmedEntry = entry2 == entry3;
      console.log(validConfirmedEntry)

      if(!validOldEntry){
         locals.info.error.entry1 = "Invalid Current Password.";
         validEntry = false;
      }
      if(!valid){
        locals.info.error.entry2 = error;
        validEntry = false
      }
      if(!validConfirmedEntry){           
         locals.info.error.entry3 = "Password does not match."
         validEntry = false;
      }
      
      if(validEntry){         
         locals.user = await updateEntry(userID,entry1,entry2);
         locals.messages = ["Password updated"];
         locals.file = './dashboard/profile.ejs';
      }   
      res.render('main', locals);

   }catch(error){
      await updateMessages(hostname, ["Error : Password not updated."]);
      res.redirect('/dashboard');
   }
}

// Handle Search Request 
exports.search = async(req, res) => {
   try{
      var session = await findSession(hostname);

      // redirect to login if session is not authenticated
      if(!(session.authenticated)){
         res.redirect('/login');
      }
   
      // populate userID and user information
      const userID = session.userID;
      const user = await findUser(userID);
      
      // log activity for session to increase duration by 15 minutes
      await logActivity(hostname);

      // Clear previous search lists in session handler
      await clearSearch(hostname, userID);

      // Retreive and split searchTerm by space delimiter
      let searchTerm = req.body.searchTerm;
      let search  = searchTerm.split(" "); 
      let query = "";
      let transactionList = [];
      let budgetList = [];
      let goalList = [];

      // Conduct a RegEx search for each search term
      search.forEach(async el =>{

         let path = 3;
         let transactions;
         let budgets;
         let goals;
         if((/^\d*(\.\d+)?([eE]\d+)?$/.test(el))){
            path = 0;
         }
         else if ((/[0-9a-fA-F]{24}/.test(el))){
            path = 1
         }
         else if (!isNaN(Date.parse(el))){
            path = 2
         }
         {query = query + search} // append search element to query if path requirements are not met

         // conduct RegEx Search for requested collections with appropriate path
         transactions = await searchTransaction(userID,el,path);
         budgets      = await searchBudget(userID,el,path);
         goals        = await searchGoal(userID,el,path);   

         // save results to session search list handler
         await saveSearchResults(hostname, userID, transactions, budgets, goals);
      })
      // If there is a query
      if(query){

			console.log("conducting Rag Search.") // conduct RAG Search

         // Run rag.py in a child process to conduct RAG Search
			const child_process = spawn('python', ['./server/controllers/rag.py', userID, query])
			child_process.stdout.on('data', async (data) =>{
				console.log(`Logging : ${data}`);

			})
			child_process.stderr.on('data', async (data) =>{
				console.error(`stderr: ${data}`);

			})
			child_process.on('close', async(code) =>{
            
            // Assign RAG search results to appropriate variables
				const t_results = require('./results/t_results.json');
				const b_results = require('./results/b_results.json');
				const g_results = require('./results/g_results.json');

            // Strigify concatenated lists of Regex Search and RAG Search
				transactionList = JSON.parse(JSON.stringify([...session.transactionList, ...t_results]));
				budgetList = JSON.parse(JSON.stringify([...session.budgetList, ...b_results]));
				goalList = JSON.parse(JSON.stringify([...session.goalList, ...g_results]));           
            
            // If all lists are empty redirect to main dashboard with no results message.
				if(!(transactionList || budgetList || goalList)){
				   await updateMessages(hostname, ["No Results Found."]);
				   res.redirect('/dashboard');
				} 

            // Save updated results in appropriate session fields
            await saveSearchResults(hostname, userID, transactionList, budgetList, goalList);
            
				console.log(`child process exited with code ${code}`); 
         })
         
		}      
   
      if(!(transactionList || budgetList || goalList)){
         await updateMessages(hostname, ["No Results Found."]);
         res.redirect('/dashboard');
       
      }  
  
      let perPage = 3;
      let t_page = req.query.t_page || 1;
      let b_page = req.query.b_page || 1;
      let g_page = req.query.g_page || 1;

      // Assign appropriate values for locals document.
      const locals = {
         title : 'Search User Query',
         description : 'Budgetier Search User Query',
         file : './dashboard/search.ejs',
         messages : [],
         board : "search",
         info : {
            name : `Search User Query`,          
            page : 'search',
         },
         user,
         transactions : transactionList.slice(perPage * t_page - perPage, perPage * t_page + 1),
         budgets : budgetList.slice(perPage * b_page - perPage, perPage * b_page + 1),
         goals : goalList.slice(perPage * g_page - perPage, perPage * g_page + 1),
         t_page,
         b_page,
         g_page,
         t_pages : Math.ceil(transactionList.length/perPage),
         b_pages : Math.ceil(budgetList.length/perPage),
         g_pages : Math.ceil(goalList.length/perPage)
         
      }
      // Display Search Results
      res.render('main', locals) 
      
      
   }
   catch(error){
      console.log(error);
      await updateMessages(hostname, ["Error : Search Not Found."]);
      res.redirect('/dashboard');
   }    
}

// Handle paginated Search Display
exports.searchDisplay = async(req, res) =>{
 
   var session = await findSession(hostname);
  
   try{
      var session = await findSession(hostname);

      if(!(session.authenticated)){
         res.redirect('/login');
      }
      else{
         const userID = session.userID;
         const user = await findUser(userID);
         await logActivity(hostname);
        			
         var transactionList = session.transactionList;
         var budgetList = session.budgetList;
         var goalList = session.goalList;

         let perPage = 3;
         let t_page = req.query.t_page || 1;
         let b_page = req.query.b_page || 1;
         let g_page = req.query.g_page || 1;

         const locals = {
            title : 'Search User Query',
            description : 'Budgetier Search User Query',
            file : './dashboard/search.ejs',
            messages : [],
            board : "search",
            info : {
               name : `Search User Query`,          
               page : 'search',
            },
            user,
            transactions : transactionList.slice(perPage * t_page - perPage, perPage * t_page),
            budgets : budgetList.slice(perPage * b_page - perPage, perPage * b_page),
            goals : goalList.slice(perPage * g_page - perPage, perPage * g_page),
            t_page,
            b_page,
            g_page,
            t_pages : Math.ceil(transactionList.length/perPage),
            b_pages : Math.ceil(budgetList.length/perPage),
            g_pages : Math.ceil(goalList.length/perPage)

         }
         res.render('main', locals)
      }

   }catch(error){
      console.log(error);
      await updateMessages(hostname, ["Error : Search Not Found."]);
      res.redirect('/dashboard');
   }
}

