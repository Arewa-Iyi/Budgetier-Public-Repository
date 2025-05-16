
/**
 * Name : Arewa (Morountudun) Ojelade
 * Date : 3/4/2025
 * File Name: budget.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Budgetier Capstone Project
 * Description : The purpose of the budget.js file is to provide 
 * compact functions to interact with the Budget collection of
 * the Budgetier Accounts database.
 */
const Category = require("./models/Category.js");
const Transaction = require("./models/Transaction.js");
const Budget = require("./models/Budget.js");
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
 * Function to add a budget to the Budget collection of the 
 * Budgetier Accounts database. The budgetList array in the 
 * User collection is updated with the unique budget _id.
 * @param {String} userID - The unique _id of the associated User instance.
 * @param {String} name - The name of the associated Budget instance.
 * @param {Double} amount - The budget amount.
 * @param {Int32} categoryID - The categoryID that categorizes the budget.  
 * @param {String} description - The description of the associated Budget instance.
 * @returns {Object} The created instance of the budget object.
 * Returns null if :
 *   1. Invalid userID is provided.
 *   2. No name is provided.
 *   3. Invalid amount is provided.
 */
const addBudget = async(userID, name, amount, categoryID = 0, description = "") =>{ 
    amount = parseFloat(amount);   
    categoryID = parseInt(categoryID);
    const user = await User.findOne({_id : userID});
    const category_exist = await Category.findOne({categoryID : categoryID});
    const available_category = (user.budgetCategories.indexOf(categoryID) < 0)
    if(!category_exist){
        categoryID = 0;
    }
    if(user && name && amount > 0 && avaialable_category){
        const budget = await Budget.create({
            userID : userID,
            name : name,
            amount : await dollarfy(amount),
            categoryID : categoryID,
            category : names[categoryID],
            description : description,
            spentAmount : await getSpentAmount(userID, categoryID)
        });

        // convert budgetCategories to a set
        var set = new Set(user.budgetCategories);
        // add new budget category
        set.add(budget.categoryID);
        // assign user budgetList to reconverted array
        user.budgetCategories = [...set];
        // add new budget to user budgetList
        user.budgetList.push(budget._id);
        // save user and return budget
        await user.save();
        return budget;
    }
    return null;
}



/**
 * Function to remove a budget from the Budget collection of the 
 * Budgetier Accounts database. The unique budget _id of the budget
 * is removed from the budgetList array in the User collection.
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} budgetID - The unique _id of the budget. 
 * @returns {Object} The removed instance of the budget object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. budgetID is not associated with the User instance provided.
 */
const removeBudget = async(userID, budgetID)=>{
    const user = await User.findOne({_id : userID});
    const index = user.budgetList.indexOf(budgetID);

    if(user && index >= 0){
        const budget = await Budget.findOne({_id : budgetID});
        const finalCopy = JSON.parse(JSON.stringify(budget));
        await Budget.deleteOne({_id : budgetID});
        user.budgetList.splice(index, 1);
        await user.save();
        return finalCopy;
    }
    return null;
}
/**
 * Function to retrieve a budget from the Budget collection of the 
 * Budgetier Accounts database. The unique budget _id of the budget
 * must be associated with the budgetList array in the specified User collection.
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} budgetID - The unique _id of the budget. 
 * @returns {Object} The instance of the budget object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. budgetID is not associated with the User instance provided.
 */
const getBudget = async(userID, budgetID)=>{
    const user = await User.findOne({_id : userID});
    const index = user.budgetList.indexOf(budgetID);

    if(user && index >= 0){
        const budget = await Budget.findOne({_id : budgetID});
        budget.set('spentAmount', await getSpentAmount(userID, budget.categoryID));
        budget.save();
        return budget;
    }
    return null;
}
/**
 * Function to retrieve a budget list associated with the
 * provided userID from the Transaction collection of the 
 * Budgetier Accounts database. 
 * @param {String} userID - The unique _id of the associated User instance.  * 
 * @param {INT32} page - The current page displayed.
 * @param {INT32} perPage - The number of elements displayed per page.
 * @returns {Object} The list of all budgets associated with userID.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. budgetID is not associated with the User instance provided.
 */
