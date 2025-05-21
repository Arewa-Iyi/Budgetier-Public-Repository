/**
 * Name : Arewa (Morountudun) Ojelade
 * Date : 3/4/2025
 * File Name: transaction.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Budgetier Capstone Project
 * Description : The purpose of the transaction.js file is to provide 
 * compact functions to interact with the Transcaction collection of
 * the Budgetier Accounts database.
 */

//const connectDB = require("./dbconnect.js"); connectDB();
const Category = require("./models/Category.js");
const Transaction = require("./models/Transaction.js");
const Budget = require("./models/Budget.js");
const { getSpentAmount } = require('./budget.js');
const User = require("./models/User.js");
const { transactions } = require("../server/controllers/userController.js");
const names = ["All", "Transportation", "Housing", "Vehicle", "Life & Entertainment",
    "Utilities", "Food & Drinks", "Physical Upkeep", "Medical & Healthcare",
    "Personal", "Pets", "Professional Development", "Income", "Investments"];
/**
 * Function to control precision of monetary values.
 * 
 * @param {Double} amount - The parameterized value.
 * @returns {Double}  The value with a precision of 2 following the decimal point.
 */
const dollarfy = async (amount) => {
    return parseInt(amount * 100) / 100;
}

/**
 * Function to add a transaction to the Transaction collection of the 
 * Budgetier Accounts database. The transactionList array in the 
 * User collection is updated with the unique transaction _id.
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {Double} amount - The transaction amount.
 * @param {Int32} type - {Expense : 0, Income : 1} The bit interpretation of the transaction type.
 * @param {Date} date - The transaction date.
 * @param {Int32} categoryID - The categoryID that categorizes the transaction. 
 * @returns {Object} The  created instance of the transaction object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. Invalid amount is provided. (Positive values only)
 *      3. Type is not {Expense : 0, Income : 1} The bit interpretation of transaction type.
 */

const addTransaction = async (userID, amount, type, categoryID = 0,
    description = "", date = Date.now()) => {
    try {
        type = parseInt(type);
        category = parseInt(categoryID);
        const user = await User.findOne({ _id: userID });
        if (user && amount > 0 && (type == 0 || type == 1)) {

            const category_exist = await Category.findOne({ categoryID: categoryID });
            if (!category_exist) {
                categoryID = 0;
            }
            const transaction = await Transaction.create({
                userID: user._id,
                amount: await (dollarfy(parseFloat(amount))),
                type: type,
                date: new Date(date),
                categoryID: categoryID,
                category: names[categoryID],
                description: description
            });

            // Updates transactionList with created transtion _id.
            user.transactionList.push(transaction._id);

            // Increments/Decrements totalAmount in accordance with type.
            user.totalAmount = (transaction.type == 0) ?
                user.totalAmount - transaction.amount :
                user.totalAmount + transaction.amount;
            user.totalAmount = await dollarfy(user.totalAmount);


            // if transaction's categoryID is in budgetCategories,
            // update associated budget spent amount.
            if (user.budgetCategories) {
                var set = new Set(user.budgetCategories);
                if (set.has(categoryID)) {
                    await updateBudgetSpentAmount(userID, categoryID);
                }
            }

            await user.save();
            await transaction.save();
            return transaction;

        }
    } catch (error) { console.log("Error : Transaction not added."); }
    return null
}

/**
 * Function to update spent amount in budgets with parameterized categoryID
 * in the Budget collection of the  Budgetier Accounts database. 
 * @param {String} userID - The unique _id of the associated User instance.
 * @param {Int32} categoryID - The new categoryID that categorizes the budget.  
 * 
 */
