import { BountyModel, getBounty, getBountyFromGHIssueUrl } from '../model';
import { Response } from '../../globals/response';

Moralis.Cloud.define('getBountyFromIssueUrl', async (request) => {
    // @ts-expect-error
    const logger = Moralis.Cloud.getLogger();
    
    try {
        const result = await getBountyFromGHIssueUrl(request.params.issueUrl);
        return new Response<BountyModel>(true, result).create();
    } catch (e: any) {
        logger.error(`[getBounty] error: ${JSON.stringify(e) || e}`);
        return new Response<string>(false, e).create();
    }
},
    // @ts-expect-error
    {
        fields: {
            issueUrl: { required: true, type: String, error: 'Missing issueUrl' },
        },
        requireUser: false,
    },
);

export default Moralis;
