import { Response } from '../../globals/response';
import { getBountyFromGHIssueUrl } from '../model';
import { getUserProfileModel } from '../../user/model';
import { generateGHHeaders } from '../../globals/generateHeaders';

Moralis.Cloud.define('createBountyCheck', async (request) => {
    // @ts-expect-error
    const logger = Moralis.Cloud.getLogger();

    if (!request?.user?.id) {
        throw new Error("USER_NOT_LOGGED_IN");
    }

    const [isBountyAlreadyRegistered, userEthAddress, user] = await Promise.all([
        getBountyFromGHIssueUrl(request.params.issueUrl),
        request.user.get('ethAddress'),
        getUserProfileModel(request.user.id),
    ]);

    if (isBountyAlreadyRegistered) {
        return new Response<string>(false, 'Bounty already registered').create();
    }

    try {
        // https://github.com/facebook/react/issues/23130 => https://api.github.com/repos/facebook/react/issues/23130
        const parsedGHUrl = new URL(request.params.issueUrl).pathname;
        // Get issue from GitHub API
        const issue = await Moralis.Cloud.httpRequest({
            method: 'GET',
            url: `https://api.github.com/repos${parsedGHUrl}`,
            headers: generateGHHeaders(),
        });

        if (!issue?.data || (issue?.status || 0) > 399) {
            return new Response<string>(false, 'Issue not found on GitHub!').create();
        }

        return new Response<undefined>(true).create();
    } catch (e: any) {
        logger.error(`[createBounty] error: ${e?.message || JSON.stringify(e) || e}`);
        return new Response<string>(false, e).create();
    }
},
    // @ts-expect-error
    {
        fields: {
            issueUrl: {
                required: true,
                type: String,
                error: 'Missing or invalid issueUrl',
                options: (url: string) => {
                    if (!url.startsWith("https://github.com/") && !url.startsWith("https://www.github.com/")) {
                        return false
                    }
                    if (!url.includes("/issues/")) {
                        return false;
                    }
                    return true;
                }
            },
            expiration: {
                required: true,
                type: String,
                error: 'Missing or invalid expiration',
                options: (date: string) => new Date(date).getTime() > Date.now()
            },
            prizeInAvax: {
                required: true,
                type: Number,
                error: 'Missing or invalid prizeInAvax',
                options: (prize: number) => prize >= 0.00032
            }
        },
        requireUser: true,
    });

export default Moralis;
