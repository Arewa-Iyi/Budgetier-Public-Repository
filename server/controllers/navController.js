 /**
 * Name : Arewa (Morountudun) Ojelade
 * Date : 3/4/2025
 * File Name: navController.js
 * Course : CMSC 495 Capstone in Computer Science
 * Project : Budgetier Capstone Project
 * Description : The purpose of the navController.js file is to 
 * execute appropriate logic in accordance with requests for the 
 * home, login, and registration framework of the Budgetier application.
 *
 * Update 5/21/2025 
 * Removed express session handling.
 * Restructured with internal database Session handling.
 */

const {validateInputs} = require('../../public/js/validate.js');
const {loginUser, getUser, addUser} = require('../../db/user.js');
const {createSession, endSession} = require('../../db/session.js')
const os = require('os');
const hostname = os.hostname();
// Display home page
exports.home = async(req,res) =>{
    res.render("home.ejs");
}

// Display login page
exports.login = async(req, res)=>{
    res.render("login.ejs",{
        emailerror : "",
        entryerror : ""
    });
}

// Display registration page
exports.register = async(req, res) =>{
    res.render("register.ejs",{
        firsterror :  "",
        lasterror :  "",
        emailerror : "",
        entry1error :  "",
        entry2error : "",
    });
}

// Handle post request to login user
exports.loginPost = async(req, res)=>{
    const {email, entry} = req.body;
 

    // Validate user login credentials 
    const user = await loginUser(email, entry);
     if(user){
        
        // create and authenticate user session with 
        // internal database Session structure.
        await createSession(user._id, hostname, true);
        res.redirect('/dashboard');
    }
    else{
        // If user email exists in database display password error msg
        if(await getUser(email)){
            res.render("login.ejs",{
                emailerror : "",
                entryerror : "Incorrect Password."
            });
        }
        else{
            // Display email error msg
            res.render("login.ejs",{
                emailerror : "Email does not exist.",
                entryerror : ""
            }); 
        }
    }
}

// Logout user and clear session
exports.logout = async(req, res) =>{
    await endSession(hostname);
    res.redirect('/');
}

// Handle post request to register user
exports.registerPost = async(req, res) =>{

    // For grading purposes
    res.redirect('/login')    

    // Retrieve registration information
    const data = {
        first : req.body.firstname,
        last : req.body.lastname,
        email : req.body.email,
        entry1 : req.body.entry1,
        entry2 : req.body.entry2
    }
    // Validate user information
    let valid = await validateInputs(data.first, data.last,
                    data.email, data.entry1, data.entry2);
    /* If user input is valid and email provided is valid and
     * email does not exist in database, create a new user.
     */
    if(valid.result){
        if(!(await getUser(data.email))){
            await addUser(data.first, data.last, data.email, data.entry2);
            res.redirect('/login');
        }
        else{  // If email exists display error msg
            res.render("register.ejs",{
                firsterror : "",
                lasterror : "",
                emailerror : "Email already exists.",
                entry1error : "",
                entry2error : "",
            }); 
        }

    } 
    else{  // Redirect to registration page with error message
        res.render("register.ejs",{
            firsterror : valid.first,
            lasterror : valid.last,
            emailerror : valid.email,
            entry1error : valid.entry1,
            entry2error : valid.entry2,
        });
    }
}
