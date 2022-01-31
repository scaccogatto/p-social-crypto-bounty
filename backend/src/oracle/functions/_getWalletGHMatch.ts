import { Response } from '../../globals/response';
import { getGithubUsernameFromUser, getUserProfileModelFromWalletAddress } from '../../user/model';

Moralis.Cloud.define('getWalletGHMatch', async (request) => {
    // @ts-expect-error
    const logger = Moralis.Cloud.getLogger();

    try {
        logger.info(`Oracle Calling: ${request.params.walletAddress} ${request.params.gitHubUsername}`);
        const user = await getUserProfileModelFromWalletAddress(request.params.walletAddress.toLowerCase());
        if (!user?.id) throw new Error('NO_USER_FOUND');
        const userGitHubUsername = await getGithubUsernameFromUser(user?.get('userId'));
        return new Response<boolean>(true, userGitHubUsername === request.params.gitHubUsername).create();
    } catch (e: any) {
        logger.error(`[getWalletGHMatch] error: ${e?.message || JSON.stringify(e) || e}`);
        return new Response<string>(false, e).create();
    }

},
    // @ts-expect-error
    {
        fields: {
            walletAddress: { required: true, type: String, error: 'Missing walletAddress' },
            gitHubUsername: { required: true, type: String, error: 'Missing gitHubUsername' },
        },
        requireUser: false,
    }
);

export default Moralis;