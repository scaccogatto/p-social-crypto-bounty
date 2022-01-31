import { Response } from '../../globals/response';
import { getUserProfileModel, getUserProfileModelFromWalletAddress } from '../model';

Moralis.Cloud.define('isUserRegisteredWithGH', async (request) => {
    // @ts-expect-error
    const logger = Moralis.Cloud.getLogger();

    if (!request?.user?.id || request?.params?.walletAddress) {
        throw new Error("USER_NOT_LOGGED_IN");
    }

    try {
        if (request?.params?.walletAddress) {
            const modelInstance = await getUserProfileModelFromWalletAddress(request?.params?.walletAddress);
            return new Response<boolean>(true, !!modelInstance?.get('githubToken')).create();
        }

        const modelInstance = await getUserProfileModel(request.user.id)
        return new Response<boolean>(true, !!modelInstance?.get('githubToken')).create();
    } catch (e: any) {
        logger.error(`[githubLogin] error: ${JSON.stringify(e) || e}`);
        return new Response<string>(false, e).create();
    }
},
    // @ts-expect-error
    {
        requireUser: true,
    });

export default Moralis;