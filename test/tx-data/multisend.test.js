import {MultisendTxData} from '~/src';
import {clearData} from '~/test/utils';

describe('MultisendTxData', () => {
    const txParamsData = {
        list: [
            {
                value: 0.1,
                coin: 'MNT',
                to: 'Mxfe60014a6e9ac91618f5d1cab3fd58cded61ee99',
            },
            {
                value: 0.2,
                coin: 'MNT',
                to: 'Mxddab6281766ad86497741ff91b6b48fe85012e3c',
            },
        ],
    };
    const txData = new MultisendTxData(txParamsData).serialize();

    test('.fromRlp', () => {
        const params = clearData(MultisendTxData.fromRlp(txData));
        expect(params)
            .toEqual(clearData(txParamsData));
    });
});
