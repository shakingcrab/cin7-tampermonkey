// ==UserScript==
// @name         Cin7 extension
// @namespace    https://bcosys.world/
// @version      2024-02-07
// @description  try to take over the world!
// @author       Yihui Liu
// @match        https://inventory.dearsystems.com/Purchase
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @grant        GM.xmlHttpRequest
// @connect      *
// ==/UserScript==

(function() {
    'use strict';

    const saveButtonGroup = document.getElementsByClassName('save-button-bottom')[0];
    const newButton = document.createElement('button');
    newButton.textContent = 'Ship';
    newButton.style.marginBottom = '5px';
    newButton.addEventListener('click', addShipment);
    saveButtonGroup.insertBefore(newButton, saveButtonGroup.children[0]);

    const topBarButtons = document.querySelector('.page-top-bar .align-right');
    const newButton2 = document.createElement('button');
    newButton2.textContent = 'Add Shipment';
    newButton2.className = 'btn btn-outline btn-small';
    newButton2.addEventListener('click', addShipment);
    topBarButtons.insertBefore(newButton2, topBarButtons.children[0]);

    const orderButtonGroup = document.querySelector('#divOrder .align-right');
    const orderAuthorizeButton = document.querySelector('#divAuthorise_Order');
    const includeShipmentButton = document.createElement('button');
    includeShipmentButton.textContent = 'Include Shipment';
    includeShipmentButton.className = 'btn btn-outline';
    includeShipmentButton.addEventListener('click', includeShipment);
    orderButtonGroup.insertBefore(includeShipmentButton, orderAuthorizeButton);

    function includeShipmentPrice (totalShipmentPrice, resultTable) {
        const ordersForm = document.getElementById('divOrderLinesForm');
        const orders = ordersForm.querySelectorAll('tr.x-grid-row');
        const products = [];
        let totalQuantity = 0;
        for (const order of orders) {
            const productNameBlock = order.querySelector('.product-text span span') || order.querySelector('deartooltip productname');
            const productName = productNameBlock.textContent;
            const unitBlock = order.querySelector('.x-grid-cell-colUnitOfMeasure_OrderLines');
            const unit = unitBlock.textContent;
            const quantityBlock = order.querySelector('.x-grid-cell-colQuantity_OrderLines');
            const quantity = Number(quantityBlock.textContent);
            totalQuantity += quantity;
            const priceBlock = order.querySelector('.x-grid-cell-colPrice_OrderLines');
            const price = Number(priceBlock.textContent.replaceAll(",", ""));
            products.push({
                productName,
                unit,
                quantity,
                price,
            });
        }


        // clear result table tbody
        resultTable.querySelector('tbody').innerHTML = '';

        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            const shipmentPrice = totalShipmentPrice * (product.quantity / totalQuantity);
            const newPrice = product.price + shipmentPrice / product.quantity;
            const resultTr = document.createElement('tr');
            const resultNameTd = document.createElement('td');
            resultNameTd.textContent = product.productName;
            resultNameTd.style.padding = '0 5px';
            const resultPriceTd = document.createElement('td');
            resultPriceTd.textContent = `$${newPrice}`;
            resultPriceTd.style.padding = '0 5px';
            resultTr.append(resultNameTd);
            resultTr.append(resultPriceTd);
            resultTable.querySelector('tbody').append(resultTr);
        }


        console.log(products);
    }

    function includeShipment () {
        GM.xmlHttpRequest({
            method: 'GET',
            url: 'https://k0g8rklnp6.execute-api.us-east-1.amazonaws.com/dev/cin7/shipments',
            onload: function (response) {
                console.log(response);
                if (response.status === 200) {
                    const shipments = JSON.parse(response.response);
                    console.log(shipments);
                    const dialog = document.createElement('dialog');
                    dialog.setAttribute('open', true);
                    dialog.style.zIndex = 999;
                    const form = document.createElement('form');

                    const resultTable = document.createElement('table');
                    resultTable.style.width = '100%';
                    const resultHeader = document.createElement('thead');
                    const resultNameTh = document.createElement('th');
                    resultNameTh.style.padding = '0 5px';
                    resultNameTh.textContent = 'Name';
                    const resultPriceTh = document.createElement('th');
                    resultPriceTh.textContent = 'Price';
                    resultPriceTh.style.padding = '0 5px';
                    const resultBody = document.createElement('tbody');
                    resultHeader.append(resultNameTh);
                    resultHeader.append(resultPriceTh);
                    resultTable.append(resultHeader);
                    resultTable.append(resultBody);


                    form.addEventListener('submit', (e) => {
                        e.preventDefault();

                        // get selected shipment PKs
                        const selectedShipmentPKs = [];
                        const checkboxes = form.querySelectorAll('input[name="shipment"]');
                        for (const checkbox of checkboxes) {
                            if (checkbox.checked) {
                                selectedShipmentPKs.push(checkbox.value);
                            }
                        }

                        // get shipments
                        const selectedShipments = shipments.filter((shipment) =>
                            selectedShipmentPKs.includes(shipment.PK));

                        const totalShipmentPrice = selectedShipments.reduce((acc, shipment) => acc + shipment.price, 0) / 100;
                        includeShipmentPrice(totalShipmentPrice, resultTable);

                        return false;
                    });
                    const table = document.createElement('table');
                    table.style.width = '100%';
                    const header = document.createElement('thead');
                    const checkTh = document.createElement('th');
                    checkTh.textContent = 'Select';
                    checkTh.style.padding = '0 5px';
                    checkTh.style.borderBottom = '1px solid #e0e0e0';
                    checkTh.style.textAlign = 'center';
                    const vendorTh = document.createElement('th');
                    vendorTh.textContent = 'Vendor';
                    vendorTh.style.padding = '0 5px';
                    vendorTh.style.borderBottom = '1px solid #e0e0e0';
                    vendorTh.style.textAlign = 'center';
                    const dateTh = document.createElement('th');
                    dateTh.textContent = 'Date';
                    dateTh.style.padding = '0 5px';
                    dateTh.style.borderBottom = '1px solid #e0e0e0';
                    dateTh.style.textAlign = 'center';
                    const priceTh = document.createElement('th');
                    priceTh.textContent = 'Price';
                    priceTh.style.padding = '0 5px';
                    priceTh.style.borderBottom = '1px solid #e0e0e0';
                    priceTh.style.textAlign = 'center';
                    header.append(checkTh);
                    header.append(vendorTh);
                    header.append(dateTh);
                    header.append(priceTh);
                    table.append(header);
                    for (const shipment of shipments) {
                        const tr = document.createElement('tr');
                        // add checkbox input
                        const checkTd = document.createElement('td');
                        const checkInput = document.createElement('input');
                        checkInput.type = 'checkbox';
                        checkInput.value = shipment.PK;
                        checkInput.name = 'shipment';
                        checkTd.append(checkInput);
                        checkTd.style.padding = '0 5px';
                        checkTd.style.textAlign = 'center';
                        checkTd.style.borderBottom = '1px solid #e0e0e0';
                        tr.append(checkTd);
                        // add vendor
                        const vendorTd = document.createElement('td');
                        vendorTd.textContent = shipment.vendor;
                        vendorTd.style.padding = '0 5px';
                        vendorTd.style.borderBottom = '1px solid #e0e0e0';
                        vendorTd.style.textAlign = 'center';
                        tr.append(vendorTd);
                        // add date
                        const dateTd = document.createElement('td');
                        dateTd.textContent = shipment.shipmentCreatedDate;
                        dateTd.style.padding = '0 5px';
                        dateTd.style.borderBottom = '1px solid #e0e0e0';
                        dateTd.style.textAlign = 'center';
                        tr.append(dateTd);
                        // add price
                        const priceTd = document.createElement('td');
                        priceTd.textContent = `$${shipment.price / 100}`;
                        priceTd.style.padding = '0 5px';
                        priceTd.style.borderBottom = '1px solid #e0e0e0';
                        priceTd.style.textAlign = 'center';
                        tr.append(priceTd);
                        table.append(tr);
                    }

                    const buttonGroup = document.createElement('div');
                    buttonGroup.style.display = 'flex';
                    const includeButton = document.createElement('input');
                    includeButton.value = 'Calculate';
                    includeButton.type = 'submit';
                    includeButton.className = 'btn btn-primary';
                    const cancelButton = document.createElement('button');
                    cancelButton.textContent = 'Cancel';
                    cancelButton.className = 'btn btn-outline';
                    cancelButton.addEventListener('click', (e) => {
                        e.preventDefault();
                        dialog.close();
                    });
                    buttonGroup.append(includeButton);
                    buttonGroup.append(cancelButton);

                    form.append(table);
                    form.append(buttonGroup);
                    dialog.append(form);
                    dialog.append(resultTable);
                    document.querySelector('.dr-warning').append(dialog);
                }
            },
        });
    }


    function addShipment () {
        const vendorInput = document.getElementById('cmbSupplier');
        const dateInput = document.getElementById('dtDate');
        const totalAmountSpan = document.getElementById('Purchase_Order_GrandTotal');
        const vendor = vendorInput.value;
        const date = dateInput.value;
        const totalAmount = Number(totalAmountSpan.textContent.replaceAll(",", ""));
        console.log(vendor, date, totalAmount);

        const dialog = document.createElement('dialog');
        dialog.setAttribute('open', true);
        dialog.style.zIndex = 999;
        const title = document.createElement('h2');
        title.textContent = 'Do you want to add this shipment?'
        const vendorP = document.createElement('p');
        vendorP.textContent = `Vendor: ${vendor}`;
        const dateP = document.createElement('p');
        dateP.textContent = `Date: ${date}`;
        const priceP = document.createElement('p');
        priceP.textContent = `Price: $${totalAmount}`;
        const buttonGroup = document.createElement('div');
        const confirmButton = document.createElement('button');
        confirmButton.textContent = 'Yes';
        confirmButton.className = 'btn btn-primary';
        confirmButton.addEventListener('click', () => {
            const shipment = {
                vendor: vendor,
                shipmentCreatedDate: date,
                price: totalAmount * 100,
            }

            console.log(shipment);

            GM.xmlHttpRequest({
                method: 'POST',
                url: 'https://k0g8rklnp6.execute-api.us-east-1.amazonaws.com/dev/cin7/shipment',
                data: JSON.stringify(shipment),
                onload: function (response) {
                    console.log(response);
                    if (response.status === 200) {
                        const responseJSON = JSON.parse(response.response);
                        console.log(responseJSON);
                        dialog.close();
                        alert(responseJSON.message || 'Done');
                    }
                },
            });

        });

        const cancelButton = document.createElement('button');
        cancelButton.className = 'btn btn-outline'
        cancelButton.textContent = 'Cancel';
        cancelButton.addEventListener('click', () => {dialog.close()});
        buttonGroup.append(confirmButton);
        buttonGroup.append(cancelButton);

        dialog.append(title);
        dialog.append(vendorP);
        dialog.append(dateP);
        dialog.append(priceP);
        dialog.append(buttonGroup);

        document.querySelector('.dr-warning').append(dialog);

    }
})();

