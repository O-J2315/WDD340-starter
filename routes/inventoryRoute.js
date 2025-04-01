// Needed Resources 
const classValidate = require('../utilities/classification-validation')
const invValidate = require('../utilities/inventory-validation')
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
router.post('/addClassification', classValidate.addClassRules(), classValidate.checkClassData, utilities.handleErrors(invController.addClassification));

// route to process the add Inventory form
router.post('/addInventory', invValidate.addInvRules(), invValidate.checkInvData, utilities.handleErrors(invController.addInventoryItem));

router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

module.exports = router;