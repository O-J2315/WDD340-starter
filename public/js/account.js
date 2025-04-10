'use strict';

document.addEventListener("DOMContentLoaded", function () {
    // Get a list of accounts in the system
    let accountListURL = "/account/getAccountList";
    fetch(accountListURL)
        .then(function (response) {
            if (response.ok) {
                return response.json();
            }
            throw Error("Network response was not OK");
        })
        .then(function (data) {
            console.log(data);
            buildAccountList(data);
        })
        .catch(function (error) {
            console.log('There was a problem: ', error.message);
        });
  });



  async function buildAccountList(data) {
    const container = document.getElementById("management-account");
    let counter = 0;
  
    let tableHTML = `
      <table class='tbody-active'>
        <thead>
          <tr class="table-header">
            <th class="col-firstname">First Name</th>
            <th class="col-lastname">Last Name</th>
            <th class="col-email">Email</th>
            <th class="col-account-type">Account Type</th>
            <th class="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
    `;
  
    data.forEach((element) => {
      console.log((counter += 1) + ", " + element.account_firstname);
  
      tableHTML += `
        <tr class="account-row">
          <td class="firstname" data-label="First Name">${element.account_firstname}</td>
          <td class="lastname" data-label="Last Name">${element.account_lastname}</td>
          <td class="email" data-label="Email" style='font-style:italic;'>${element.account_email}</td>
          <td data-label="account type" class="account-type">${element.account_type}</td>
          <td class="actions" data-label="Actions">
            <a href="/account/delete-confirm/${element.account_id}" class="action-link delete-link" title="Click to delete">Delete</a>
          </td>
        </tr>
      `;
    });
  
    tableHTML += `
        </tbody>
      </table>
    `;
  
    // Inject full table HTML into the div
    container.appendChild(document.createRange().createContextualFragment(tableHTML));
  };