const updateBudgetSpentAmount = async (userID, categoryID,) => {
    
    var budget  = await Budget.updateOne(
        { userID: userID, categoryID: categoryID },
        { spentAmount: await getSpentAmount(userID, categoryID) }
    );
    console.log("updating budget : ", budget)
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
const updateTransaction = async (userID, transactionID, amount, type, categoryID = 0, description = '', date = Date.now()) => {
    try {
        const user = await User.findOne({ _id: userID });
        const index = user.transactionList.indexOf(transactionID);

        if (user && index >= 0) {
            const transaction = await Transaction.findOne({ _id: transactionID });
            const oldCategoryID = transaction.categoryID
            if (transaction) {
                console.log("updating Transaction")
                if (transaction.type != type)
                    await updateTransactionType(userID, transactionID, type);
                if (transaction.amount != amount)
                    await updateTransactionAmount(userID, transactionID, amount);
                if (oldCategoryID != categoryID)
                    await updateTransactionCategory(userID, transactionID, categoryID);
                if (transaction.description != description)
                    transaction.set('description', description);
                if (transaction.date != date)
                    transaction.set('date', new Date(date));

                // update spent amount for budgets with old and new categoryIDs
                await updateBudgetSpentAmount(userID, oldCategoryID);
                await updateBudgetSpentAmount(userID, categoryID);


                transaction.save();
                return transaction;
            }
        }
    } catch (error) {
        console.log(error);
    }
    return null;
}

/**
 * Function to remove a transaction from the Transaction collection of the 
 * Budgetier Accounts database. The unique transaction _id of the transaction
 * is removed from the transactionList array in the User collection.
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} transactionID - The unique _id of the transaction. 
 * @returns {Object} The removed instance of the transaction object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. transactionID is not associated with the User instance provided.
 */
const removeTransaction = async (userID, transactionID) => {

    const user = await User.findOne({ _id: userID });
    const index = user.transactionList.indexOf(transactionID);

    if (user && index >= 0) {
        const transaction = await Transaction.findOne({ _id: transactionID });
        const type = transaction.type;
        const amount = transaction.amount;
        // Creates a final copy of transaction
        const finalCopy = JSON.parse(JSON.stringify(transaction));
        // Deletes the original copy of transaction
        await Transaction.deleteOne({ _id: transactionID });
        // Removes transaction _id from transactionList.
        user.transactionList.splice(index, 1);
        // Increments/Decrements totalAmount in accordance with type.
        user.totalAmount = (type == 0) ?
            user.totalAmount + amount :
            user.totalAmount - amount;
        user.totalAmount = await dollarfy(user.totalAmount);
        await user.save();
        return transaction;
    }
    return null
}
/**
 * Function to retrieve stringified current month transaction list  
 * associated with the provided userID from the Transaction collection of the 
 * Budgetier Accounts database. The list will be converted to csv and exported.
 * @param {String} userID - The unique _id of the associated User instance. * 
 * @returns {Object} The list of all current month trascations with userID.
 * Returns null if :
 *      1. Invalid userID is provided.
 */
const exportTransctionList = async (userID) => {
    let date = new Date(Date.now());
    let cMonth = (((date).toUTCString()).split(" "))[2];
    let cYear = date.getFullYear();
    let start = new Date(`${date.getFullYear()}-1-${date.getMonth()}-`);

    var transactions = await Transaction.find({ userID: userID, date: { $gte: start } })
        .sort({ date: -1 })
        .select(['amount', 'date', 'type', 'category'])
        .exec()



    var list = JSON.parse(JSON.stringify(transactions));
    var exportList = [];
    let index = 0;
    list.forEach(async (transaction) => {
        let tMonth = (((transactions[index].date).toUTCString()).split(" "))[2];
        let tYear = (transactions[index].date).getFullYear();

        if (cMonth == tMonth && cYear == tYear) {
            
            transaction.type = (transaction.type == 1) ? "Income" : "Expense";
            transaction.date = new Date(transaction.date).toUTCString();
            exportList.push(transaction);
        }
        index++;
    });
    return exportList;
}
/**
 * Function to retrieve a transaction from the Transaction collection of the 
 * Budgetier Accounts database. The unique transaction _id of the transaction
 * must be associated with the transactionList array in the specified User collection.
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} transactionID - The unique _id of the transaction. 
 * @returns {Object} The instance of the transaction object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. transactionID is not associated with the User instance provided.
 */
const getTransaction = async (userID, transactionID) => {
    const user = await User.findOne({ _id: userID });
    const index = user.transactionList.indexOf(transactionID);

    if (user && index >= 0) {
        const transaction = await Transaction.findOne({ _id: transactionID });
        return transaction;
    }
    return null;
}
/**
 * Function to retrieve a transaction list associated with the
 * provided userID from the Transaction collection of the 
 * Budgetier Accounts database. 
 * @param {String} userID - The unique _id of the associated User instance. * 
 * @param {INT32} page - The current page displayed.
 * @param {INT32} perPage - The number of elements displayed per page.
 * @returns {Object} The list of all trascations associated with userID.
 * Returns null if :
 *      1. Invalid userID is provided.
 */
const getTransactionList = async (userID, page = 0, perPage = 0) => {
    const user = await User.findOne({ _id: userID });
    if (user) {
        var transaction;
        if (page === 0) {
            transaction = await Transaction.find({ userID: userID }).sort({ date: -1 });

        }
        else {
            transaction = await Transaction.find({ userID: userID }).sort({ date: -1 })
                .skip(perPage * page - perPage)
                .limit(perPage)
                .exec();
        }
        return transaction;
    }
    return null;
}
/**
 * Function to change a transaction's type in the Transaction collection 
 * of the Budgetier Accounts database. 
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} transactionID - The unique _id of the transaction. 
 * @param {Int32} newType - {Expense : 0, Income : 1} The bit interpretation of the transaction type.
 * @returns {Object} The updated instance of the transaction object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. transactionID is not associated with the User instance provided.
 *      3. Type is not {Expense : 0, Income : 1} The bit interpretation of transaction type.
 *      4. Transaction type is unchanged.
 * 
 */
const updateTransactionType = async (userID, transactionID, newType) => {
    newType = parseInt(newType);

    const user = await User.findOne({ _id: userID });
    const index = user.transactionList.indexOf(transactionID);
    if (user && index >= 0 && (newType == 0 || newType == 1)) {

        const transaction = await Transaction.findOne({ _id: transactionID });
        if (transaction.type != newType) {
            transaction.set('type', newType);
            // Resets and increments/decrements total amount in accordance with type.
            user.totalAmount = (transaction.type == 0) ?
                user.totalAmount - (transaction.amount * 2) :
                user.totalAmount + (transaction.amount * 2);
            user.totalAmount = await dollarfy(user.totalAmount);
            await user.save();
            await transaction.save();
            return transaction;
        }
    }
    return null;

}
/**
 * Function to change a transaction's amount in the Transaction collection 
 * of the Budgetier Accounts database. 
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} transactionID - The unique _id of the transaction. 
 * @param {Double} newCategoryID - The new categoryId that categorizes the object.
 * @returns {Object} The updated instance of the transaction object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. Invalid categoryID is provided.
 *      3. transactionID is not associated with the User instance provided.
 */
const updateTransactionCategory = async (userID, transactionID, newCategoryID) => {
    newCategoryID = parseInt(newCategoryID);
    const user = await User.findOne({ _id: userID });
    const index = user.transactionList.indexOf(transactionID);
    const category = await Category.findOne({ categoryID: newCategoryID });

    if (user && category && index >= 0) {
        const transaction = await Transaction.findOne({ _id: transactionID });
        if (transaction.categoryID != newCategoryID) {
            transaction.set('categoryID', newCategoryID);
            transaction.set('category', names[newCategoryID]);
            await transaction.save();
        }
        return transaction;
    }
    return null;
}

/**
 * Function to change a transaction's amount in the Transaction collection 
 * of the Budgetier Accounts database. 
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} transactionID - The unique _id of the transaction. 
 * @param {Double} newAmount - The updated transaction amount.
 * @returns {Object} The updated instance of the transaction object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. Invalid amount is provided. (Positive values only)
 *      3. transactionID is not associated with the User instance provided.
 */
const updateTransactionAmount = async (userID, transactionID, newAmount) => {
    newAmount = parseFloat(newAmount);
    const user = await User.findOne({ _id: userID });
    const index = user.transactionList.indexOf(transactionID);

    if (user && newAmount > 0 && index >= 0) {
        const transaction = await Transaction.findOne({ _id: transactionID });
        var previousAmount = transaction.amount;
        var currentTotal = user.totalAmount;
        /* If transaction is an expense reset totalAmount by incrementing 
         * previous transaction ammount, then decrement totalAmount with updated 
         * transaction amount.
         */
        if (previousAmount != newAmount) {
            var updatedAmount = (transaction.type == 0) ?
                currentTotal + previousAmount - newAmount :
                currentTotal - previousAmount + newAmount;


            /* Else, transaction is income. Reset totalAmount by decrementing 
            * previous transaction ammount, then increment totalAmount with updated 
            * transaction amount.
            */

            // Update and save trasaction and user instance.
            user.set('totalAmount', await dollarfy(updatedAmount));
            transaction.set('amount', await dollarfy(newAmount));
            await user.save();
            await transaction.save();
        }
        return transaction;
    }
    return null;
}

/**
 * Function to change a transaction's date in the Transaction collection 
 * of the Budgetier Accounts database. 
 * @param {String} userID - The unique _id of the associated User instance. 
 * @param {String} transactionID - The unique _id of the transaction. 
 * @param {Date} newDate - The updated transaction date.
 * @returns {Object} The updated instance of the transaction object.
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. transactionID is not associated with the User instance provided.
 */
const updateTransactionDate = async (userID, transactionID, newDate) => {

    const user = await User.findOne({ _id: userID });
    const index = user.transactionList.indexOf(transactionID);
    if (user && index >= 0) {
        const transaction = await Transaction.findOne({ _id: transactionID });
        if (transaction.date != newDate) {
            transaction.set('date', new Date(newDate));
            await transaction.save();
        }
        return transaction;
    }
    return null;
}
/**
 * Function to retrieve transaction instances mathing search and type criteria 
 * in the Transaction collection of the Budgetier Accounts database. 
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
const searchTransaction = async(userID, search,type) =>{
   try{
        
        if(type == 0){
            return await Transaction.find({userID : userID, amount : search})
        }
        else if (type == 1){
            return await Transaction.find({userID : userID, _id : search})
        }
        else if (type == 2){
            return await Transaction.find({userID : userID, date : new Date(search)})
        }
        else {
            return await Transaction.find({userID : userID})
                                    .where({ $or: [ 
                                                    { category : { $regex:  new RegExp(search, "i")} },
                                                    { description : { $regex:  new RegExp(search, "i")} } 
                                                ] 
                                    })
                                    .select('_id userID amount type date category description')
                                    
        }
    }catch(error){
        console.log(error);
    }

}
module.exports = {
    addTransaction, getTransaction, getTransactionList, removeTransaction,
    updateTransaction, updateTransactionType, updateTransactionAmount,
    updateTransactionDate, updateTransactionCategory, exportTransctionList,
    searchTransaction
}; 