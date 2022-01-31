- [X] endpoint che avvia lo smart contract `(funder: any) => (issueAddress: string, bounty: number) => Response<{ result: boolean, message: string}>` (createBounty)
- [X] lista delle bounties attive (per ora facciamo un getAll tipo e le filtro FE, poi sistemiamo quando diventa virale) `() => Response<{ result: boolean, bounties: Bounty[] }>`
- [X] bounty detail `(bountyId: string) => Response<{ result: boolean: bounty: Bounty }>`
- [X] reedem `(ghAccount: any) => (bountyId: string) => Response<{ result: boolean, message: string}>` aggiungere "mocked: boolean" in request per farti rispondere boolean
- [x] API per oracle `(walletAddress: string, githubUsername: string) => Response<boolean>` serve per poter confermare dall'oracolo che quello username corrisponde all'indirizzo che lo sta chiamando 
- [] Oracle `(issue: string) => Response<{ result: boolean, message: string }>` dovrebbe essere atomico, runnare per ogni bounty in maniera indipendente (trigger quando fai reedem? => YES, non è una funzione esposta ma chiamata internamente da redeem)
- [] profile `(uid: string) => Response<{ result: boolean, user: UserProfile }>` i metadati sono cose tipo, le bounty che hai chiuso, badges varie, boh

interface BountyModel {
    id: string;
    issueLink: string;
    contractId: string;
    owner: string;
    expiration: Date;
    description?: string;
}

interface UserProfileModel {
    username: string;
    profileImage?: string;
    badges: string[];
    subscribedBounties: string[];
    reedemedBounties: string[];
}

interface UserProfile {
    username: string;
    profileImage?: string;
    ethAddress: string; // Get it from Moralis.User
    badges: Badge[]; // Get it from query
    subscribedBounties: Bounty[]; // Get it from query
    reedemedBounties: Bounty[]; // Get it from query
}

interface BadgeModel {
    id: string;
    name: string;
    contractId: string;
    imageUrl: string;
}