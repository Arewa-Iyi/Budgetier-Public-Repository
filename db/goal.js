/**
 * Name : Arewa (Morountudun) Ojelade
 * Date : 3/4/2025
 * File Name: transaction.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Budgetier Capstone Project
 * Description : The purpose of the goal.js file is to provide 
 * compact functions to interact with the Goal collection of
 * the Budgetier Accounts database.
 */
const Category = require("./models/Category.js");
const Goal = require("./models/Goal.js");
const User = require("./models/User.js");
const names = ["All","Transportation", "Housing","Vehicle","Life & Entertainment",
                    "Utilities","Food & Drinks", "Physical Upkeep","Medical & Healthcare",
                    "Personal","Pets" ,"Professional Development", "Income","Investments"];
/**
 * Function to control precision of monetary values.
 * 
 * @param {Double} amount - The parameterized value.
 * @returns {Double}  The value with a precision of 2 following the decimal point.
 */
const dollarfy = async(amount)=>{
    return parseInt(amount*100)/100;
}

/**
 * Function to add a goal to the Goal collection of the 
 * Budgetier Accounts database. The goalList array in the 
 * User collection is updated with the unique goal _id.
 * @param {String} userID - The unique _id of the associated User instance.
 * @param {String} name - The name of the associated goal instance.
 * @param {Double} targetAmount - The targeted goal amount to save.
 * @param {Double} savedAmount - The current amount saved towards target goal. 
 * @param {String} description - The description of the target goal. 
 * @param {Int32} savedToDate - The date ending the duration of the goal. 
 * @param {Int32} categoryID - The categoryID that categorizes the goal. 
 * @returns {Object} The created instance of the goal object.
 * Returns null if :
 *   1. Invalid userID is provided.
 *   2. No name is provided.
 *   3. Invalid targetAmount is provided.
 */
const addGoal = async(userID, name, targetAmount, savedAmount = 0,  description = "",
                     savedToDate = new Date(Date.now() + 30 * 24 * 3600 * 1000), 
                     categoryID = 0) =>{    
    const user = await User.findOne({_id : userID});
    categoryID = parseInt(categoryID);
    targetAmount = await dollarfy(parseFloat(targetAmount));
    savedAmount = await dollarfy(parseFloat(savedAmount));
    
    const category_exist = await Category.findOne({categoryID : categoryID});
    if(!category_exist){
        categoryID = 0;
    }
    if(user && name && targetAmount > 0 ){
       
        const goal = await Goal.create({
            userID : userID,
            name : name,
            targetAmount : targetAmount,
            savedAmount : savedAmount,            
            savedToDate : new Date(savedToDate),
            categoryID : categoryID,
            category : names[categoryID],
            description : description
        });
        user.goalList.push(goal._id);
        user.save();
        return goal;
    }
    return null;
}
/**
 * Function to remove a goal from the Goal collection of the 
 * Budgetier Accounts database. The unique goal _id of the goal
 * is removed from the goalList array in the User collection.
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} goalID - The unique _id of the goal. 
 * @returns {Object} The removed instance of the goal object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. goalID is not associated with the User instance provided.
 */
const removeGoal = async (userID, goalID) =>{
    const user = await User.findOne({_id : userID});
    const index = user.goalList.indexOf(goalID);
    if(user && index >= 0){
        
        const goal = await Goal.findOne({_id : goalID});
        const finalCopy = JSON.parse(JSON.stringify(goal));
        await Goal.deleteOne({_id : goalID});

        // Removes goal _id from goalList.
        user.goalList.splice(index, 1);

        await user.save();
        return finalCopy;
    }
   return null
}
/**
 * Function to retrieve a goal from the goal collection of the 
 * Budgetier Accounts database. The unique goal _id of the goal
 * must be associated with the goalList array in the specified User collection.
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} goalID - The unique _id of the goal. 
 * @returns {Object} The instance of the goal object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. goalID is not associated with the User instance provided.
 */
const getGoal = async(userID, goalID)=>{
    const user = await User.findOne({_id : userID});
    const index = user.goalList.indexOf(goalID);

    if(user && index >= 0){
        const goal = await Goal.findOne({_id : goalID});
        return goal;
    }
    return null;
}
/**
 * Function to retrieve a goal list associated with the
 * provided userID from the Transaction collection of the 
 * Budgetier Accounts database. 
 * @param {String} userID - The unique _id of the associated User instance.  * 
 * @param {INT32} page - The current page displayed.
 * @param {INT32} perPage - The number of elements displayed per page.
 * @returns {Object} The list of all goals associated with userID.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. goalID is not associated with the User instance provided.
 */
