export interface IBounty {
    issueUrl: string;
    transactionId: string;
    owner: string;
    expiration: Date;
    description: string | undefined;
    prizeInAvax: number;
    isRedeemed: boolean;
    redeemTransactionHash: string | undefined;
}
export class BountyModel extends Moralis.Object<IBounty> {
    constructor(attrs: IBounty) {
        super('Bounty', attrs);
        this.set(attrs);
    }
}

export const createBounty = (initData: IBounty) => {
    Moralis.Object.registerSubclass('Bounty', BountyModel);
    const modelInstance = new BountyModel(initData);
    return modelInstance;
}

export const getOrCreateBounty = async (initData: IBounty | string) => {
    Moralis.Object.registerSubclass('Bounty', BountyModel);
    const query = new Moralis.Query('Bounty');
    if (typeof initData === 'string') {
        query.equalTo("id", initData);
    } else {
        Object.keys(initData).forEach(key => {
            // @ts-expect-error
            query.equalTo(key, initData[key]);
        });
    }
    const results = await query.find({ useMasterKey: true });

    if (results.length > 0) {
        if (results.length > 1) throw new Error('MULTIPLE_BOUNTIES_FOUND');
        return results[0];
    }

    if (typeof initData === 'string') {
        throw new Error('NO_BOUNTIES_FOUND');
    }

    const modelInstance = new BountyModel(initData);
    return modelInstance;
}

export const getBounty = async (initData: IBounty | string) => {
    Moralis.Object.registerSubclass('Bounty', BountyModel);
    const query = new Moralis.Query('Bounty');

    if (typeof initData === 'string') {
        query.equalTo("objectId", initData);
    } else {
        Object.keys(initData).forEach(key => {
            // @ts-expect-error
            query.equalTo(key, initData[key]);
        });
    }

    const results = await query.find({ useMasterKey: true });

    if (results.length > 0) {
        if (results.length > 1) throw new Error('MULTIPLE_BOUNTIES_FOUND');
        return results[0] as BountyModel;
    }
}

export const getAllBounties = async () => {
    Moralis.Object.registerSubclass('Bounty', BountyModel);
    const query = new Moralis.Query('Bounty');
    const results = await query.find({ useMasterKey: true });
    return results as BountyModel[];
}

export const getBountyFromGHIssueUrl = async (url: string) => {
    Moralis.Object.registerSubclass('Bounty', BountyModel);
    const query = new Moralis.Query('Bounty');
    query.equalTo("issueUrl", url);
    const results = await query.find({ useMasterKey: true });
    
    if (results.length > 1) {
        throw new Error('MULTIPLE_BOUNTIES_FOUND');
    }
    
    return results?.[0] as BountyModel;
}

export default Moralis;