import { BountyModel, getBounty } from '../model';
import { Response } from '../../globals/response';

Moralis.Cloud.define('getBounty', async (request) => {
    // @ts-expect-error
    const logger = Moralis.Cloud.getLogger();

    try {
        const result = await getBounty(request.params.bountyId);
        if (!result) {
            throw new Error('NO_BOUNTIES_FOUND');
        }
        return new Response<BountyModel>(true, result).create();
    } catch (e: any) {
        logger.error(`[getBounty] error: ${JSON.stringify(e) || e}`);
        return new Response<string>(false, e).create();
    }
},
    // @ts-expect-error
    {
        fields: {
            bountyId: { required: true, type: String, error: 'Missing bountyId' },
        },
        requireUser: false,
    },
);

export default Moralis;