const getGoalList = async(userID, page = 0, perPage = 0)=>{
    const user = await User.findOne({_id : userID});
     if(user){
        var goal;
        if(page === 0){       
            goal = await Goal.find({userID : userID}).sort({date : -1});
            
        }
        else{
            goal = await Goal.find({userID : userID}).sort({date : -1})
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec();
        }
        return goal;
    }
    return null;
}
/**
 * Function to change a goal's instance in the Budget collection of the 
 * Budgetier Accounts database. 
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} goalID - The unique _id of the goal.
 * @param {String} name - The updated goal name.  
 * @param {Double} targetAmount - The updated goal target amount.
 * @param {Double} savedAmount - The updated goal saved amount.
 * @param {Int32} categoryID - The updated categoryID that categorizes the goal. 
 * @param {String} description - The updated description of the associated Goal instance.
 * @returns {Object} The updated instance of the goal object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      3. goalID is not associated with the User instance provided.
 */
const updateGoal = async(userID, goalID, name, targetAmount, savedAmount, date,
                         categoryID = 0, description = "", ) => {
    try{
        const user = await User.findOne({_id : userID});
        const index = user.goalList.indexOf(goalID);
        if(user && index >= 0){            
            const goal = await Goal.findOne({_id : goalID});
            if(goal){
                goal.set('name', name);   
                goal.set('targetAmount', await dollarfy(targetAmount));  
                goal.set('savedAmount', await dollarfy(savedAmount)); 
                goal.set('savedToDate', new Date(date));   
                goal.set('categoryID', categoryID);  
                goal.set('category', names[categoryID]);   
                goal.set('description', description);   
                goal.save();
                return goal;
            }
        }
    }catch(error){
        console.log(error);
    }
    return null;
}

/**
 * Function to retrieve a goal's total saved amount from the goal collection of the 
 * Budgetier Accounts database. The unique goal _id of the goal
 * must be associated with the goalList array in the specified User collection.
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} goalID - The unique _id of the goal. 
 * @returns {Object} The instance of the goal object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. goalID is not associated with the User instance provided.
 */
const getSavedAmount = async(userID, goalID)=>{
    const user = await User.findOne({_id : userID});
    const index = user.goalList.indexOf(goalID);

    if(user && index >= 0){
        const goal = await Goal.findOne({_id : goalID});
        return goal.savedAmount;
    }
    return null;
}
/**
 * Function to retrieve a goal's target amount from the goal collection of the 
 * Budgetier Accounts database. The unique goal _id of the goal
 * must be associated with the goalList array in the specified User collection.
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} goalID - The unique _id of the goal. 
 * @returns {Object} The instance of the goal object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. goalID is not associated with the User instance provided.
 */
const getTargetAmount = async(userID, goalID)=>{
    const user = await User.findOne({_id : userID});
    const index = user.goalList.indexOf(goalID);

    if(user && index >= 0){
        const goal = await Goal.findOne({_id : goalID});
        return goal.targetAmount;
    }
    return null;
}

/**
 * Function to change a goal's name in the Goal collection of the 
 * Budgetier Accounts database. 
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} goalID - The unique _id of the goal.
 * @param {String} newName - The updated goal name.  
 * @returns {Object} The updated instance of the goal object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. Invalid newName is provided. (Empty String)
 *      3. goalID is not associated with the User instance provided.
 */
const updateGoalName = async(userID, goalID, newName) =>{
    const user = await User.findOne({_id : userID});
    const index = user.goalList.indexOf(goalID);
    if(user && newName && index >= 0){
        const goal = await Goal.findOne({_id : goalID});
        goal.set('name' , newName);
        await goal.save();
        return goal;
    }
    return null;
}

/**
 * Function to change a goal's amount in the goal collection 
 * of the Budgetier Accounts database. 
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} goalID - The unique _id of the goal. 
 * @param {Int32} newCategoryID - The new categoryId that categorizes the object.
 * @returns {Object} The updated instance of the goal object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. Invalid categoryID is provided.
 *      3. goalID is not associated with the User instance provided.
 */
