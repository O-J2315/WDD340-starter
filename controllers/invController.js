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


module.exports = invCont