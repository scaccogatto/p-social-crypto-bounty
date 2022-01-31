import { generateGHAuthenticatedHeaders } from "../globals/generateHeaders";

// @ts-expect-error
const logger = Moralis.Cloud.getLogger();
interface IUserProfile {
    userId: string;
    githubToken: string;
    // bounties: string[];
}
class UserProfile extends Moralis.Object<IUserProfile> {
    constructor(attrs: IUserProfile) {
        super('UserProfile', attrs);
        this.set(attrs);
    }
}

export const createUserProfileModel = (initData: IUserProfile) => {
    Moralis.Object.registerSubclass('UserProfile', UserProfile);
    const modelInstance = new UserProfile(initData);
    return modelInstance;
}

export const getOrCreateUserProfileModel = async (initData: IUserProfile) => {
    Moralis.Object.registerSubclass('UserProfile', UserProfile);
    const query = new Moralis.Query("UserProfile");
    query.equalTo("userId", initData.userId);
    const results = await query.find({ useMasterKey: true });

    if (results.length > 0) {
        logger.info('getOrCreateUserProfileModel: found user profile');
        if (results.length > 1) throw new Error('Multiple users found');
        return results[0];
    }

    logger.info('getOrCreateUserProfileModel: creating user profile');
    const modelInstance = new UserProfile(initData);
    return modelInstance;
}

export const getUserProfileModel = async (userId: string) => {
    Moralis.Object.registerSubclass('UserProfile', UserProfile);
    const query = new Moralis.Query("UserProfile");
    query.equalTo("userId", userId);
    const results = await query.find({ useMasterKey: true });
    logger.info(`getUserProfileModel: found user profile with userId: ${userId}`);
    if (results.length > 0) {
        if (results.length > 1) throw new Error('Multiple users found');
        return results[0];
    }
}

export const getUserProfileModelFromWalletAddress = async (walletAddress: string) => {
    const query = new Moralis.Query('User');
    query.equalTo('ethAddress', walletAddress);
    const results = await query.find({ useMasterKey: true });
    if (results.length === 0 || results.length > 1) {
        throw new Error(results.length > 1 ? 'MULTIPLE_USERS_FOUND' : 'NO_USER_FOUND');
    }
    const userId = results[0].id;
    return getUserProfileModel(userId);
}

export const getGithubUsernameFromUser = async (userId: string) => {
    const user = await getUserProfileModel(userId);
    if (!user) throw new Error('GGUFU_USER_NOT_FOUND');
    const userGHToken = user.get('githubToken');
    const { data, status } = await Moralis.Cloud.httpRequest({
        method: 'GET',
        url: `https://api.github.com/user`,
        headers: generateGHAuthenticatedHeaders(userGHToken),
    });
    if (status && status > 399) throw new Error(data || 'GITHUB_API_ERROR');
    if (!data?.login) throw new Error('GITHUB_API_ERROR');
    return data.login;
}

export default Moralis;