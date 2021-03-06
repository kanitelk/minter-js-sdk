import {Tx, TxSignature, coinToBuffer, normalizeTxType, TX_TYPE, bufferToCoin} from 'minterjs-tx';
// import Tx from 'minterjs-tx/src/tx';
// import TxSignature from 'minterjs-tx/src/tx-signature.js';
// import {coinToBuffer} from 'minterjs-tx/src/helpers.js';
import {bufferToInteger, integerToHexString} from './utils.js';
import decorateTxParams from './tx-decorator/index.js';
import {decodeTxData, ensureBufferData} from './tx-data/index.js';

/**
 * @typedef {Object} TxParams
 * @property {string|Buffer} privateKey
 * @property {number} [nonce]
 * @property {Number} [chainId=1]
 * @property {number} [gasPrice=1]
 * @property {string} [gasCoin='BIP']
 * @property {string|Buffer|TX_TYPE} type
 * @property {string|Buffer|TX_TYPE} [txType] - deprecated
 * @property {Buffer|TxData|Object} data
 * @property {Buffer|TxData|Object} [txData] - deprecated
 * @property {string} payload
 * @property {string} [message] - deprecated
 */


/**
 * @param {TxParams} txParams
 * @return {Tx}
 */
export default function prepareSignedTx(txParams = {}) {
    txParams = {
        ...txParams,
        data: txParams.data || txParams.txData,
        type: normalizeTxType(txParams.type || txParams.txType),
        payload: txParams.payload || txParams.message,
    };
    txParams = decorateTxParams(txParams);
    const {privateKey, nonce, chainId = 1, gasPrice = 1, type: txType} = txParams;
    let {gasCoin, payload, data: txData} = txParams;
    // throw on falsy nonce except 0
    if (!nonce && typeof nonce !== 'number') {
        throw new Error('Invalid nonce specified, tx can\'t be prepared');
    }

    if (!gasCoin) {
        if (chainId === 2) {
            gasCoin = 'MNT';
        } else {
            gasCoin = 'BIP';
        }
    }
    // @TODO asserts
    const privateKeyBuffer = typeof privateKey === 'string' ? Buffer.from(privateKey, 'hex') : privateKey;

    // pass privateKey from params to data for redeemCheck
    if (txType === TX_TYPE.REDEEM_CHECK && !txData.privateKey) {
        txData.privateKey = privateKey;
    }

    txData = ensureBufferData(txData, txType);

    const txProps = {
        nonce: `0x${integerToHexString(nonce)}`,
        chainId: `0x${integerToHexString(chainId)}`,
        gasPrice: `0x${integerToHexString(gasPrice)}`,
        gasCoin: coinToBuffer(gasCoin),
        type: txType,
        data: txData,
        signatureType: '0x01',
    };

    if (payload) {
        if (typeof payload === 'string') {
            payload = Buffer.from(payload, 'utf-8');
        }
        txProps.payload = payload;
    }

    const tx = new Tx(txProps);
    tx.signatureData = (new TxSignature()).sign(tx.hash(false), privateKeyBuffer).serialize();

    return tx;
}


/**
 * @param {string} txRlp
 * @param {boolean} [decodeCheck]
 * @return {TxParams}
 */
export function decodeTx(txRlp, {decodeCheck} = {}) {
    const txString = txRlp.replace('0x', '');
    const tx = new Tx(txString);
    const txType = normalizeTxType(tx.type);
    const txData = decodeTxData(tx.type, tx.data, {decodeCheck});

    return {
        nonce: tx.nonce.length ? bufferToInteger(tx.nonce) : undefined,
        chainId: tx.chainId.length ? bufferToInteger(tx.chainId) : undefined,
        gasPrice: tx.gasPrice.length ? bufferToInteger(tx.gasPrice) : undefined,
        gasCoin: tx.gasCoin.length ? bufferToCoin(tx.gasCoin) : undefined,
        type: txType,
        data: txData,
        payload: tx.payload.toString('utf-8'),
        signatureType: tx.signatureType.length ? bufferToInteger(tx.signatureType) : undefined,
        signatureData: `0x${tx.signatureData.toString('hex')}`,
    };
}
