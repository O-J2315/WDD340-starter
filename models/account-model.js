const pool = require("../database/")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
    try {
      const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
      return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (error) {
      return error.message
    }
  }

  /* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}


// Process the update on the database
async function updateAccount(account_firstname, account_lastname, account_email, account_id) {
  try {
      const sql = `
          UPDATE account 
          SET account_firstname = $1, 
              account_lastname = $2, 
              account_email = $3 
          WHERE account_id = $4 
          RETURNING *`;
      const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id]);
      return result.rowCount > 0; // Returns true if the update was successful
  } catch (error) {
      console.error("Error updating account:", error);
      return false; // Returns false if an error occurred
  }
}


//Retunr the account by id
async function getAccountById(account_id) {
  const sql = "SELECT * FROM account WHERE account_id = $1";
  const result = await pool.query(sql, [account_id]);

  if (result.rowCount > 0) {
      return result.rows[0]; // Return account details
  }
  return null; // Return null if no account found
}


//Change paswword on database
async function updateAccountPassword(hashedPassword, account_id) {
  try {
      const sql = "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *";
      const result = await pool.query(sql, [hashedPassword, account_id]);
      return result.rowCount > 0; // Returns true if a row was updated
  } catch (error) {
      console.error("Database error updating password:", error);
      return false;
  }
}

module.exports = { registerAccount, checkExistingEmail, getAccountByEmail, updateAccount, getAccountById, updateAccountPassword }