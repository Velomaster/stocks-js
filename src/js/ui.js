import VMasker from 'vanilla-masker';
import numeral from 'numeral';
import Sortable from 'sortablejs';

export class UI {

  constructor(state) {
    this.state = state;
  }

  get isEvalColumn() {
    if (document.querySelectorAll('#stocks-main-table tr th')[4].innerText === 'Market Price') {
     return true;
    } else {
      return false;
    }
  }

    init() {
        // Clear collapse menu on close
        $('#addScock').on('hidden.bs.collapse', () => {
          document.getElementById('add-stock-form').reset();
        });
        // Format price input
        this.formatPriceInput(document.querySelector("input[name='price']"));
        // Sortable init
        this.sortableInit();
    }

    sortableInit() {
      const opt = {
        handle: "#sort-handle",
        onEnd: (evt) => {
          const stocks = this.state.moveStock(evt.oldIndex, evt.newIndex);
          this.renderStocks(stocks);
        },
      }
      const table = document.getElementById('stocks-main-table').getElementsByTagName('tbody')[0];
      this.sortable = Sortable.create(table, opt);
    }

    sortableUpdate() {
      this.sortable.destroy();
      this.sortableInit();
    }

    formatPriceInput(selector) {
      VMasker(selector).maskMoney({
          separator: '.',
          delimiter: ',',
          zeroCents: false
      });
    }

    renderStocks(stocks) {
      document.querySelector('#stocks-main-table tbody').innerHTML = "";
      if (this.isEvalColumn) {
        const tableHeadersRow = document.querySelector('#stocks-main-table tr');
        tableHeadersRow.deleteCell(4);
      }
      stocks.forEach((stock, i) => {
        const table = document.getElementById('stocks-main-table').getElementsByTagName('tbody')[0];
        const row = table.insertRow(-1);
        row.insertCell(0).innerText = stock.ticket;
        row.insertCell(1).outerHTML = `<th scope="row">${stock.company}</th>`;
        row.insertCell(2).innerText = '$' + stock.price;
        row.insertCell(3).innerText = stock.quantaty;
        row.insertCell(4).outerHTML = `<td>
          <div class="dropdown dropleft d-flex justify-content-end">
            <button class="btn btn-outline-light mr-2" type="button" id="stocksOptions" data-toggle="dropdown">
              <i class="fas fa-ellipsis-v"></i>
            </button>
            <div class="dropdown-menu" aria-labelledby="stocksOptions">
              <a class="dropdown-item" data-stock-edit="${i}">Edit</a>
              <a class="dropdown-item text-danger" data-stock-delete="${i}">Delete</a>
            </div>
            <button class="btn btn-outline-light" id="sort-handle">
              <i class="fas fa-arrows-alt"></i>
            </button>
          </div>
        </td>`;
      });
    }

    renderRow(stock, rowIndex) {
      const table = document.getElementById('stocks-main-table').getElementsByTagName('tbody')[0];
      const rows = table.querySelectorAll('tr');
      const cells = rows[rowIndex].querySelectorAll('td, th');
      cells[0].innerText = stock.ticket;
      cells[1].outerHTML = `<th scope="row">${stock.company}</th>`;
      cells[2].innerText = '$' + stock.price;
      cells[3].innerText = stock.quantaty;
      if (this.isEvalColumn) {
        cells[4].innerText = '$' + stock.price;
      }
      cells[this.isEvalColumn ? 5 : 4].outerHTML = `<td>
        <div class="dropdown dropleft d-flex justify-content-end">
          <button class="btn btn-outline-light mr-2" type="button" id="stocksOptions" data-toggle="dropdown">
            <i class="fas fa-ellipsis-v"></i>
          </button>
          <div class="dropdown-menu" aria-labelledby="stocksOptions">
            <a class="dropdown-item" data-stock-edit="${rowIndex}">Edit</a>
            <a class="dropdown-item text-danger" data-stock-delete="${rowIndex}">Delete</a>
          </div>
          <button class="btn btn-outline-light" id="sort-handle">
            <i class="fas fa-arrows-alt"></i>
          </button>
        </div>
      </td>`;
    }

    showMessage(message) {
      document.getElementById('message-modal-title').innerText = message.title;
      document.getElementById('message-modal-text').innerText = message.message;
      $('#message-modal').modal('show');
    }

    addMarketPriceColumn(stocks) {
      let addCell = false;
      if (!this.isEvalColumn) {
        const tableHeadersRow = document.querySelector('#stocks-main-table tr');
        tableHeadersRow.insertCell(4).outerHTML = '<th>Market Price</th>';
        addCell = true;
      }
      const tableBody = document.getElementById('stocks-main-table').getElementsByTagName('tbody')[0];
      const rows = tableBody.querySelectorAll('tr');
      rows.forEach((row, i) => {
        const cellContent = `$${stocks[i].marketPrice} <span class="${calcChange(+stocks[i].price, stocks[i].marketPrice).class}">(${calcChange(+stocks[i].price, stocks[i].marketPrice).number}%)</span>`;
        if (addCell) {
          row.insertCell(4).innerHTML = cellContent;
        } else {
          row.querySelectorAll('td, th')[4].innerHTML = cellContent;
        }
      });
    }

    renderPortfolio(portfolio) {
      portfolio.investedStr = numeral(portfolio.invested).format('$0,0.00');
      portfolio.equityStr = numeral(portfolio.equity).format('$0,0.00');
      portfolio.resultStr = numeral(portfolio.result).format('$0,0.00');
      document.getElementById('portfolio-invested').innerText = portfolio.investedStr;
      document.getElementById('portfolio-equity').innerHTML = `<span class="${calcChange(portfolio.invested, portfolio.equity).classBlack}">${portfolio.equityStr} (${calcChange(portfolio.invested, portfolio.equity).number}%)</span>`;
      document.getElementById('portfolio-result').innerHTML = `<spna class="${calcChange(portfolio.invested, portfolio.equity).classBlack}">${portfolio.resultStr}</span>`;
    }

    evaluateBtnIsLoading(state) {
      if (state) {
        document.getElementById('evaluation-label').classList.add('d-none');
        document.getElementById('evaluation-spinner').classList.remove('d-none'); 
      } else {
        document.getElementById('evaluation-label').classList.remove('d-none'); 
        document.getElementById('evaluation-spinner').classList.add('d-none');
      }
    }

}

function calcChange(prev, cur) {
  const res = {};
  let p = (cur - prev) / cur * 100.0;
  res.number = Math.round((p + Number.EPSILON) * 100) / 100;
  switch (Math.sign(p)) {
    case 1 :
      res.class = "text-success";
      res.classBlack = "text-success";
      break;
    case -1 :
      res.class = "text-danger";
      res.classBlack = "text-danger";
      break;
    case 0 : 
      res.class = "text-light";
      res.classBlack = "text-body";
  }
  return res;
}