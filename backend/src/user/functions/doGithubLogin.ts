import { generateGHHeaders } from '../../globals/generateHeaders';
import { Response } from '../../globals/response';
import { getOrCreateUserProfileModel } from '../model';

Moralis.Cloud.define('githubLogin', async (request) => {
    const config = await Moralis.Config.get({ useMasterKey: true });
    // @ts-expect-error
    const logger = Moralis.Cloud.getLogger();
    const GITHUB_CLIENT_ID = config.get("GITHUB_CLIENT_ID");
    const GITHUB_CLIENT_SECRET = config.get("GITHUB_CLIENT_SECRET");

    if (!request?.user?.id) {
        throw new Error("USER_NOT_LOGGED_IN");
    }

    try {
        const url = `https://github.com/login/oauth/access_token?client_id=${GITHUB_CLIENT_ID}&client_secret=${GITHUB_CLIENT_SECRET}&code=${request.params.code}`;
        const response = await Moralis.Cloud.httpRequest({
            method: 'POST',
            url,
            headers: generateGHHeaders(),
        });

        if (!response?.data?.access_token) {
            logger.info(`[githubLogin] ${response?.status} - ${JSON.stringify(response?.data)}`);
            throw new Error(response?.data?.error);
        }

        const model = {
            githubToken: response.data.access_token,
            userId: request.user.id,
        };

        const modelInstance = await getOrCreateUserProfileModel(model)
        logger.info(`[githubLogin] Saving ${JSON.stringify(modelInstance)}`);
        await modelInstance.save(model, { useMasterKey: true });

        return new Response(true).create();
    } catch (e: any) {
        logger.error(`[githubLogin] error: ${JSON.stringify(e) || e}`);
        return new Response<string>(false, e).create();
    }
},
    // @ts-expect-error
    {
        fields: {
            code: { required: true, type: String, error: 'Missing code' },
        },
        requireUser: true,
    });

export default Moralis;
