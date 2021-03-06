import {SetCandidateOnTxData} from '~/src';
import {clearData} from '~/test/utils';

describe('SetCandidateOnTxData', () => {
    const txParamsData = {
        publicKey: 'Mpf9e036839a29f7fba2d5394bd489eda927ccb95acc99e506e688e4888082b3a3',
    };
    const txData = new SetCandidateOnTxData(txParamsData).serialize();

    test('.fromRlp', () => {
        const params = clearData(SetCandidateOnTxData.fromRlp(txData));
        expect(params)
            .toEqual(clearData(txParamsData));
    });
});
