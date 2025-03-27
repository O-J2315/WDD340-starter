// Needed Resources 
const regValidate = require('../utilities/classification-validation')
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build the inventory item detail view
router.get("/detail/:invId", invController.buildByInvId);

//Route to build the inventory management view
router.get("/manage", invController.buildInventoryManagement);

// route to build the inventory addClassification view
router.get("/addClassification", utilities.handleErrors(invController.buildAddClassification));

// route to build the inventory addInventory view
router.get("/addInventory", utilities.handleErrors(invController.buildAddInventory));

// route to process the add Classification form
router.post('/addClassification',  utilities.handleErrors(invController.addClassification));

// route to process the add Inventory form
router.post('/addInventory', utilities.handleErrors(invController.addInventoryItem));

module.exports = router;