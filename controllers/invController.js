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

    const classificationSelect = await utilities.buildClassificationList()


    // Render the inventory management page
    res.render("./inventory/management", {
      title: "Inventory Management", // Title of the page
      nav,
      classificationSelect,
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
      classificationList: classificationList, // Pass the classification list to the view
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

  const nav = await utilities.getNav();

  // Default image paths in case no image is uploaded
  const defaultImagePath = '/images/vehicles/no-image.png';
  const defaultThumbnailPath = '/images/vehicles/no-image-tn.png';

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

    console.log('regResult')
    console.log(regResult)
    console.log('regResult.rowCount')
    console.log(regResult.rowCount)
    //chech if insert was successful
    // Check if the insert was successful
    // Assuming regResult.rowCount > 0 indicates success

    if (regResult) {
      req.flash("notice", "Vehicle added successfully!");
      return res.redirect("/inv/manage"); // Redirect after successful insert
    } else {
      req.flash("notice", "Failed to add vehicle. Please try again.");
      let classificationList = await utilities.buildClassificationList(classification_id);  // Keep the selected classification
      return res.render('inventory/addInventory', {
        title: 'Add New Vehicle',
        classificationList: classificationList,
        nav,
        errors: {} // No errors here
      });
    }
  } catch (err) {
    console.error("Error adding vehicle: ", err);
    req.flash("notice", "There was an error processing your request.");
    let classificationList = await utilities.buildClassificationList(classification_id);  // Keep the selected classification
    return res.render('inventory/addInventory', {
      title: 'Add New Vehicle',
      classificationList: classificationList,
      nav,
      errors: {} // No errors here
    });
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

//Build Edith inventory by ID
invCont.buildEditById = async (req, res, next) => {
  const inv_id = parseInt(req.params.invId)
  let nav = await utilities.getNav()
  let itemData = await invModel.getInventoryByItemId(inv_id)
  itemData = itemData[0]
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  console.log(itemData.inv_make)
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}


module.exports = invCont