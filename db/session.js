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
/**
 * Function to find  a user session in the
 * Session collection of the Budgetier Accounts database.
 * @param {String} hostname - The unique hostname of the session. 
 * @param {Boolean} disable - boolean to disable session 
 * @returns {Object} The instance of the session object.
 * Returns null if :
 *      1. Invalid hostname is provided. 
 */
const findSession = async(hostname, disable = false)=>{
    try{
        var session = await Session.findOne({hostname});
        var currentTime = new Date(Date.now());
        if(session){
            if((session.duration < currentTime) | disable){
                await endSession(hostname);
            }
            return session;
        }
        return null;
    }catch(error){
        console.log(error);
    }
}
/**
 * Function to end  a user session in the
 * Session collection of the Budgetier Accounts database.
 * @param {String} hostname - The unique hostname of the session. 
 */
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

/**
 * Function to create and authenticate a user session in the
 * Session collection of the Budgetier Accounts database.
 * @param {String} userID - The unique userID of the session. 
 * @param {String} hostname - The unique hostname of the session. 
 * @param {Boolean} authenticated - boolean of session authentication. 
 * @param {String} ip - The ip address of user's system
 * @returns {Object} The instance of the session object.
 *  Returns null if :
 *      1. Invalid hostname or userID is provided. 
 */
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
            console.log(`Session reauthenticated for ${hostname}`); 
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
            }
        }
        return session;
    }
    catch(error){
        console.log(error)
    }
}
/**
 * Function to log user activity and extend user session by 15 minutes in the
 * Session collection of the Budgetier Accounts database.
 * @param {String} hostname - The unique hostname of the session. 
 */
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
/**
 * Function to update session messages displayed in pages in the
 * Session collection of the Budgetier Accounts database.
 * @param {String} hostname - The unique hostname of the session. 
 * @param {Array} messages - Array of strings containing messages to be displayed 
 */
const updateMessages = async(hostname, messages) =>{
    try{
        var session = await Session.findOne({hostname});
        if(session){
            session.set('messages', messages);
            session.save();
        }
    }catch(error){console.log(error);}
}
/**
 * Function to update search results in the appropriate session lists in the
 * Session collection of the Budgetier Accounts database.
 * @param {String} userID - The unique userID of the session. 
 * @param {String} hostname - The unique hostname of the session.  
 * @param {Array} transactions - Array of transaction documents to be added to seassion transactionList.
 * @param {Array} budgets - Array of budget documents to be added to seassion budgetList.
 * @param {Array} goals - Array of goal documents to be added to seassion goalList.
 */
const saveSearchResults = async(hostname, userID, transactions,budgets,goals, ) =>{
    var session = await Session.findOne({hostname, userID});
    
    // concatenate original list to passed list if session list is not empty
    var transactions  = session.transactionList === 0 ? 
                        new Set([...session.transactionList, ...transactions]) : transactions;
    var budgets = session.budgetList === 0 ? new Set( [...session.budgetList, ...budgets]) : budgets;
    var goals = session.goalList === 0 ? new Set([...session.goalList, ...goals]) : goals;

    // update results
    session.set('transactionList', transactions);
    session.set('budgetList', budgets);
    session.set('goalList', goals);

    // save update
    await session.save();
}

/**
 * Function to retireve search results matchin the hostname and userID in the
 * Session collection of the Budgetier Accounts database.
 * @param {String} userID - The unique userID of the session. 
 * @param {String} hostname - The unique hostname of the session.  
 * @returns {Array} The Array of the transaction, budget and goal documents.
 *  Returns null if :
 *      1. Invalid hostname or userID is provided. 
 *      2. Array is empty.
 */
const getSearchResults = async(hostname, userID )=>{
    var session = await Session.findOne({hostname,userID});    
    return session.transactionList, session.budgetList, session.goalList;
}

/**
 * Function to clear search results matchin the hostname and userID in the
 * Session collection of the Budgetier Accounts database.
 * @param {String} userID - The unique userID of the session. 
 * @param {String} hostname - The unique hostname of the session.  
 */
const clearSearch = async(hostname, userID) =>{
    await Session.updateOne({hostname, userID},
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
