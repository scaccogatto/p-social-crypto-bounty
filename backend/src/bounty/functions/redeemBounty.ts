import { getBounty } from '../model';
import { Response } from '../../globals/response';
import { getGithubUsernameFromUser, getUserProfileModel } from '../../user/model';
import { generateGHHeadersHTML, generateGHAuthenticatedHeaders } from '../../globals/generateHeaders';
import { load } from 'cheerio';
import { SCRedeemBounty } from '../../globals/interactWithSC';

// @ts-expect-error
const logger = Moralis.Cloud.getLogger();

export const checkIfYourUserCanRedeemBounty = async (bountyId: string, githubUsername: string, userGHToken: string) => {
    const bounty = await getBounty(bountyId);
    if (!bounty) throw new Error('NO_BOUNTIES_FOUND');

    const bountyUrl = bounty.get('issueUrl');

    logger.info(`[checkIfYourUserCanRedeemBounty] Calling URL ${bountyUrl}`);
    const githubIssueHtml = await Moralis.Cloud.httpRequest({
        method: 'GET',
        url: bountyUrl,
        headers: generateGHHeadersHTML()
    });

    if (githubIssueHtml.status !== 200 || !githubIssueHtml.text) {
        throw new Error('ISSUE_NOT_FOUND_ON_GITHUB');
    }

    // I know this is a real porkaround, but GH has no API to get the closing pr
    const cheerioParsedResponse = load(githubIssueHtml.text);
    const pullRequestUrlEl = cheerioParsedResponse('[data-hovercard-type="pull_request"]')?.attr("href");

    if (!pullRequestUrlEl) {
        throw new Error('ISSUE_NOT_CLOSED');
    }

    const fixingPullRequestRawUrl = new URL(pullRequestUrlEl);
    const fixingPullRequestUrl = `https://api.github.com/repos${fixingPullRequestRawUrl.pathname.replace("pull", "pulls")}`;

    logger.info(`[checkIfYourUserCanRedeemBounty] Calling URL ${fixingPullRequestUrl}`);
    const whoResolvedTheIssueResponse = await Moralis.Cloud.httpRequest({
        method: 'GET',
        url: fixingPullRequestUrl,
        headers: generateGHAuthenticatedHeaders(userGHToken),
    });

    const whoResolvedTheIssue = whoResolvedTheIssueResponse?.data?.user?.login;
    logger.info(whoResolvedTheIssueResponse?.data)

    if (!whoResolvedTheIssue) throw new Error('ISSUE_NOT_RESOLVED');

    logger.info(`[checkIfYourUserCanRedeemBounty] Who resolved the issue: ${whoResolvedTheIssue}, input: ${githubUsername}`);

    return whoResolvedTheIssue === githubUsername;
}

Moralis.Cloud.define('redeemBounty', async (request) => {
    try {
        if (!request?.user?.id) throw new Error("USER_NOT_LOGGED_IN");

        if (request?.params?.mocked) {
            return new Response<{ canRedeem: boolean }>(true, { canRedeem: request?.params?.mocked }).create();
        }

        const [githubUsername, user, bounty] = await Promise.all([
            getGithubUsernameFromUser(request.user.id),
            getUserProfileModel(request.user.id),
            getBounty(request.params.bountyId)
        ]);

        if (!user) throw new Error('NO_USER_FOUND');
        if (!bounty?.id) throw new Error('NO_BOUNTY_FOUND');

        const result = await checkIfYourUserCanRedeemBounty(request.params.bountyId, githubUsername, user.get('githubToken'));
        const transactionId = await SCRedeemBounty(bounty.id, logger);

        await bounty.save({
            description: bounty.get('description'),
            expiration: bounty.get('expiration'),
            issueUrl: bounty.get('issueUrl'),
            isRedeemed: true,
            redeemTransactionHash: transactionId,
        }, { useMasterKey: true });

        return new Response<{ canRedeem: boolean, transactionId: string }>(true, { canRedeem: result, transactionId }).create();
    } catch (e: any) {
        logger.error(`[redeemBounty] error: ${e || JSON.stringify(e)}`);
        return new Response<string>(false, e?.message).create();
    }
},
    // @ts-expect-error
    {
        fields: {
            bountyId: { required: true, type: String, error: 'Missing bountyId' },
        },
        requireUser: true,
    },
);

export default Moralis;
