const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);

    // Check if data exists and is not empty
    if (!data || data.length === 0) {
      return next({ status: 404, message: "Oops! Unfortunately We don't sell that type of cars!" });
    }

    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();
    const className = data[0].classification_name || 'Unknown Classification';  // Fallback for missing classification_name

    // Render the page with the classification data
    res.render("./inventory/classification", {
      title: `${className} vehicles`,
      nav,
      grid,
    });
  } catch (err) {
    console.error(err);  // Log the error for debugging
    next(err);  // Pass the error to the global error handler
  }
};

// Build the inventory item detail view
invCont.buildByInvId = async function (req, res, next) {
  try {
    const invId = req.params.invId;

    // Fetch the inventory item by ID
    const data = await invModel.getInventoryByItemId(invId);

    // Check if data exists and is not empty
    if (!data || data.length === 0) {
      return next({ status: 404, message: "Oops! Looks like we don't have that car anymore. 🏎️" }); // Send 404 if no data found
    }

    // Prepare item details (assuming buildItemDetail is an async function)
    const item = await utilities.buildItemDetail(data);

    // Get the navigation data
    let nav = await utilities.getNav();

    // Render the detail page
    res.render("./inventory/detail", {
      title: `${data[0].inv_year} ${data[0].inv_make} ${data[0].inv_model}`, // Title of the page
      nav,
      item, // Item details to display on the page
    });

  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Build the inventory management view
invCont.buildInventoryManagement = async function (req, res, next) {
  try {
    // Get the navigation data
    let nav = await utilities.getNav();

    // Render the inventory management page
    res.render("./inventory/management", {
      title: "Inventory Management", // Title of the page
      nav,
    });


  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Build the inventory addClassification view
invCont.buildAddClassification = async function (req, res, next) {
  try {
    // Get the navigation data
    let nav = await utilities.getNav();

    // Render the add classification page
    res.render("./inventory/addClassification", {
      title: "Add Classification", // Title of the page
      nav,
      errors: null,
    });

  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Build the inventory addInventory view
invCont.buildAddInventory = async function (req, res, next) {
  try {
    // Get the navigation data
    let nav = await utilities.getNav();

    // Render the add inventory page
    res.render("./inventory/addInventory", {
      title: "Add Inventory", // Title of the page
      nav,
      errors: null,
    });

  } catch (err) {
    console.error(err);
    next(err);
  }
};


// Process Add New Classification
invCont.addClassification = async function (req, res) {
  let nav = await utilities.getNav()
  const classification_name = req.body.classification_name
  console.log('test')
  console.log(classification_name)

const regResult = await invModel.addClassification(
    classification_name
  )

  if (regResult) {
    console.log(regResult)
    req.flash(
      "notice",
      `Congratulations, ${classification_name}. Classification added successfully!`
    )
    
    res.redirect("/inv/manage")
  } else {
    req.flash("notice", "Sorry, the request could not be completed.")
    res.redirect("/inv/manage")
  }
}

module.exports = invCont