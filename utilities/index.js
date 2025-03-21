const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  console.log(data.rows)
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}


/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
    let grid
    if(data.length > 0){
      grid = '<ul id="inv-display">'
      data.forEach(vehicle => { 
        grid += '<li>'
        grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
        + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
        + 'details"><img src="' + vehicle.inv_thumbnail 
        +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
        +' on CSE Motors" /></a>'
        grid += '<div class="namePrice">'
        grid += '<hr />'
        grid += '<h2>'
        grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
        grid += '</h2>'
        grid += '<span>$' 
        + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
        grid += '</div>'
        grid += '</li>'
      })
      grid += '</ul>'
    } else { 
      grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
  }




  // Build the item detail view HTML
Util.buildItemDetail = async function(data){
    let item
    console.log(data)

    if(data.length > 0){

      item = '<div id="inv-display">'
      item += '<img src="' + data[0].inv_thumbnail + '" alt="Image of ' 
      + data[0].inv_make + ' ' + data[0].inv_model + ' on CSE Motors" />'
      item += '<div class="namePrice">'
      item += '<h2>' + data[0].inv_make + ' ' + data[0].inv_model + '</h2>'
      item += '<span>$' + new Intl.NumberFormat('en-US').format(data[0].inv_price) + '</span>'
      item += '</div>'
      item += '<div class="details">'
      item += '<ul>'
      item += '<li><strong>Year:</strong> ' + data[0].inv_year + '</li>'
      item += '<li><strong>Color:</strong> ' + data[0].inv_color + '</li>'
      item += '<li><strong>Milage:</strong> ' + data[
        0].inv_miles + '</li>'
      }
      else {
        item += '<p class="notice">Sorry, that vehicle could not be found.</p>'
      }
      return item
  }



module.exports = Util