import {MinterTxDataSell, TX_TYPE_SELL, coinToBuffer} from 'minterjs-tx';
// import MinterTxDataSell from 'minterjs-tx/src/tx-data/sell';
// import {TX_TYPE_SELL} from 'minterjs-tx/src/tx-types';
// import {coinToBuffer} from 'minterjs-tx/src/helpers';
import {convertToPip} from 'minterjs-util';
// import {convertToPip} from 'minterjs-util/src/converter';

/**
 * @constructor
 * @param {string} coinFrom
 * @param {string} coinTo
 * @param {number|string} sellAmount
 * @param {number|string} [minBuyAmount=0]
 * @param {string} [feeCoinSymbol]
 * @param {...TxParams} otherParams
 * @return {TxParams}
 */
export default function SellTxParams({coinFrom, coinTo, sellAmount, minBuyAmount = 0, feeCoinSymbol, ...otherParams}) {
    const txData = new MinterTxDataSell({
        coinToSell: coinToBuffer(coinFrom),
        coinToBuy: coinToBuffer(coinTo),
        valueToSell: `0x${convertToPip(sellAmount, 'hex')}`,
        minimumValueToBuy: `0x${convertToPip(minBuyAmount, 'hex')}`,
    });

    if (!feeCoinSymbol) {
        feeCoinSymbol = coinFrom;
    }

    return {
        ...otherParams,
        gasCoin: feeCoinSymbol,
        txType: TX_TYPE_SELL,
        txData: txData.serialize(),
    };
}
