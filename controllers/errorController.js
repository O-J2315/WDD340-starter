const utilities = require("../utilities/")

const errorController = {};

errorController.triggerError = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    // Intentional error to trigger a 500 error
    throw new Error("This is an intentional 500 error.");


  } catch (err) {
    console.error(err);  // Log the error for debugging
    // Pass the error to the next middleware (error handler)
    next(err);
  }

};

module.exports = errorController;