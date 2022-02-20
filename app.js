const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const Helpers = require("./utils/helpers");
const { updatePrices } = require("./utils/prices/update");

app.get("/history/:address/:network/:currency", (req, res, next) => {
    res.header( 'Access-Control-Allow-Origin','*' );
    const address = req.params.address;
    const network = req.params.network.toUpperCase();
    const currency = req.params.currency.toLowerCase();
    new Helpers(address, network, currency).getResults().then((result) => {
        res.send(result);
    }).catch((err) => {
        res.send(err);
    });
});

function pollForPriceUpdates() {
    setTimeout(() => {
        updatePrices().then(console.log).catch(console.error);
        pollForPriceUpdates();
    }, 72000 * 1000);
}

app.listen(port, () => {
    pollForPriceUpdates();
    console.log(`listening at ${port}`)
});