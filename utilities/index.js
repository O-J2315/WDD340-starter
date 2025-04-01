const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  console.log(data.rows)
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}


/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
    let grid
    if(data.length > 0){
      grid = '<ul id="inv-display">'
      data.forEach(vehicle => { 
        grid += '<li>'
        grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
        + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
        + 'details"><img src="' + vehicle.inv_thumbnail 
        +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
        +' on CSE Motors" /></a>'
        grid += '<div class="namePrice">'
        grid += '<hr />'
        grid += '<h2>'
        grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
        grid += '</h2>'
        grid += '<span>$' 
        + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
        grid += '</div>'
        grid += '</li>'
      })
      grid += '</ul>'
    } else { 
      grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
  }




  // Build the item detail view HTML
  Util.buildItemDetail = async function(data){
    let item = '';
    console.log(data);

    if(data.length > 0){
        // First div: Image of the car
        item += '<div class="inv-display">';
        item += '<div id="inv-image">';
        item += '<img src="' + data[0].inv_image + '" alt="Image of ' 
        + data[0].inv_make + ' ' + data[0].inv_model + ' on CSE Motors" />';
        item += '</div>';

        // Second div: Car details
        item += '<div id="inv-details">';
        item += '<div class="name">';
        item += '<h2>' + data[0].inv_make + ' ' + data[0].inv_model + ' (' + data[0].inv_year + ')</h2></div>';
        item += '<p><strong>Sales Price:</strong> $' + new Intl.NumberFormat('en-US').format(data[0].inv_price) + '</p>';
        item += '<p><strong>Classification:</strong> ' + data[0].classification_name + '</p>';
        item += '<p><strong>Mileage:</strong> ' + new Intl.NumberFormat('en-US').format(data[0].inv_miles) + ' miles</p>';
        item += '<p><strong>Color:</strong> ' + data[0].inv_color + '</p>';
        item += '<p><strong>Description:</strong> ' + data[0].inv_description + ' miles</p>';
        
        item += '<div class="line"></div>';
        // Third div: Buttons
        item += '<div class="inv-buttons">';
        item += '<button id="buy-now">Buy It Now</button>';
        item += '<button id="ask-question">Ask a Question</button>';
        item += '</div>'; // End of inv-buttons div

        item += '</div>'; // End of inv-details div
        item += '</div>'; // End of inv-display div
    }
    else {
        item += '<p class="notice">Sorry, that vehicle could not be found.</p>';
    }

    return item;
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => {
  // Wrapping the function call in a Promise to ensure errors are caught
  Promise.resolve(fn(req, res, next)).catch(next);
};


// Build the list of all classifications
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.loggedin = 1
     next()
    })
  } else {
   next()
  }
 }

 /* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

module.exports = Util