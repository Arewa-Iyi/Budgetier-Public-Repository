 /**
 * Name : Arewa (Morountudun) Ojelade
 * Date : 3/4/2025
 * File Name: validate.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Budgetier Capstone Project
 * Description : The purpose of the validate.js file is to validate
 * strings passed by the user in order to login or register an account.
 */

/**
 * Function to validate parameterized name.
 * @param {String} name - The string to be validated. 
 * @returns {Object} A document containing validity and error string.
 */
 async function validateName(name){
    var error = "";
    var valid = true;
    if(!name){
        valid = false;
        error = 'name is required.';
    }
    else if(name.length < 2){
        
        valid = false;
        error ='name must be longer than 2 characters.';
    }
    else if(name.length > 30){
        
        valid = false;
        error ='name must be less than 30 characters.';
    }
    let result = {
        valid : valid,
        error : error
    }
    console.log(result);
    return result;
}
/**
 * Function to validate parameterized email.
 * @param {String} email - The string to be validated. 
 * @returns {boolean} boolean of validity.
 */
async function validEmail(email){

    const valid = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(email);
    console.log("In validEmail : " + valid)
    return valid;
}
/**
 * Function to validate parameterized email.
 * @param {String} email - The string to be validated. 
 * @returns {Object} A document containing  validity and error string.
 */
async function validateEmail(email){

    var valid = true;
    var error = "";
    if(!email){ 
        valid = false;        
        error = 'Email is required.';
    }
    if(!validEmail(email)){
        valid = false;   
        console.log("Email is invalid.");
        error = 'Please enter a valid email.';
    }
    let result = {
        valid : valid,
        error : error
    }
    console.log("this is email validity: " + result)
    return result;
}
/**
 * Function to validate parameterized entry string.
 * @param {String} entry - The string to be validated. 
 * @returns {Object} A document containing  validity and error string.
 */
async function validateEntry(entry){
    var valid = true;
    var error = "";
    if(!entry){
        valid = false;        
        error = 'Password is required.';
    }
    else if(entry.length < 8){  
        valid = false;      
        error = 'Password must be at least 8 characters.';
    }
    else if(entry.length > 30){   
        valid = false;     
        error = 'Password must be less than 30 characters.';
    }
    else if(!(/\d/.test(entry))){      
        valid = false;  
        error = 'Password must contain at least 1 digit.';
    }
    else if(!(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(entry))){
        valid = false;
        error = 'Password must contain at least 1 special character';
    }
    let result = {
        valid : valid,
        error : error
    }
    return result;
}
/**
 * Function to validate parameterized entry1 and entry2 strings.
 * @param {String} entry1 - The first string to be validated. 
 * @param {String} entry2 - The second string to be validated. 
 * @returns {Object} A document containing  validity and error string.
 */
async function validateEntry2(entry1,entry2){
    var valid = true;
    var error = "";
    if(!entry2){
        valid = false;        
        error = 'Please confirm your password.';
    }
    else if(entry1 !== entry2){
        valid = false;
        error = 'Passwords do not match.';
    }
    let result = {
        valid : valid,
        error : error
    }
    return result;
}
/**
 * Function to validate parameterized inputs.
 * @param {String} firstValue - The first name string to be validated. 
 * @param {String} lastValue - The last name string to be validated. 
 * @param {String} emailValue - The email string to be validated. 
 * @param {String} entry1Value - The entry1 string to be validated. 
 * @param {String} entry2Value - The entry2 string to be validated. 
 * @returns {Object} A document containing the validity of all inputs,
 *                   and error string for each input.
 */
async function validateInputs (
    firstValue, lastValue, emailValue,
    entry1Value, entry2Value) {
        
    let validity = true;
    let validFirstName = await validateName(firstValue);
    let validLastName = await validateName(lastValue);
    let validEmail = await validateEmail(emailValue);
    let validEntry1 = await validateEntry(entry1Value);
    let validEntry2 = await validateEntry2(entry1Value,entry2Value);
    
    if(!validFirstName.valid){
        validity = false;
        validFirstName.error = "First " +  validFirstName.error;
    }
    if(!validLastName.valid){
        validity = false;
        validLastName.error = "Last " +  validLastName.error;
    }
    if(!validEmail.valid){
        validity = false;
    }
    if(!validEntry1.valid){
        validity = false;
    }
    if(!validEntry2.valid){
        validity = false;
    }
    return {result : validity,
            first :  validFirstName.error,
            last : validLastName.error,
            email : validEmail.error,
            entry1 : validEntry1.error,
            entry2 : validEntry2.error
    }
 }
 module.exports = {validateInputs, validateEmail, validateEntry, validateEntry2};