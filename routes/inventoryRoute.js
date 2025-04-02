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
router.get("/manage", utilities.checkJWTToken, utilities.checkAdminOrEmployee, invController.buildInventoryManagement);

// route to build the inventory addClassification view
router.get("/addClassification", utilities.checkJWTToken, utilities.checkAdminOrEmployee, utilities.handleErrors(invController.buildAddClassification));

// route to build the inventory addInventory view
router.get("/addInventory", utilities.checkJWTToken, utilities.checkAdminOrEmployee, utilities.handleErrors(invController.buildAddInventory));

// route to process the add Classification form
router.post('/addClassification', utilities.checkJWTToken, utilities.checkAdminOrEmployee, classValidate.addClassRules(), classValidate.checkClassData, utilities.handleErrors(invController.addClassification));

// route to process the add Inventory form
router.post('/addInventory', utilities.checkJWTToken, utilities.checkAdminOrEmployee, invValidate.addInvRules(), invValidate.checkInvData, utilities.handleErrors(invController.addInventoryItem));

//get the classification list as JSON
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

//Build the edit view by id
router.get('/edit/:invId', utilities.checkJWTToken, utilities.checkAdminOrEmployee, utilities.handleErrors(invController.buildEditById))

//Update request
router.post("/update/", utilities.checkJWTToken, utilities.checkAdminOrEmployee, invValidate.addInvRules(), invValidate.checkUpdateData, utilities.handleErrors(invController.updateInventory))

//Get the delete view 
router.get('/delete/:invId', utilities.checkJWTToken, utilities.checkAdminOrEmployee, utilities.handleErrors(invController.buildDeleteById))

//Delete request
router.post('/delete/', utilities.checkJWTToken, utilities.checkAdminOrEmployee, utilities.handleErrors(invController.deleteInventoryItem))

module.exports = router;