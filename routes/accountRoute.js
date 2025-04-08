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

//Route to the update account request
router.post('/update', regValidate.updateAccountRules(), regValidate.checkUpdateData, utilities.handleErrors(accountController.updateAccount))

//Route to the password change request
router.post(
  "/update-password",
  utilities.checkLogin, // Ensure user is logged in
  regValidate.passwordUpdateRules(), // Validate password strength
  regValidate.checkPasswordData, // Handle validation errors
  accountController.updatePassword // Process password change
);


//Route to get an account list
router.get('/getAccountList', utilities.checkLogin, utilities.handleErrors(accountController.getAccountListJSON))

//build the account management view
router.get('/manage', utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement))

//Route to delete an account
router.get('/delete/:account_id', utilities.checkLogin, utilities.handleErrors(accountController.deleteAccount))

module.exports = router;