// ==UserScript==
// @name         Cin7 show today's total sales
// @namespace    https://bcosys.world/
// @version      2024-02-14
// @description  try to take over the world!
// @author       Yihui Liu
// @match        https://inventory.dearsystems.com/SaleList
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @grant        GM.xmlHttpRequest
// @connect      *
// ==/UserScript==
(function() {
    'use strict';

    const pageToolBar = document.querySelector('.page-toolbar-wrap .align-right');
    console.log(pageToolBar);

    const calculateBlock = document.createElement('div');
    calculateBlock.style.display = 'flex';
    calculateBlock.style.alignItems = 'center';
    const calculateButton = document.createElement('button');
    calculateButton.id = 'btnCalculateSales';
    calculateButton.textContent = 'Today\'s Sales/今日销售额';
    calculateButton.className = 'btn btn-small btn-outline';
    calculateButton.addEventListener('click', calculateSales);
    const resultDiv = document.createElement('div');
    resultDiv.id = 'resultDiv';
    resultDiv.style.height = '32px';
    resultDiv.style.minWidth = '50px';
    resultDiv.style.padding = '5px';
    resultDiv.style.margin = '0 10px';
    resultDiv.style.border = '1px solid #ccc';
    resultDiv.style.borderRadius = '5px';
    resultDiv.style.display = 'flex';
    resultDiv.style.alignItems = 'center';
    resultDiv.style.justifyContent = 'center';
    resultDiv.style.fontSize = '13px';


    calculateBlock.append(calculateButton);
    calculateBlock.append(resultDiv);

    pageToolBar.insertBefore(calculateBlock, pageToolBar.childNodes[0]);


    function calculateSales () {
        const today = new Date();
        // mm/dd/yyyy
        const dateOfToday = today.toLocaleDateString('en-US');
        const sales = document.querySelectorAll('#SaleList_Index_GeneralContainer .x-grid-body .x-grid-row');
        const total = Array.from(sales).filter(sale => sale.querySelector('.colOrderDateG').textContent.includes(dateOfToday))
            .reduce((acc, sale) => {
                const priceStr = sale.querySelector('.colDCOrderTotalG').textContent.replace(',', '');
                return acc + parseFloat(priceStr);
            }, 0);
        console.log(total.toFixed(2));
        resultDiv.textContent = `$${total.toFixed(2)}`;
    }
})();
