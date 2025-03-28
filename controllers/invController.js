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
    let classificationList = await utilities.buildClassificationList(); // Fetch all classifications

    // Render the add inventory page
    res.render("./inventory/addInventory", {
      title: "Add Inventory", // Title of the page
      nav,
      classificationList, // Pass the classification list to the view
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

console.log('regResult')
console.log(regResult)

  if (regResult.error) {
    console.log(regResult)
    req.flash("notice", `Sorry, the request could not be completed. ${regResult.error}`)
    res.redirect("/inv/manage")

  } else {
    req.flash(
      "notice",
      `Congratulations, ${classification_name}. Classification added successfully!`
    )
    res.redirect("/inv/manage")
  }
}

// Process Add New Inventory Item
invCont.addInventoryItem = async function (req, res) {
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
    inv_image, // Image from the form
    inv_thumbnail, // Thumbnail from the form
  } = req.body;

  // Default image paths in case no image is uploaded
  const defaultImagePath = 'vehicle_images/no_image_available.jpg';
  const defaultThumbnailPath = 'vehicle_images/no_thumbnail.jpg';

  // Validation for required fields (simple example)
  const errors = {};
  if (!inv_make) errors.inv_make = "Make is required";
  if (!inv_model) errors.inv_model = "Model is required";
  if (!inv_year) errors.inv_year = "Year is required";
  if (!inv_description) errors.inv_description = "Description is required";
  if (!inv_price || inv_price <= 0) errors.inv_price = "Valid price is required";
  if (!inv_miles || inv_miles < 0) errors.inv_miles = "Valid mileage is required";
  if (!inv_color) errors.inv_color = "Color is required";
  if (!classification_id) errors.classification_id = "Please select a classification";

  if (Object.keys(errors).length > 0) {
    // Return to form with errors and sticky data
    let classificationList = await Util.buildClassificationList(classification_id);
    return res.render('inventory/addVehicle', {
      title: 'Add New Vehicle',
      classificationList: classificationList,
      vehicleData: req.body,
      errors: errors // Pass errors back to the form
    });
  }

  // Use the default image paths if no files are uploaded
  const imagePath = inv_image ? inv_image : defaultImagePath;
  const thumbnailPath = inv_thumbnail ? inv_thumbnail : defaultThumbnailPath;

  try {
    // Add the vehicle to the database
    const regResult = await invModel.addInventoryItem({
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
      inv_image: imagePath,
      inv_thumbnail: thumbnailPath
    });

    if (regResult && regResult.rowCount > 0) {
      req.flash("notice", "Vehicle added successfully!");
      return res.redirect("/inv/manage"); // Redirect after successful insert
    } else {
      req.flash("notice", "Failed to add vehicle. Please try again.");
      let classificationList = await Util.buildClassificationList(classification_id);  // Keep the selected classification
      return res.render('inventory/addVehicle', {
        title: 'Add New Vehicle',
        classificationList: classificationList,
        vehicleData: req.body,
        errors: {} // No errors here
      });
    }
  } catch (err) {
    console.error("Error adding vehicle: ", err);
    req.flash("notice", "There was an error processing your request.");
    let classificationList = await Util.buildClassificationList(classification_id);  // Keep the selected classification
    return res.render('inventory/addVehicle', {
      title: 'Add New Vehicle',
      classificationList: classificationList,
      vehicleData: req.body,
      errors: {} // No errors here
    });
  }
};

module.exports = invCont