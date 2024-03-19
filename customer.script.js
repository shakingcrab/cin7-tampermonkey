// ==UserScript==
// @name         Show customer payments
// @namespace    https://bcosys.world/
// @version      2024-03-19
// @description  try to take over the world!
// @author       Yihui Liu
// @match        https://inventory.dearsystems.com/CustomerList
// @icon         https://www.google.com/s2/favicons?sz=64&domain=dearsystems.com
// @grant        GM.xmlHttpRequest
// @connect      *
// ==/UserScript==

(function() {
    'use strict';

    const API_URL = 'https://gxcyafat8k.execute-api.us-east-1.amazonaws.com/prod';

    const pageToolBar = document.querySelector('div.js-salesStatementsToolBar .align-right');

    const getDueButton = document.createElement('button');
    getDueButton.id = 'btnGetDue';
    getDueButton.className = 'btn btn-small btn-outline';
    getDueButton.addEventListener('click', getDue);
    const getDueIcon = document.createElement('i');
    getDueButton.append('Get Ranged Due');
    const buttonDiv = document.createElement('div');
    buttonDiv.className = 'form-control';
    buttonDiv.append(getDueButton);

    pageToolBar.insertBefore(buttonDiv, pageToolBar.childNodes[0]);

    function getDue() {
        const startDate = document.getElementById('divFrom').value;
        const endDate = document.getElementById('divTo').value;
        // change from mm/dd/yyyy to yyyy-mm-dd
        const formattedStartDate = new Date(startDate).toISOString().split('T')[0];
        const formattedEndDate = new Date(endDate).toISOString().split('T')[0];
        GM.xmlHttpRequest({
            method: 'GET',
            url: `${API_URL}/cin7/customer-payment-summaries/${formattedStartDate}/${formattedEndDate}`,
            onload: function (response) {
                console.log('response', response);
                if (response.status === 200) {
                    const summaries = JSON.parse(response.response);
                    console.log('summaries', summaries);
                    generateRangedDue(summaries);
                }
            },
            onerror: function (response) {
                alert(response.statusText);
            }
        });
    }

    function generateRangedDue(summaries) {
        const rows = document.querySelectorAll('.x-grid-row');
        for (const row of rows) {
            const customerName = row.querySelector('.x-grid-cell-Name_CustomerList_Index_Container').textContent;
            const summary = summaries.find(summary => summary.customerName === customerName);
            console.log(summary);
            if (summary) {
                const dueCell = row.querySelector('.x-grid-cell-DueAmount_CustomerList_Index_Container .x-grid-cell-inner');
                dueCell.textContent = `${dueCell.textContent}(Ranged due: ${summary.dueAmount.toFixed(2)})`;
            }
        }
    }
})();
