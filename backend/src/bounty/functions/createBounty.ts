import { Response } from '../../globals/response';
import { BountyModel, getBountyFromGHIssueUrl, createBounty, IBounty } from '../model';
import { getUserProfileModel } from '../../user/model';
import { generateGHHeaders } from '../../globals/generateHeaders';
import { utils } from 'ethers';

const checkTransaction = async (transactionId: string, inputData: IBounty, logger: any): Promise<boolean> => {
    const MORALIS_API_KEY = process.env.MORALIS_DEEP_INDEX_APIKEY;
    const { data, status } = await Moralis.Cloud.httpRequest({
        method: 'GET',
        url: `https://deep-index.moralis.io/api/v2/transaction/${transactionId}?chain=avalanche%20testnet`,
        headers: {
            accept: 'application/json',
            'X-API-Key': MORALIS_API_KEY!,
        }
    })
    const transactionDataRaw = data?.input;

    if (!transactionDataRaw || status !== 200) {
        throw new Error('TRANSACTION_NOT_FOUND');
    }

    const contractMethodInterface = new utils.Interface(['function addBounty(string calldata bountyUrl, uint256 expirationDate)']);
    const decodedTransaction = contractMethodInterface.decodeFunctionData('addBounty', transactionDataRaw);
    logger.info(`[checkTransaction] decodedTransaction: ${decodedTransaction}`);
    const [bountyUrl, expirationDateRaw] = decodedTransaction;
    // Converting Unix date (without ms) to JS Date getTime (with ms)
    const jsExpirationDate = +`${expirationDateRaw}000`;
    logger.info(`[checkTransaction INPUT] bountyUrl: ${inputData.issueUrl} - expirationDate: ${inputData.expiration}`);
    logger.info(`[checkTransaction TX] bountyUrl: ${bountyUrl} - expirationDate: ${jsExpirationDate}`);
    return bountyUrl === inputData?.issueUrl && new Date(jsExpirationDate).getTime() === new Date(inputData?.expiration).getTime();
};

Moralis.Cloud.define('createBounty', async (request) => {
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

        const expiration = request?.params.expiration;

        const data = {
            transactionId: request.params.transactionId,
            description: request?.params?.description,
            expiration: expiration,
            issueUrl: request?.params?.issueUrl,
            prizeInAvax: request?.params?.prizeInAvax,
            owner: userEthAddress,
            isRedeemed: false,
            redeemTransactionHash: undefined,
        };

        const transactionMatch = await checkTransaction(request.params.transactionId, data, logger);
        logger.info(`[createBounty] transaction ${request.params.transactionId} ${transactionMatch ? 'matched' : 'did not match'} given params!`);

        if (!transactionMatch) {
            throw new Error('TRANSACTION_MISMATCH');
        }

        const res = await createBounty(data).save(data, { useMasterKey: true });
        return new Response<BountyModel>(true, res).create();
    } catch (e: any) {
        logger.error(`[createBounty] error: ${e?.message || JSON.stringify(e) || e}`);
        return new Response<string>(false, e?.message || JSON.stringify(e) || e).create();
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
            transactionId: {
                required: true,
                type: String,
                error: 'Missing or invalid transactionId',
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