const updateGoalCategory = async(userID, goalID, newCategoryID) =>{
    const user = await User.findOne({_id : userID});
    const index = user.goalList.indexOf(goalID);
    const category = await Category.findOne({categoryID : newCategoryID});
    if(user && category && index >= 0){
        const goal = await Goal.findOne({_id : goalID});
        goal.set('categoryID', newCategoryID);
        goal.set('category', names[newCategoryID])
        await goal.save();
        return goal;        
    }
    return null;
}

/**
 * Function to change a goal's target amount in the goal collection 
 * of the Budgetier Accounts database. 
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} goalID - The unique _id of the goal. 
 * @param {Double} newTargetAmount - The updated goal target amount.
 * @returns {Object} The updated instance of the goal object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. Invalid targetAmount is provided. (Positive values only)
 *      3. goalID is not associated with the User instance provided.
 */
const updateTargetAmount = async(userID, goalID, newTargetAmount) => {
    const user = await User.findOne({_id : userID});
    const index = user.goalList.indexOf(goalID);
    if(user && newTargetAmount > 0 && index >= 0){
        const goal = await Goal.findOne({_id : goalID});      
     
        // Update and save goal instance.
        goal.set('targetAmount' , await dollarfy(newTargetAmount));
        await goal.save();
        return goal;
    }
    return null;
}

/**
 * Function to change a goal's saved amount in the goal collection 
 * of the Budgetier Accounts database. 
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} goalID - The unique _id of the goal. 
 * @param {Double} newSavedAmount - The updated goal saved amount.
 * @returns {Object} The updated instance of the goal object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. Invalid savedAmount is provided. (Positive values only)
 *      3. goalID is not associated with the User instance provided.
 */
const updateSavedAmount = async(userID, goalID, newSavedAmount) => {
    const user = await User.findOne({_id : userID});
    const index = user.goalList.indexOf(goalID);
    if(user && newSavedAmount > 0 && index >= 0){
        const goal = await Goal.findOne({_id : goalID});      
     
        // Update and save goal instance.
        goal.set('savedAmount' , await dollarfy(newSavedAmount));
        await goal.save();
        return goal;
    }
    return null;
}
/**
 * Function to add an amount to a goal's saved amount in the goal collection 
 * of the Budgetier Accounts database. 
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} goalID - The unique _id of the goal. 
 * @param {Double} amount - The amount to increase goal saved amount.
 * @returns {Object} The updated instance of the goal object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. Invalid amount is provided. (Positive values only)
 *      3. goalID is not associated with the User instance provided.
 */
const increaseSavedAmount = async(userID, goalID, amount) => {
    const user = await User.findOne({_id : userID});
    const index = user.goalList.indexOf(goalID);
    if(user && amount > 0 && index >= 0){
        const goal = await Goal.findOne({_id : goalID});      
     
        // Update and save goal instance.
        goal.set('savedAmount' , await dollarfy(goal.savedAmount + amount));
        await goal.save();
        return goal;
    }
    return null;
}
/**
 * Function to retrieve goal instances mathing search and type criteria 
 * in the Goal collection of the Budgetier Accounts database. 
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} search - User provided search query.
 * @param {Int32} type - Type of search query. 
 *          0. Double (Monetary Value)
 *          1. ObjectId
 *          2. Date
 *          3. String query
 * @returns {Object} Agregated documents matching the search query
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. No documents match search query.
 *      3. Invalid type provided.
 */
const searchGoal= async(userID, search,type) =>{
    try{
        
        if(type == 0){
            return await Goal.find({
                 $and: [{
                    $or: [{
                            targetAmount: search
                        },
                        {
                            savedAmount: search
                        },
                    ],
               
                    userID: userID
                }]
            })
        }
        else if (type == 1){
            return await Goal.find({userID : userID, _id : search})
        }
        else if (type == 2){
            return await Goal.find({userID : userID, createdAt : new Date(search)})
        }
        else {
            return await Goal.find({userID : userID})
                             .where({ $or: [ 
                                        
                                        { name : { $regex: new RegExp(search, "i")} },
                                        { category : { $regex:  new RegExp(search, "i")} },
                                        { description : { $regex:  new RegExp(search, "i")} } 
                                    ] 
                             })
                             
                            .select('_id userID name savedAmount targetAmount savedToDate category description')
                                    
        }
    }catch(error){
        console.log(error);
    }

}
module.exports = {addGoal, removeGoal, getGoal, getGoalList, updateGoalName, 
    updateGoal, updateGoalCategory, updateTargetAmount, updateSavedAmount, 
    increaseSavedAmount, getSavedAmount, getTargetAmount, searchGoal

};