const getBudgetList = async(userID, page = 0, perPage = 0)=>{
    const user = await User.findOne({_id : userID});
     if(user){
        var budget;
        if(page === 0){       
            budget = await Budget.find({userID : userID}).sort({date : -1});
            
        }
        else{
            budget = await Budget.find({userID : userID}).sort({date : -1})
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec();
        }

        budget.forEach(async(b)=>{
            b.spentAmount = await getSpentAmount(userID, b.categoryID);
            b.save();
        });
        return budget;
    }
    return null;
}
/**
 * Function to update a budget's instance in the Budget collection of the 
 * Budgetier Accounts database. 
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} budgetID - The unique _id of the budget.
 * @param {String} name - The budget name.  
 * @param {Double} amount - The budget amount.
 * @param {Int32} categoryID - The new categoryID that categorizes the budget. 
 * @param {String} description - The description of the associated Budget instance.
 * @returns {Object} The updated instance of the budget object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      3. budgetID is not associated with the User instance provided.
 */
const updateBudget = async (userID, budgetID, name, amount, categoryID = 0, description = "") =>{
    try{
        const user = await User.findOne({_id : userID});
        const index = user.budgetList.indexOf(budgetID);
        if (user && index >= 0){            
            const budget = await Budget.findOne({_id : budgetID});
             if(budget){
                if(budget.name != name)
                    budget.set('name', name);   
                
                if(budget.amount != amount)
                    budget.set('amount', await dollarfy(amount));
                if(budget.categoryID != categoryID){
                    await updateBudgetCategory(userID, budgetID, categoryID);
                }

                if(budget.description != description)                   
                    budget.set('description', description);  

                await budget.save();
                return budget;
             }
        }
    }catch(error){
        console.log(error);
    }
    return null;
}

/**
 * Function to change a budget's name in the Budget collection of the 
 * Budgetier Accounts database. 
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} budgetID - The unique _id of the budget.
 * @param {String} newName - The updated budget name.  
 * @returns {Object} The updated instance of the budget object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. Invalid newName is provided. (Empty String)
 *      3. budgetID is not associated with the User instance provided.
 */
const updateBudgetName = async(userID, budgetID, newName) =>{
    const user = await User.findOne({_id : userID});
    const index = user.budgetList.indexOf(budgetID);
    if(user && newName && index >= 0){
        const budget = await Budget.findOne({_id : budgetID});
        if(budget.name != newName){
            budget.set('name', newName);
            await budget.save();
        }
        return budget;
    }
    return null;
}
/**
 * Function to change a budget's amount in the Budget collection 
 * of the Budgetier Accounts database. 
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} budgetID - The unique _id of the budget. 
 * @param {Double} newAmount - The updated budget amount.
 * @returns {Object} The updated instance of the budget object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. Invalid newAmount is provided. (Positive values only)
 *      3. budgetID is not associated with the User instance provided.
 */
const updateBudgetAmount = async(userID, budgetID, newAmount) =>{
    const user = await User.findOne({_id : userID});
    const index = user.budgetList.indexOf(budgetID);
    if(user && newAmount > 0 && index >= 0){
        const budget = await Budget.findOne({_id : budgetID});
        
        if(budget.amount != newAmount){
            budget.set('amount', await dollarfy(newAmount));
            await budget.save();
        }
        return budget;        
    }
    return null;
}
/**
 * Function to change a budget's amount in the Budget collection 
 * of the Budgetier Accounts database. 
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} budgetID - The unique _id of the budget. 
 * @param {Int32} newCategoryID - The new categoryID that categorizes the budget.
 * @returns {Object} The updated instance of the budget object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. Invalid categoryID is provided.
 *      3. budgetID is not associated with the User instance provided.
 */
