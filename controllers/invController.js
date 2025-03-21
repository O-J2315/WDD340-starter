const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

// Build the inventory item detail view
invCont.buildByInvId = async function (req, res, next) {
  const invId = req.params.invId

  const data = await invModel.getInventoryByItemId(invId)
  const item = await utilities.buildItemDetail(data)
  let nav = await utilities.getNav()
  res.render("./inventory/detail", {
    title: data[0].year + " " + data[0].make + " " + data[0].model,
    nav,
    item,
  })
}


module.exports = invCont