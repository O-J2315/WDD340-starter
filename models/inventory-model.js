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
    )
    console.log(data.rows)
    return data.rows
  } catch (error) {
    console.error("addClassification error " + error)
  }
}

// Add New Inventory Item
async function addInventoryItem(invYear, invMake, invModel, classificationId) {
  try {
    // Check if the classification already exists
    const existingClassification = await pool.query(
      `SELECT * FROM public.classification WHERE classification_name = $1`,
      [classificationName]
    );

    // If the classification exists, return an error message or do nothing
    if (existingClassification.rows.length > 0) {
      console.log("Classification already exists.");
      return { error: "Classification already exists" };
    }

    // If it doesn't exist, insert the new classification
    const data = await pool.query(
      `INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *`,
      [classificationName]
    );

    console.log(data.rows);
    return data.rows;
  } catch (error) {
    console.error("addInventoryItem error " + error)
  }
}

 async function checkClassificationName(classificationName) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.classification WHERE classification_name = $1`,
      [classificationName]
    )
    return data.rows
  } catch (error) {
    console.error("checkClassificationName error " + error)
  }
}


module.exports = {getClassifications, getInventoryByClassificationId, getInventoryByItemId, addClassification, addInventoryItem, checkClassificationName};