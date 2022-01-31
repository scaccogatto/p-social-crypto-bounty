import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract, getDefaultProvider } from "ethers";
import { ethers } from "hardhat";

describe("CryptoSocialBounty", function () {
    let contractInstance: Contract | null = null;
    let owner: SignerWithAddress | null = null;

    const FAKE_BOUNTY_URL = 'https://github.com/sampleissue/1';
    const FAKE_BOUNTY_EXPDATE = Math.ceil((Date.now() + 3500) / 1000);
    const FAKE_BOUNTY_VALUE = ethers.utils.parseEther('0.1');

    this.beforeAll(async () => {
        const contract = await ethers.getContractFactory("CryptoSocialBounty");
        [owner] = await ethers.getSigners();
        contractInstance = await contract.deploy();
        await contractInstance.deployed();
    });

    it("should create a bounty", async () => {
        const res = await contractInstance?.addBounty(
            FAKE_BOUNTY_URL,
            FAKE_BOUNTY_EXPDATE,
            {
                value: FAKE_BOUNTY_VALUE,
            })

        await res.wait();
        expect(res).to.not.be.undefined;
    })

    it("should check if created bounty exists", async () => {
        const res = await contractInstance?.bounties(FAKE_BOUNTY_URL);
        expect(res.exists).to.be.true;
    });

    it("should check if created bounty has same bountyUrl", async () => {
        const res = await contractInstance?.bounties(FAKE_BOUNTY_URL);
        expect(res.bountyUrl).to.be.equal(FAKE_BOUNTY_URL);
    })

    it("should check if created bounty has same expirationDate", async () => {
        const res = await contractInstance?.bounties(FAKE_BOUNTY_URL);
        expect(res.expirationDate).to.be.equal(FAKE_BOUNTY_EXPDATE);
    })

    it("should check if created bounty has same bountyAmount", async () => {
        const res = await contractInstance?.bounties(FAKE_BOUNTY_URL);
        expect(res.bountyAmount).to.be.equal(FAKE_BOUNTY_VALUE);
    })

    it("should check if created bounty has same bountyCreator", async () => {
        const res = await contractInstance?.bounties(FAKE_BOUNTY_URL);
        expect(res.bountyCreator).to.be.equal(owner!.address);
    })

    it("should check if created bounty exists with getBounty SC function", async () => {
        const res = await contractInstance?.getBounty(FAKE_BOUNTY_URL);
        expect(res).to.not.be.undefined;
    });

    it("should check if created bounty has same bountyUrl with getBounty SC function", async () => {
        const res = await contractInstance?.getBounty(FAKE_BOUNTY_URL);
        expect(res.bountyUrl).to.be.equal(FAKE_BOUNTY_URL);
    })

    it("should check if created bounty has same expirationDate with getBounty SC function", async () => {
        const res = await contractInstance?.getBounty(FAKE_BOUNTY_URL);
        expect(res.expirationDate).to.be.equal(FAKE_BOUNTY_EXPDATE);
    })

    it("should check if created bounty has same bountyAmount with getBounty SC function", async () => {
        const res = await contractInstance?.getBounty(FAKE_BOUNTY_URL);
        expect(res.bountyAmount).to.be.equal(FAKE_BOUNTY_VALUE);
    })

    it("should check if created bounty has same bountyCreator with getBounty SC function", async () => {
        const res = await contractInstance?.getBounty(FAKE_BOUNTY_URL);
        expect(res.bountyCreator).to.be.equal(owner!.address);
    })

    it("shouldnt create bounty if already exists", async () => {
        try {
            const res = await contractInstance?.addBounty(
                FAKE_BOUNTY_URL,
                FAKE_BOUNTY_EXPDATE,
                {
                    value: FAKE_BOUNTY_VALUE,
                })

            await res.wait();
        } catch (e: any) {
            expect(e?.message?.includes(`Bounty already exists`)).to.be.true;
        }
    })

    it("shouldnt create bounty if invalid expiration date", async () => {
        try {
            const res = await contractInstance?.addBounty(
                FAKE_BOUNTY_URL + '2',
                Math.ceil(new Date().setFullYear(2000) / 1000),
                {
                    value: FAKE_BOUNTY_VALUE,
                })

            await res.wait();
        } catch (e: any) {
            expect(e?.message?.includes(`Bounty expiration date must be greater than now!`)).to.be.true;
        }
    })

    it("shouldnt create bounty if invalid url", async () => {
        try {
            const res = await contractInstance?.addBounty(
                '',
                FAKE_BOUNTY_EXPDATE,
                {
                    value: FAKE_BOUNTY_VALUE,
                })

            await res.wait();
        } catch (e: any) {
            expect(e?.message?.includes(`Bounty URL must be valid`)).to.be.true;
        }
    })

    it("shouldnt create bounty if funds are < 0", async () => {
        try {
            const res = await contractInstance?.addBounty(
                FAKE_BOUNTY_URL,
                FAKE_BOUNTY_EXPDATE,
                {
                    value: 0,
                })

            await res.wait();
        } catch (e: any) {
            expect(e?.message?.includes(`Bounty amount must be greater than 0`)).to.be.true;
        }
    })

    it("shouldnt creator reedem bounty if expirationDate is not passed", async () => {
        try {
            const res = await contractInstance?.bountyCreatorRedeem(FAKE_BOUNTY_URL);
            await res.wait();
        } catch (e: any) {
            expect(e?.message?.includes(`Bounty is not expired yet`)).to.be.true;
        }
    })

    it("sc balance should be greater than 0", async () => {
        if (!contractInstance?.address) { throw new Error() }
        const res = await getDefaultProvider().getBalance(contractInstance?.address);
        expect(Number(res)).to.be.greaterThan(0);
    })

    it("should creator redeem bounty", async () => {
        // Wait for the bounty to expire
        await new Promise((res) => setTimeout(res, 3000));
        const bountyRedeemRes = await contractInstance?.bountyCreatorRedeem(FAKE_BOUNTY_URL);
        await bountyRedeemRes.wait();
        expect(bountyRedeemRes).to.not.be.undefined;
    })

    it("should bounty has been deleted", async () => {
        const res = await contractInstance?.bounties(FAKE_BOUNTY_URL);
        expect(res.exists).to.be.false;
    })
});

