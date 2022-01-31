import { BountyModel, getAllBounties } from '../model';
import { Response } from '../../globals/response';

Moralis.Cloud.define('getBounties', async (request) => {
    // @ts-expect-error
    const logger = Moralis.Cloud.getLogger();

    try {
        const result = await getAllBounties()
        return new Response<BountyModel[]>(true, result).create();
    } catch (e: any) {
        logger.error(`[getBounties] error: ${JSON.stringify(e) || e}`);
        return new Response<string>(false, e).create();
    }
},
    // @ts-expect-error
    {
        requireUser: false,
    });

export default Moralis;
