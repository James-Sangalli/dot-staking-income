const Helpers = require("../helpers");
const prices = require("../prices/prices");

async function main() {
    try {
        const currencies = Object.keys(prices);
        for(const currency of currencies) {
            await new Helpers("", "DOT", currency).updatePrices(currency);
            await new Helpers("", "KSM", currency).updatePrices(currency);
        }
    } catch (e) {
        console.error(e);
        // don't want to commit the price updates if it didn't succeed
        process.exit(-1);
    }
}
if(process.argv.length > 2) {
    // hacky but an easy way to differentiate between calling this via node in package.json and using it in app.js
    const _ = main();
}

module.exports = { updatePrices: main };
