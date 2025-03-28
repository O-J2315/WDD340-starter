const inventoryModel = require("../models/inventory-model")

const utilities = require(".")
  const { body, validationResult } = require("express-validator")
  const validate = {}

  /*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
  validate.addInvRules = () => {
    return [
      // firstname is required and must be string
      body("inv_make")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a Make Name."), // on error this message is sent.
        
      body("inv_model")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a Model Name."), // on error this message is sent.

      body("inv_year")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 4 })
        .isNumeric()
        .isInt({ min: 1900, max: new Date().getFullYear() })
        .withMessage("Please provide a Year."), // on error this message is sent.

      body("inv_description")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a Description."), // on error this message is sent.

      // body("inv_image")
      //   .trim()
      //   .escape()
      //   .notEmpty()
      //   .isLength({ min: 1 })
      //   .withMessage("Please provide an Image."), // on error this message is sent.

      // body("inv_thumbnail")
      //   .trim()
      //   .escape()
      //   .notEmpty()
      //   .isLength({ min: 1 })
      //   .withMessage("Please provide a Thumbnail."), // on error this message is sent.

      body("inv_price")
        .trim()
        .escape()
        .notEmpty()
        .isNumeric()
        .withMessage("Please provide a Price."), // on error this message is sent.

      body("inv_miles")
        .trim()
        .escape()
        .notEmpty()
        .isNumeric()
        .withMessage("Please provide Miles."), // on error this message is sent.

      body("inv_color")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a Color."), // on error this message is sent.

      body("classification_id")
        .trim()
        .escape()
        .notEmpty()
        .isNumeric()
        .isLength({ max: 1 })
        .withMessage("Please select a Classification."), // on error this message is sent.
    ]
  }

  /* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkInvData = async (req, res, next) => {
    const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      let classificationList = await utilities.buildClassificationList()
      res.render("inventory/addInventory", {
        errors,
        title: "Add Inventory",
        nav,
        classificationList,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id,

      })
      return
    }
    next()
  }
  
  module.exports = validate