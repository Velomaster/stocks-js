import arrayMove from 'array-move';

export class State {

    get getStocks() {
        return this.stocks.slice();
    }

    get getPortfolio() {
        return {...this.portfolio};
    }

    addStock(stock) {
        // Add to class
        const updatedStocks = this.getStocks;
        updatedStocks.unshift(stock);
        this.stocks = updatedStocks;
        // Add to local storage
        localStorage.setItem('stocks', JSON.stringify(this.getStocks));
        return this.getStocks;
    }

    deleteStock(index) {
        // Update class
        const stocks = this.getStocks;
        stocks.splice(index, 1);
        this.stocks = stocks;
        // Update local storage
        localStorage.setItem('stocks', JSON.stringify(stocks));
        return this.getStocks;
    }

    loadStocks() {
        const stocksObj = localStorage.getItem('stocks');
        if (!stocksObj) {
            this.stocks = [];
            return this.getStocks;
        } else {
            const stocks = JSON.parse(stocksObj);
            this.stocks = stocks;
            return this.getStocks;
        }
    }

    loadPortfolio() {
        const portfolioObj = localStorage.getItem('portfolio');
        if (!portfolioObj) {
            const portfolio = {};
            portfolio.invested = 0;
            portfolio.equity = 0;
            portfolio.result = 0;
            this.portfolio = portfolio;
            return this.getPortfolio;
        } else {
            const portfolio = JSON.parse(portfolioObj);
            this.portfolio = portfolio;
            return this.getPortfolio;
        }
    }

    updatePortfolio(stocks) {
        const portfolio = {
            invested: 0,
            equity: 0,
            result: 0,
        };
        stocks.forEach(stock => {
            portfolio.invested += +stock.price * stock.quantaty;
            portfolio.equity += stock.marketPrice * stock.quantaty;
            portfolio.result += (stock.marketPrice * stock.quantaty) - (+stock.price * stock.quantaty);
        });
        this.portfolio = portfolio;
        localStorage.setItem('portfolio', JSON.stringify(portfolio));
        return this.getPortfolio;
    }

    getStockById(id) {
        const stocks = this.getStocks;
        return stocks[id];
    }

    updateOneStock(stock, index) {
        const stocks = this.getStocks;
        stocks[index] = stock;
        this.stocks = stocks;
        localStorage.setItem('stocks', JSON.stringify(stocks));
        return this.getStocks[index];
    }

    updateMarketPrice(stocks) {
        this.stocks = stocks;
        const updatedStocks = this.getStocks;
        localStorage.setItem('stocks', JSON.stringify(updatedStocks));
        return this.getStocks;
    }

    moveStock(oldIndex, newIndex) {
        const stocks = this.getStocks;
        const newOrder = arrayMove(stocks, oldIndex, newIndex);
        this.stocks = newOrder;
        localStorage.setItem('stocks', JSON.stringify(newOrder));
        return this.getStocks;
    }

}