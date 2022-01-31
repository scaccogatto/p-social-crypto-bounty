export const generateGHHeaders = () => ({
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'Social-Crypto-Bounties'
});

export const generateGHHeadersHTML = () => ({
    Accept: 'text/html',
    'User-Agent': 'Social-Crypto-Bounties'
});

export const generateGHAuthenticatedHeaders = (userGHToken: string) => ({
    ...generateGHHeaders(),
    Authorization: `token ${userGHToken}`,
});