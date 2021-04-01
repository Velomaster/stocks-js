const axios = require('axios').default;

export class API {

    constructor() {
        this.serverUrl = process.env.NODE_ENV === 'development' ? process.env.HOST_URL_DEV : process.env.HOST_URL_PROD;
    }

    getPrice(symbol) {
        return axios(this.serverUrl + '/api/stock/' + symbol)
            .then(response => response.data.price)
            .catch(error => {
                if (error.response) {
                    return Promise.reject(error.response.data);
                } else {
                    throw error.response.data;
                }
            });
    }

}