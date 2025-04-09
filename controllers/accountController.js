const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { logout } = require("lint/utils/user")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
      errors: null
    })
  }

  /* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null
    })
  }

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body
  console.log(req.body)

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    console.log(regResult)
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}


/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  console.log('account login accessed')
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  console.log('1')
  if (!accountData) {
    console.log("Please check your credentials and try again")
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      console.log('everything fine')
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")  
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

// Build the account home page
async function buildAccountHome(req, res, next) {
  // Get navigation data
  let nav = await utilities.getNav();
  
  // Check if user is logged in and account data is available
  console.log(res.locals.loggedin)
  if (res.locals.loggedin === 1) {
    // Pass account data to the view for rendering
    res.render("account/", {
      title: "Account Management",
      nav,
      errors: null,
      loggedin: res.locals.loggedin,
      accountData: res.locals.accountData // Pass account data here
    });
  } else {
    // If not logged in, redirect to login page
    res.redirect("/account/login");
  }
}

async function accountLogout(req, res) {
  res.clearCookie('jwt');
  
  // Optionally, redirect the user or render a page
  res.redirect('/');
}


// buildAccountUpdate
// Build the account home page
async function buildAccountUpdate(req, res, next) {
  // Get navigation data
  let nav = await utilities.getNav();
  
  // Check if user is logged in and account data is available
  console.log(res.locals.loggedin)
  if (res.locals.loggedin === 1) {
    // Pass account data to the view for rendering
    res.render("account/update", {
      title: "Account Management",
      nav,
      errors: null,
      loggedin: res.locals.loggedin,
      accountData: res.locals.accountData // Pass account data here
    });
  } else {
    // If not logged in, redirect to login page
    res.redirect("/account/login");
  }
}

//Process the account update
async function updateAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_id } = req.body;

  try {
      const updateResult = await accountModel.updateAccount(
          account_firstname,
          account_lastname,
          account_email,
          account_id
      );

      if (updateResult) {
          const resultData = await accountModel.getAccountById(account_id)
          const nav = await utilities.getNav()

          if (resultData) {
            // Store the updated account info in session (if using sessions)
            req.session.accountData = resultData;
            
            // res.locals if needed immediately
            res.locals.accountData = resultData;
        }


          req.flash("notice", `Your account information has been updated successfully, ${account_firstname}.`);
          return res.render("account/", {
            title: 'Account Management',
            errors: null,
            nav,
            accountData: resultData
          });
      } else {
          req.flash("notice", "Sorry, the update failed.");
          res.status(500).render("account/update", {
              title: "Update Account",
              nav,
              errors: null,
              account_firstname,
              account_lastname,
              account_email,
              account_id,
          });
      }
  } catch (error) {
      console.error("Error updating account:", error);
      req.flash("notice", "An unexpected error occurred. Please try again.");
      res.status(500).render("account/update", {
          title: "Update Account",
          nav,
          errors: null,
          account_firstname,
          account_lastname,
          account_email,
          account_id,
      });
  }
}

//Process the password change request
async function updatePassword(req, res) {
  let nav = await utilities.getNav();
  const { new_password, account_id } = req.body;

  try {
      // Hash the new password
      const hashedPassword = await bcrypt.hash(new_password, 10);

      // Update the password in the database
      const updateResult = await accountModel.updateAccountPassword(hashedPassword, account_id);

      if (updateResult) {
          req.flash("notice", "Your password has been updated successfully.");
          return res.redirect("/account/");
      } else {
          req.flash("notice", "Sorry, the password update failed.");
          return res.status(500).render("account/update", {
              title: "Update Password",
              nav,
              errors: null,
              account_id,
          });
      }
  } catch (error) {
      console.error("Error updating password:", error);
      req.flash("notice", "An unexpected error occurred. Please try again.");
      return res.status(500).render("account/update", {
          title: "Update Password",
          nav,
          errors: null,
          account_id,
      });
  }
}


/* ***************************
 *  Return Eomloyee and customer accounts list
 * ************************** */
async function getAccountListJSON(req, res) {
  try {
    const accountList = await accountModel.getAccountListJSON()
    res.json(accountList)
  } catch (error) {
    console.error("Error fetching account list:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

//Build account management view
async function buildAccountManagement(req, res) {
  let nav = await utilities.getNav()
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
  })
}

async function deleteAccount(req, res) {
  const account_id = req.params.account_id
  try {
    const result = await accountModel.deleteAccount(account_id)
    if (result) {
      req.flash("notice", "Account deleted successfully.")
      res.redirect("/account/manage")
    } else {
      req.flash("notice", "Failed to delete the account.")
      res.redirect("/account/manage")
    }
  } catch (error) {
    console.error("Error deleting account:", error)
    req.flash("notice", "An error occurred while deleting the account.")
    res.redirect("/account/manage")
  }
}

async function buildConfirmDelete(req, res) {
  const account_id = req.params.account_id
  let nav = await utilities.getNav()
  const accountData = await accountModel.getAccountById(account_id)
  if (!accountData) {
    req.flash("notice", "Account not found.")
    return res.redirect("/account/manage")
  }
  res.render("account/delete-confirm", {
    title: "Confirm Delete",
    nav,
    errors: null,
    accountData: accountData,
  })
}
  
  module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountHome, accountLogout, buildAccountUpdate, updateAccount, updatePassword, getAccountListJSON, buildAccountManagement, deleteAccount, buildConfirmDelete }