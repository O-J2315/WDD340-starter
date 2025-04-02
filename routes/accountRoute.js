// Needed Resources 
const express = require("express")
const regValidate = require('../utilities/account-validation')
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")

// Route to build the login view
router.get("/account/login", accountController.buildLogin);

// Route to build the register view
router.get("/account/register", accountController.buildRegister);

// Route to register an account
router.post('/register', regValidate.registationRules(), regValidate.checkRegData, utilities.handleErrors(accountController.registerAccount))

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin),
)

router.get('/', utilities.checkLogin, utilities.handleErrors(accountController.buildAccountHome))

// Send the logout request
router.get('/logout', utilities.handleErrors(accountController.accountLogout));

//Get the account update view
router.get('/update', utilities.checkLogin, utilities.handleErrors(accountController.buildAccountUpdate))

module.exports = router;