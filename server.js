/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const session = require("express-session")
const pool = require('./database/')
const bodyParser = require("body-parser")


const express = require("express")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const expressLayouts = require("express-ejs-layouts")
const baseController = require("./controllers/baseController")
const utilities = require("./utilities/")
const invController = require("./controllers/invController")
const errorController = require("./controllers/errorController")
const accountController = require("./controllers/accountController")


/* ***********************
 * Middleware
 * ************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root


/* ***********************
 * Routes
 *************************/
app.use(static)
app.use('/inv', require('./routes/inventoryRoute'))
app.use('/trigger-error', require('./routes/errorRoute'))
app.use('/account', require('./routes/accountRoute'))

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})

// Index Route
app.get("/", utilities.handleErrors(baseController.buildHome));
// Inventory Routes
app.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
app.get("/detail/:invId", utilities.handleErrors(invController.buildByInvId));
// Error Route
app.get("/trigger-error", utilities.handleErrors(errorController.triggerError));
// Login Route
app.get("/account/login", utilities.handleErrors(accountController.buildLogin));
// Register Route
app.get("/account/register", utilities.handleErrors(accountController.buildRegister));

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})



// Error Handling Middleware should be placed last
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();

  console.error(`Error at: "${req.originalUrl}": ${err.message}`);

  let message = err.message || 'An unexpected error occurred.';
  const title = err.status || 'Server Error';

  if (err.status === 404) {
    message = message || 'Sorry, we could not find that page.';
  } else if (err.status === 500) {
    message = message || 'Oh no! There was a server crash. Please try again later.';
  }

  // Render the error page
  res.status(err.status || 500).render("errors/error", {
    title,
    message,
    nav,
  });
});