describe("CryptoSocialBountyOwnerTest", function () {
    let contractInstance: Contract | null = null;
    let owner: SignerWithAddress | null = null;

    const FAKE_BOUNTY_URL = 'https://github.com/sampleissue/2';
    const FAKE_BOUNTY_EXPDATE = Math.ceil((new Date().setFullYear(new Date().getFullYear() + 1)) / 1000);
    const FAKE_BOUNTY_VALUE = ethers.utils.parseEther('0.1');

    this.beforeAll(async () => {
        const contract = await ethers.getContractFactory("CryptoSocialBounty");
        [owner] = await ethers.getSigners();
        contractInstance = await contract.deploy();
        await contractInstance.deployed();
    });

    it("should create a bounty", async () => {
        const res = await contractInstance?.addBounty(
            FAKE_BOUNTY_URL,
            FAKE_BOUNTY_EXPDATE,
            {
                value: FAKE_BOUNTY_VALUE,
            })

        await res.wait();
        expect(res).to.not.be.undefined;
    })

    it("should check if created bounty exists", async () => {
        const res = await contractInstance?.bounties(FAKE_BOUNTY_URL);
        expect(res.exists).to.be.true;
    });

    it("should check if created bounty has same bountyUrl", async () => {
        const res = await contractInstance?.bounties(FAKE_BOUNTY_URL);
        expect(res.bountyUrl).to.be.equal(FAKE_BOUNTY_URL);
    })

    it("should check if created bounty has same expirationDate", async () => {
        const res = await contractInstance?.bounties(FAKE_BOUNTY_URL);
        expect(res.expirationDate).to.be.equal(FAKE_BOUNTY_EXPDATE);
    })

    it("should check if created bounty has same bountyAmount", async () => {
        const res = await contractInstance?.bounties(FAKE_BOUNTY_URL);
        expect(res.bountyAmount).to.be.equal(FAKE_BOUNTY_VALUE);
    })

    it("should owner redeem bounty", async () => {
        const bountyRedeemRes = await contractInstance?.bountyRedeem(FAKE_BOUNTY_URL);
        await bountyRedeemRes.wait();
        expect(bountyRedeemRes).to.not.be.undefined;
    })

    it("should bounty has been deleted", async () => {
        const res = await contractInstance?.bounties(FAKE_BOUNTY_URL);
        expect(res.exists).to.be.false;
    })

    it("should invalidate the contract", async () => {
        const res = await contractInstance?._invalidateContract()
        await res.wait();
        expect(res.success).to.be.undefined;
    })

    it("the contract should be now invalid", async () => {
        try {
            const res = await contractInstance?.addBounty(
                FAKE_BOUNTY_URL,
                FAKE_BOUNTY_EXPDATE,
                {
                    value: FAKE_BOUNTY_VALUE,
                })

            await res.wait();
        } catch (e: any) {
            expect(e?.message?.includes(`Contract is invalidated`)).to.be.true;
        }
    })
});
