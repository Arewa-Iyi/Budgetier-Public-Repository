
const Transaction = require("./models/Transaction.js");
const Budget = require("./models/Budget.js");
const Goal = require("./models/Goal.js");
const User = require("./models/User.js");
const {hashed, compareEntry} = require("./helper.js");

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
 * Function to add a user to the User collection of the 
 * Expense Tracer Accounts database.
 * @param {String} firstName - The name of the user. 
 * @param {String} lastName - The name of the user. 
 * @param {String} entry - The string provided to access user account.
 * @param {String} email - The email of the user.
 * @param {Double} amount - The total amount of funds currently available.
 * @returns {Object} The  created instance of the user object.
  * Returns null if :
 *      1. Invalid name/entry/email is provided. (Empty String)
 *      2. Invalid amount is provided (Positive values only)
 */
const  addUser = async (firstName, lastName, email, entry, amount =0)=> {    
    console.log("here");
    var user;
    if(firstName && lastName && entry && email){
        try{
             user = await User.create({
                firstName: firstName,
                lastName : lastName,
                entry : await hashed(entry),
                email : email.toLowerCase(),
                totalAmount : await dollarfy(parseFloat(amount))
            });
            return user;
        }catch(error){
        
           console.log("Invalid entry. User instance is not created.\n",error);
        };
        console.log(user);
   }    
    return null;
}

/**
 * Function to find a user instance with an email in the User collection of the 
 * Expense Tracer Accounts database.
 * @param {String} email - The current email of the User instance.
 * @returns {Object} The instance of the associated user object.
 * Returns null if User collection is unassociated with email provided.
 */
const getUser = async(email) => {
    email = email.toLowerCase();
    const user = await User.findOne({email : email});
    if(user){
        return user;
    }
    return null;
}

/**
 * Function to find a user instance with unique _id in the User collection of the 
 * Expense Tracer Accounts database.
 * @param {String} userID - The unique id of the User instance. 
 * @returns {Object} The instance of the associated user object.
 * Returns null if User collection is unassociated with email provided.
 */
const findUser = async(userID) => {
    const user = await User.findOne({_id : userID});
    if(user){
        
        return user;
    }
    return null;
}
const updateUser = async(userID, firstName, lastName, email, totalAmount) => {
    const user = await User.findOne({_id : userID});
    if(user){
        console.log(firstName,lastName,email,totalAmount);
        user.set('firstName', firstName);
        user.set('lastName', lastName);
        user.set('email', email);
        user.set('totalAmount', await dollarfy(totalAmount));
        await user.save();
        return user;
    }
    return null;
}
/**
 * Function to confirm login of a user instance in the User collection of the 
 * Expense Tracer Accounts database.
 * @param {String} email - The current email of the User instance.
 * @param {String} entry - The string provided to access user account.
 * @returns {Object} An array in the following indices:
 *                  0. The instance of the associated user object.
 *                  1. The transaction objects associated with the user.
 *                  2. The budget objects associated with the user.
 *                  3. The goal objects associated with the user.
 * Returns null if:
 *      1. User collection is unassociated with email provided.
 *      2. Invalid entry is provided. (Current entry mismatch)
 */
const loginUser = async(email, entry) => {
   
    if(email && entry){
        email = email.toLowerCase();
        var user = await User.findOne({email : email});
        if(user && await compareEntry(entry, user.entry)){    
            return user;
        }
    }
    
    return null;
}
/**
 * Function to update the toatal amount in the User collection of the 
 * Expense Tracer Accounts database.
 * @param {String} userID - The unique id of the User instance. 
 * @param {Double} newAmount - The updated total amount currently available.
 * @returns {Object} The updated instance of the user object. 
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. Invalid amount is provided (Positive values only)
 */
const updateTotalAmount = async(userID, newAmount)=>{
    try{
        const user = await User.findById(userID).exec();
        if(user && newAmount > 0){
            user.totalAmount = await dollarfy(parseFloat(newAmount));
            await user.save();
            return user;
        }
    }catch(error){console.log("Error: Total amount not updated.")}
    return null;
}

/**
 * Function to update the user's name in the User collection of the 
 * Expense Tracer Accounts database.
 * @param {String} userID - The unique id of the User instance. 
 * @param {String} newName - The updated name.
 * @returns {Object} The updated instance of the user object. 
  * Returns null if :
 *      1. Invalid userID is provided.
 *      2. Invalid newName is provided. (Empty String)
 */
const updateName = async(userID, newFirst, newLast)=> {
    const user = await User.findById(userID).exec();
    if(user && newName){
        user.firstName = newFirst;
        user.lastName = newLast;
        await user.save();
        return user;
    }
    return null;

}

/**
 * Function to update the user's email in the User collection of the 
 * Expense Tracer Accounts database.
 * @param {String} userID - The unique id of the User instance. 
 * @param {String} oldEmail - The current email of the User instance.
 * @param {String} newEmail - The updated email of the User instance.
 * @returns {Object} The updated instance of the user object. 
 * Returns null if :
 *      1. Invalid userID is provided.
 *      2. Invalid newEmail is provided. (Empty String)
 *      3. Unassociated email is provided.
 */
const updateEmail = async (userID, oldEmail, newEmail) => { 
    oldEmail = oldEmail.toLowerCase();
    newEmail = newEmail.toLowerCase();   
    const user = await User.findOne({_id : userID}).where("email").equals(oldEmail);
    console.log(user);
    if(user && newEmail){
        try{
            user.email = newEmail;
            await user.save();
            return user;
        }catch(error){
            return null;
        }
    }
    return null;
}

/**
 * Function to update credentials of a user instance in the User collection of the 
 * Expense Tracer Accounts database.
 * @param {String} userID - The current unique id of the User instance.
 * @param {String} oldEntry - The current string to access user account.
 * @param {String} newEntry - The updated string provided to access user account.
 * @returns {Object} The pudated instance of the associated user object.
 * Returns null if:
 *      1.  User collection is unassociated with id provided.
 *      2.  Invalid oldEntry is provided. (Current entry mismatch)
 *      3. Invalid newEntry is provided. (Empty String)
 */
const updateEntry = async(userID, oldEntry, newEntry) => {
    const user = await User.findOne({_id : userID});
    if(await loginUser(user.email, oldEntry) && newEntry){
        user.set('entry', await hashed(newEntry));
        await user.save();
        return user;
    }
    return null;
}

module.exports = {addUser, updateUser, findUser, getUser, loginUser, updateEmail,
                  updateEntry, updateTotalAmount, updateName
};


