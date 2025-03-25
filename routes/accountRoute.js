// Needed Resources 
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")

// Route to build the login view
router.get("/account/login", accountController.buildLogin);

// Route to build the register view
router.get("/account/register", accountController.buildRegister);

// Route to register an account
router.post('/register', utilities.handleErrors(accountController.registerAccount))



module.exports = router;