const updateBudgetCategory = async(userID, budgetID, newCategoryID) =>{
    newCategoryID = parseInt(newCategoryID);
    const user = await User.findOne({_id : userID});
    const index = (user.budgetList.indexOf(budgetID) >= 0);
    const category = await Category.findOne({categoryID : newCategoryID});
    const available_category = (user.budgetCategories.indexOf(newCategoryID) < 0)

    if(user  && index && category && available_category){
        
        const budget = await Budget.findOne({_id : budgetID});
        const oldCategoryID = budget.categoryID;
        if(oldCategoryID != newCategoryID){
            const pos = user.budgetCategories.indexOf(oldCategoryID);
            user.budgetCategories.splice(pos, 1);
            user.budgetCategories.push(newCategoryID);
            budget.set('categoryID', newCategoryID);
            budget.set('category', names[newCategoryID]);
            budget.set('spentAmount', await getSpentAmount(userID, newCategoryID));
            await budget.save();
            await user.save();
        }
        return budget;        
    }
    return null;
}

/**
 * Function to retrieve list of transactions associated with the user's budget
 * categoryID of the Budgetier Accounts database. The list will be returned to
 * the calling function.
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} categoryID - The categoryId of the associated budget instance. 
 * @returns {Object} The list of all current month trascations with budget categoryID.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. There are no transactions associated with budget's categoryID
 */
const budgetTransactions = async(userID, categoryID) => {    
    let date = new Date(Date.now());
    let cMonth = ((date.toUTCString()).split(" "))[2];
    let cYear = date.getFullYear();
    let start = new Date(`${date.getFullYear()}-1-${date.getMonth()}-`);
    
    var transactions = await Transaction.find({userID: userID, date : { $gte: start}})
                                        .select(['amount','date','type','categoryID'])
                                        .exec()                   
    let index = 0;   
    let list = []                     
    transactions.forEach(async (transaction) => {
        let tMonth = (((transaction.date).toUTCString()).split(" "))[2];
        let tYear =  (transaction.date).getFullYear();
        
        if(cMonth == tMonth && cYear == tYear && transaction.categoryID == categoryID){           
            list.push(transaction);
        }
        index++;
    });
    return list;
}
/**
 * Function to get sum of epense transactions aggregated by provided categoryID
 * in the User collection of the Budgetier Accounts database. 
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {Int32} categoryID - The id of the category. 
 * @returns {Double} The total amount accumulated from transactions with the categoryID.
 * Returns 0 if :
 *      1. Invalid userID is provided.
 *      2. catetogoryID is not associated with user transactions.
 *      3. There are no transactions associated with userID.
 */
const getSpentAmount = async(userID, categoryID) =>{
    
    const user = await User.findOne({_id : userID});
    const transactions = await budgetTransactions(userID,categoryID); 
    var spentAmount = 0;
    if(user && categoryID && transactions[0]){
        transactions.forEach((transaction) =>{
            if(transaction.categoryID == parseInt(categoryID) &&
                transaction.type == parseInt(0)){
                spentAmount += parseFloat(transaction.amount);
               
            }
        })
    }
    return await dollarfy(spentAmount);
}

const searchBudget= async(userID, search,type) =>{
    try{
        
        if(type == 0){
            return await Budget.find({
                $and: [{
                    $or: [{
                            amount: search
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
            return await Budget.find({userID : userID, _id : search})
        }
        else if (type == 2){
            return await Budget.find({userID : userID, createdAt : new Date(search)})
        }
        else {
            return await Budget.find({userID : userID})
                               .where({ $or: [ 
                                        
                                            { name : { $regex: new RegExp(search, "i")} },
                                            { category : { $regex:  new RegExp(search, "i")} },
                                            { description : { $regex:  new RegExp(search, "i")} } 
                                        ] 
                                })
                                    
        }
    }catch(error){
        console.log(error);
    }

}
module.exports = {addBudget, getBudget,getBudgetList, removeBudget, updateBudgetName,
                 updateBudget, updateBudgetAmount, updateBudgetCategory, getSpentAmount,
                 searchBudget,
                };