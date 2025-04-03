const accountModel = require("../models/account-model")

const utilities = require(".")
  const { body, validationResult } = require("express-validator")
  const validate = {}

  /*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
  validate.registationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.
  
      // valid email is required and cannot already exist in the database
      body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists){
          throw new Error("Email exists. Please log in or use different email")
        }
      }),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
    ]
  }

  /* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("account/register", {
        errors,
        title: "Registration",
        nav,
        account_firstname,
        account_lastname,
        account_email,
      })
      return
    }
    next()
  }

  validate.loginRules = () => {
    return [
        // Ensure email is provided and exists in the database
        body("account_email")
            .trim()
            .isEmail()
            // .normalizeEmail()
            .withMessage("A valid email is required.")
            .custom(async (account_email) => {
                const emailExists = await accountModel.checkExistingEmail(account_email);
                if (!emailExists) {
                    throw new Error("Email is not registered.");
                }
            }),

        // Ensure password is provided (No need to enforce strong password rules)
        body("account_password")
            .trim()
            .notEmpty()
            .withMessage("Password is required."),
    ];
};

  validate.checkLoginData = async (req, res, next) => {
    console.log('checking rules')
    console.log(req.body)
    const { account_email, account_password} = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      console.log('errors' + errors)
      let nav = await utilities.getNav()
      res.render("account/login", {
        errors,
        title: "Account M",
        nav,
        account_email,
        account_password,
      })
      return
    }
    next()  
};

validate.updateAccountRules = () => {
  return [
      // First name validation
      body("account_firstname")
          .trim()
          .escape()
          .notEmpty()
          .isLength({ min: 1 })
          .withMessage("Please provide a first name."),

      // Last name validation
      body("account_lastname")
          .trim()
          .escape()
          .notEmpty()
          .isLength({ min: 2 })
          .withMessage("Please provide a last name."),

      // Email validation (ensure it's valid and doesn't belong to another user)
      body("account_email")
          .trim()
          .isEmail()
          .normalizeEmail()
          .withMessage("A valid email is required.")
          .custom(async (account_email, { req }) => {
            // Get the account data based on the account_id
            const currentAccount = await accountModel.getAccountById(req.body.account_id);
            
            // If account data is found
            if (currentAccount) {
                // If the email has changed and is now being used by another account
                if (currentAccount.account_email !== account_email) {
                    const existingAccount = await accountModel.getAccountByEmail(account_email); // Use getAccountByEmail function to check if the email exists
                    
                    if (existingAccount) {
                        // If the email is in use by another account, throw an error
                        throw new Error("Email already in use. Please use a different email.");
                    }
                }
                return true; // No errors, proceed with the update
            }
        
            throw new Error("Account not found."); // If no account is found with the given account_id
        }),

      // Hidden account ID validation
      body("account_id")
          .trim()
          .notEmpty()
          .withMessage("Invalid account ID."),
  ];
};


validate.checkUpdateData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email, account_id } = req.body;
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
      let nav = await utilities.getNav();
      let accountData = await accountModel.getAccountByEmail(account_email); // Fetch account data for repopulation

      res.render("account/update", {
          errors,
          title: "Update Account",
          nav,
          account_firstname,
          account_lastname,
          account_email,
          accountData, // Pass accountData to keep other values
      });
      return;
  }
  next();
};

validate.passwordUpdateRules = () => {
  return [
      body("new_password")
          .trim()
          .notEmpty()
          .isStrongPassword({
              minLength: 12,
              minLowercase: 1,
              minUppercase: 1,
              minNumbers: 1,
              minSymbols: 1,
          })
          .withMessage("Password must be at least 12 characters, including 1 uppercase letter, 1 number, and 1 special character."),
      
      body("confirm_password")
          .trim()
          .custom((value, { req }) => {
              if (value !== req.body.new_password) {
                  throw new Error("Passwords do not match.");
              }
              return true;
          })
  ];
};

validate.checkPasswordData = async (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
      let nav = await utilities.getNav();
      return res.status(400).render("account/update", {
          title: "Update Password",
          nav,
          errors,
          account_id: req.body.account_id,
      });
  }
  next();
};
  
  module.exports = validate