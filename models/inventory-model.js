const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}



/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

// Get inventory item by inv_id
async function getInventoryByItemId(invId) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.inv_id = $1`,
      [invId]
    )
    return data.rows
  } catch (error) {
    console.error("getInventoryByItemId error " + error)
  }
}

// Add New Classification
async function addClassification(classificationName) {
  try {
    const data = await pool.query(
      `INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *`,
      [classificationName]
    );
    return data.rows[0];

    } catch (error) {
      console.error("addClassification error " + error)
    }
}

// Add New Inventory Item
async function addInventoryItem({ inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id }) {
  try {
    // Insert the new inventory item into the database
    const result = await pool.query(
      `INSERT INTO inventory (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id]
    );

    // Return the result of the insertion, specifically the newly inserted row's inv_id
    return result.rows[0]; // or return result.rows if you need full information
  } catch (error) {
    console.error("Error adding inventory item:", error);
    throw error; // Rethrow the error so the controller can handle it
  }
}

// Check if classification name already exists
async function checkClassificationName(classification_name) {
  try {
    const result = await pool.query(
      `SELECT * FROM public.classification WHERE classification_name = $1`,
      [classification_name]
    );
    return result.rows.length > 0; // Returns true if the classification name exists
  } catch (error) {
    console.error("Error checking classification name:", error);
    throw error; // Rethrow the error for further handling
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

/* ***************************
 *  Delete Inventory Item Data
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = "DELETE FROM public.inventory WHERE inv_id = $1 RETURNING *";
    const data = await pool.query(sql, [ inv_id ])
    return data
  } catch (error) {
    console.error("Delete Inventory error: " + error)
  }
}


module.exports = {getClassifications, getInventoryByClassificationId, getInventoryByItemId, addClassification, addInventoryItem, checkClassificationName, updateInventory, deleteInventoryItem};