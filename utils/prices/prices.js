const dotPricesUSD = require("./prices/usd/dot-prices.json");
const ksmPricesUSD = require("./prices/usd/ksm-prices.json");
const dotPricesAUD = require("./prices/aud/dot-prices.json");
const ksmPricesAUD = require("./prices/aud/ksm-prices.json");
const dotPricesCAD = require("./prices/cad/dot-prices.json");
const ksmPricesCAD = require("./prices/cad/ksm-prices.json");
const dotPricesCHF = require("./prices/chf/dot-prices.json");
const ksmPricesCHF = require("./prices/chf/ksm-prices.json");
const dotPricesEUR = require("./prices/eur/dot-prices.json");
const ksmPricesEUR = require("./prices/eur/ksm-prices.json");
const dotPricesSGD = require("./prices/sgd/dot-prices.json");
const ksmPricesSGD = require("./prices/sgd/ksm-prices.json");

module.exports = {
    usd: {
        DOT: dotPricesUSD,
        KSM: ksmPricesUSD
    },
    aud: {
        DOT: dotPricesAUD,
        KSM: ksmPricesAUD
    },
    cad: {
        DOT: dotPricesCAD,
        KSM: ksmPricesCAD
    },
    chf: {
        DOT: dotPricesCHF,
        KSM: ksmPricesCHF
    },
    eur: {
        DOT: dotPricesEUR,
        KSM: ksmPricesEUR
    },
    sgd: {
        DOT: dotPricesSGD,
        KSM: ksmPricesSGD
    }
}