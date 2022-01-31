import { checkIfYourUserCanRedeemBounty } from '../../bounty/functions/redeemBounty';
import { getBountyFromGHIssueUrl } from '../../bounty/model';
import { Response } from '../../globals/response';
import { getGithubUsernameFromUser, getUserProfileModelFromWalletAddress } from '../../user/model';

Moralis.Cloud.define('getWalletAddressIssueMatch', async (request) => {
    // @ts-expect-error
    const logger = Moralis.Cloud.getLogger();

    try {
        logger.info(`Oracle Calling: ${request?.params?.walletAddress} ${request?.params?.issueUrl}`);
        const [user, bounty] = await Promise.all([
            getUserProfileModelFromWalletAddress(request.params.walletAddress.toLowerCase()),
            getBountyFromGHIssueUrl(request.params.issueUrl),
        ]);
        if (!user?.id) throw new Error('USER_NOT_FOUND');
        if (!bounty) throw new Error('BOUNTY_NOT_FOUND');
        const githubToken = user?.get('githubToken');
        const gitHubUsername = await getGithubUsernameFromUser(user?.get('userId'));
        const response = await checkIfYourUserCanRedeemBounty(bounty.id, gitHubUsername, githubToken);
        return new Response<boolean>(true, response).create();
    } catch (e: any) {
        if (e?.message === 'ISSUE_NOT_MERGED' || e?.message === 'CLOSING_EVENT_NOT_FOUND') {
            return new Response<boolean>(true, false, e?.message).create();
        }
        logger.error(`[getWalletAddressIssueMatch] error: ${e?.message || JSON.stringify(e) || e}`);
        return new Response<boolean>(e, false, e?.message).create();
    }
},
    // @ts-expect-error
    {
        fields: {
            issueUrl: {
                required: true,
                type: String,
                error: 'Missing issueUrl',
                options: (val: string) => {
                    return new URL(val).host === 'github.com' || new URL(val).host === 'www.github.com';
                },
            },
            walletAddress: { required: true, type: String, error: 'Missing walletAddress' },
        },
        requireUser: false,
    }
);

export default Moralis;