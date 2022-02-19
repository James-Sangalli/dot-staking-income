const request = require("superagent");
const fs = require('fs').promises;
const prices = require("./prices/prices");
const endpoints = {
    "DOT": "https://polkadot.api.subscan.io",
    "KSM": "https://kusama.api.subscan.io"
}
const decimals = {
    "DOT": 1e10,
    "KSM": 1e12
}

module.exports = class Helpers {
    
    constructor(address, network, currency) {
        this.address = address;
        this.network = network;
        this.decimal = decimals[network];
        this.endpoint = endpoints[network];
        this.apiKey = process.env.API_KEY;
        this.currency = currency.toLowerCase();
        if(this.network === "DOT") {
            this.coinName = "polkadot";
            this.prices = prices[this.currency].DOT.prices;
        } else {
            this.coinName = "kusama";
            this.prices = prices[this.currency].KSM.prices;
        }
    }

    async getObjectWithValue() {
        let index = 0;
        const dataObj = {};
        try {
            while(true) {
                const result = await request.post(`${this.endpoint}/api/scan/account/reward_slash`, {
                    "X-API-Key": this.apiKey,
                    "row": 100,
                    "page": index,
                    "address": this.address
                });
                const offset = index * 99;
                index++;
                if(result.body.data.list === null) break;
                this.objCombine(result.body.data, dataObj, offset);
                await this.timeout(1000);
            }
        } catch (e) {
            return {error: e};
        }
        dataObj.list = this.convertListObjToArray(dataObj.list);
        return this.handleData(dataObj);
    }

    objCombine(obj, variable, offset) {
        for (let key of Object.keys(obj)) {
            if (!variable[key]) variable[key] = {};
            for (let innerKey of Object.keys(obj[key]))
                variable[key][parseInt(innerKey) + offset] = obj[key][innerKey];
        }
    }

    convertListObjToArray(dataObj) {
        let dataAsArray = [];
        for(let k in Object.keys(dataObj)) {
            dataAsArray.push(dataObj[k]);
        }
        return dataAsArray;
    }

    async handleData(result) {
        result = this.removeIrrelevantData(result);
        result[`total_value_${this.currency}`] = 0;
        result[`total_value_${this.network}`] = 0;
        for(const index in result.list) {
            const timestamp = result.list[index].block_timestamp;
            const amount = result.list[index].amount;
            try {
                const priceAtTime = await this.getPrice(timestamp);
                result.list[index].amount = amount / this.decimal;
                const valueOfRewardFiat = parseFloat((priceAtTime * (amount / this.decimal)).toFixed(2)); // fiat is only 2dp
                result.list[index][`${this.currency}_price_per_coin`] = priceAtTime;
                result.list[index][`${this.currency}_value`] = valueOfRewardFiat;
                result[`total_value_${this.currency}`] += valueOfRewardFiat;
                result[`total_value_${this.network}`] += result.list[index].amount;
                result.list[index].date = new Date(result.list[index].block_timestamp * 1000).toDateString();
            } catch {
                delete result.list[index];
                console.log(`No price found for ${timestamp}`);
            }
        }
        result[`total_value_${this.currency}`] = parseFloat(result[`total_value_${this.currency}`].toFixed(2));
        result.list = result.list.filter(x => x !== null);
        return result;
    }

    removeIrrelevantData(result) {
        for(const index in result.list) {
            // delete irrelevant details
            delete result.list[index].account;
            delete result.list[index].params;
            delete result.list[index].event_index;
            delete result.list[index].event_idx;
            delete result.list[index].block_num;
            delete result.list[index].extrinsic_idx;
        }
        return result;
    }

    timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async getPrice(time) {
        // coingecko uses zero hour time snapshots
        const date = new Date(time * 1000).setHours(0, 0, 0, 0);
        // TODO a bit inefficient to have to iterate each time
        for(const snapshot of this.prices) {
            const snapshotTime = new Date(snapshot[0]).setHours(0,0,0,0);
            if(snapshotTime === date) {
                const output = parseFloat(snapshot[1]).toFixed(2);
                return parseFloat(output);
            }
        }
        throw "Could not find price";
    }

    async updatePrices(currency) {
        try {
            const query = `https://api.coingecko.com/api/v3/coins/${this.coinName}/market_chart?vs_currency=${currency}&days=max`;
            const result = await request.get(query);
            const updatedDataset = JSON.stringify(result.body);
            const fileName = `./utils/prices/${this.currency}/${this.network}.json`;
            return fs.writeFile(fileName, updatedDataset);
        } catch (e) {
            console.error(e);
            throw e;
        }

    }
    
}