const inventoryModel = require("../models/inventory-model")

const utilities = require(".")
  const { body, validationResult } = require("express-validator")
  const validate = {}

  /*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
  validate.registationRules = () => {
    return [
      // firstname is required and must be string
      body("classification_name")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .custom(async (classification_name) => {
          const classificationExists = await inventoryModel.checkClassificationName(classification_name)
          if (classificationExists){
            throw new Error("Classification exists. Please use different classification name")
          }
        })
        .withMessage("Please provide a classification name."), // on error this message is sent.
    ]
  }

  /* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("inv/addClassification", {
        errors,
        title: "Registration",
        nav,
        classification_name,
      })
      return
    }
    next()
  }
  
  module.exports = validate