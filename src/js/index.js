import jquery from 'jquery';
window.$ = jquery;
import 'bootstrap';
import 'babel-polyfill';

// Font Awesome
import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';
import '@fortawesome/fontawesome-free/js/brands';

import { State } from './state';
import { API } from './api';
import { UI } from './ui';

const state = new State();
const ui = new UI(state);
const api = new API();

// Add stocks
document.getElementById('add-stock-form').addEventListener('submit', (e) => {
    const ticket = e.target.elements['ticket'].value.toUpperCase();
    const company = e.target.elements['company'].value;
    const price = Number(e.target.elements['price'].value).toFixed(2);
    const quantaty = Number(e.target.elements['quantaty'].value);
    
    if (!ticket || !company || price <= 0 || quantaty < 1) {
        ui.showMessage({title: 'Error', message: 'Please, complete all the fields.'});
    } else {
        const stock = {ticket, company, price, quantaty};
        const stocks = state.addStock(stock);
        ui.renderStocks(stocks);
        ui.sortableUpdate();
        e.target.reset();
    }
    e.preventDefault();
});

// Delete, Edit stock event listeners
document.getElementById('stocks-main-table').addEventListener('click', (el) => {
    if (el.target.dataset.stockDelete) {
        const index = el.target.dataset.stockDelete;
        deleteStock(index);
    } else if (el.target.dataset.stockEdit) {
        const index = el.target.dataset.stockEdit;
        const row = el.target.parentElement.parentElement.parentElement.parentElement;
        editStock(index, row);
    }
});

function deleteStock(index) {
    const updatedStocks = state.deleteStock(index);
    ui.renderStocks(updatedStocks);
}

function editStock(index, row) {
    const cells = row.querySelectorAll('td, th');
    cells[0].innerHTML = `<input value="${cells[0].textContent}" type="text" name="ticket" class="form-control mr-2 bg-dark" placeholder="Ticket">`;
    cells[1].innerHTML = `<input value="${cells[1].textContent}" type="text" name="company" class="form-control mr-2 bg-dark" placeholder="Company">`;
    cells[2].innerHTML = `<input value="${+cells[2].textContent.substring(1).replace('.', '')}" type="text" name="price" class="form-control mr-2 bg-dark" placeholder="Price" style="max-width: 125px;">`;
    cells[3].innerHTML = `<input value="${+cells[3].textContent}" type="number" name="quantaty" class="form-control mr-2 bg-dark" placeholder="Quantaty" style="max-width: 90px;">`;
    cells[ui.isEvalColumn ? 5 : 4].innerHTML = `<div class="d-flex justify-content-end">
        <button type="button" id="cancel-btn" class="btn btn-outline-secondary btn-sm mr-2">Cancel</button>
        <button type="button" id="save-btn" class="btn btn-outline-primary btn-sm">Save</button>
    </div>`;
    ui.formatPriceInput(cells[2].querySelector("input[name='price']"));
    cells[ui.isEvalColumn ? 5 : 4].querySelector('#cancel-btn').addEventListener('click', () => {
        const stock = state.getStockById(index);
        ui.renderRow(stock, index);
    });
    cells[ui.isEvalColumn ? 5 : 4].querySelector('#save-btn').addEventListener('click', () => {
        const ticket = cells[0].childNodes[0].value;
        const company = cells[1].childNodes[0].value;
        const price = Number(cells[2].childNodes[0].value);
        const quantaty = Number(cells[3].childNodes[0].value);
        
        if (!ticket || !company || price <= 0 || quantaty < 1) {
            ui.showMessage({title: 'Error', message: 'Please, complete all the fields.'});
        } else {
            const stock = {ticket, company, price, quantaty};
            state.updateOneStock(stock, index);
            ui.renderRow(stock, index);
        }
    })
}

// Get prices
document.getElementById('get-prices-btn').addEventListener('click', async (el) => {
    const stocks = state.getStocks;
    if (stocks.length === 0) {
        return ui.showMessage({title: 'No stocks in portfolio', message: 'Please, add stocks'});
    }
    ui.evaluateBtnIsLoading(true);
    for (const stock of stocks) {
        try {
            const price = await api.getPrice(stock.ticket)
            stock.marketPrice = price;
        } catch (error) {
            stock.marketPrice = error.message;
            ui.showMessage({title: error.title, message: `${stock.ticket} - ${error.message}`}); 
        }
    }
    ui.evaluateBtnIsLoading(false);
    const updatedStocks = state.updateMarketPrice(stocks);
    const portfolio = state.updatePortfolio(updatedStocks);
    ui.renderPortfolio(portfolio);
    ui.addMarketPriceColumn(stocks);
});

// Init app
document.addEventListener("DOMContentLoaded", () => {
    const stocks = state.loadStocks();
    const portfolio = state.loadPortfolio();
    ui.renderStocks(stocks);
    ui.renderPortfolio(portfolio);
    ui.init();
});