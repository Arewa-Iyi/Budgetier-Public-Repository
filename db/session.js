/**
 * Name : Arewa (Morountudun) Ojelade
 * Date : 3/4/2025
 * File Name: session.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Budgetier Capstone Project
 * Description : The purpose of the session.js file is to provide 
 * compact functions to interact with the Session collection of
 * the Budgetier Accounts database such as creating sessions and logging activity.
 */
const Session = require("./models/Session.js");
const Transaction = require("./models/Transaction.js");
const User = require("./models/User.js");
const findSession = async(hostname, disable = false)=>{
    try{
        var session = await Session.findOne({hostname});
        var currentTime = new Date(Date.now());
        if(session){
            if((session.duration < currentTime) | disable){
                session.authenticated = false;
                session.save();
            }
            return session;
        }
        return null;
    }catch(error){
        console.log(error);
    }
}
const endSession = async(hostname)=>{
    try{
        var session = await findSession(hostname, true);
        if(session)
            await User.updateOne({_id : session.userID},{session : null});
        console.log(`Ended session for ${hostname}`);
    }catch(error){
        console.log(error);
    }
}
const createSession = async(userID, hostname, authenticated = false,ip = "", )=>{

    try{
        
        var session = await Session.findOne({hostname});
        if(session){
            if(!(session.authenticated)){
                session.set('userID',userID);
                session.set("duration" , new Date(Date.now() + 15 * 60 * 1000));
                session.set("authenticated", authenticated);
                session.set("ip", ip);
                session.save();
                
                User.updateOne({_id : userID},{session : session._id});
            }
            console.log(`Session Created for ${hostname}`);
            
            return session;
            
        }
        else{
            if(userID && hostname){
                session = await Session.create({
                    userID,
                    hostname,
                    ip,
                    authenticated
                });
                User.updateOne({_id : userID},{session : session._id});
                
                console.log(`Session Created for ${hostname}`);
                return session;
            }
        }
        return null;
    }
    catch(error){
        console.log(error)
    }
}
const logActivity = async(hostname) =>{
    try{
        var session = await Session.findOne({hostname});
        if(session){
            //Extend to 15 minutes from logged activity
            session.set("duration" , new Date(Date.now() + 15 * 60 * 1000));
            session.save();
            
            console.log("Logging Activity");
        }
        else{            
            console.log("No session found. Activity not logged");
        }
    }catch(error){
        console.log(error);
    }

}
const updateMessages = async(hostname, messages) =>{
    try{
        var session = await Session.findOne({hostname});
        if(session){
            session.set('messages', messages);
            session.save();
        }
    }catch(error){console.log(error);}
}
const saveSearchResults = async(hostname, userID, transactions,budgets,goals, append = true) =>{
    console.log("in save Search",transactions)
    if(append){
        await appendSearchResults(hostname, userID, transactions, budgets, goals);
    }
    else{
       await Session.updateOne({hostname, userID},
           {
               transactionList : new Set(transactions),
               budgetList : new Set(budgets),
               goalList : new Set(goals)
           }
       );
       console.log(se)
    }
}
const appendSearchResults = async(hostname, userID, transactions,budgets,goals) =>{
    var session = await Session.findOne({hostname, userID});
    
    var transactions  = session.transactionList === 0 ? 
                        new Set([...session.transactionList, ...transactions]) : transactions;
    var budgets = session.budgetList === 0 ? new Set( [...session.budgetList, ...budgets]) : budgets;
    var goals = session.goalList === 0 ? new Set([...session.goalList, ...goals]) : goals;

    session.set('transactionList', transactions);
    session.set('budgetList', budgets);
    session.set('goalList', goals);
    console.log("in append search", session.transactionList);
    await session.save();
}
const getSearchResults = async(hostname, userID )=>{
    var session = await Session.findOne({hostname,userID});
    const transactionList = session.transactionList;
    const budgetList = session.budgetList;
    const goalList = session.goalList;
    return transactionList, budgetList, goalList;
}
const clearSearch = async(hostname, userID) =>{
      Session.updateOne({hostname, userID},
           {
               transactionList : [],
               budgetList :[],
               goalList : []
           }
       );
}
module.exports = {createSession, logActivity, findSession, endSession, updateMessages,
                  saveSearchResults, getSearchResults, clearSearch 

};