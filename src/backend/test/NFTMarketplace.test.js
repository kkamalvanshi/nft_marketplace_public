//importing chai
const { expect } = require("chai");
const { ethers } = require("hardhat");

//converts ethers to Wei
const toWei = (num) => ethers.utils.parseEther(num.toString()) //wei is the smallest subdivision of ether (penny of ethereum) 18 decimal places
const fromWei = (num) => ethers.utils.formatEther(num)

//chaijs documentation: describe

//writing tests
//name of test: nft marketplace
//anonymous callback function: function without name
describe("NFTMarketplace", function() {
    //variables within array when detching test accounts (deployer, addr1, addr2)
    let deployer, addr1, addr2, nft, marketplace
    let feePercent = 1
    let URI="Sample URI" //metadata for test token

    //before each prevents us from copying code at the beginning of each test
    beforeEach(async function() {
        //write all of the tests
        //get contract factories for each in order to write tests against them
        const NFT = await ethers.getContractFactory("NFT");
        const Marketplace = await ethers.getContractFactory("Marketplace");

        //fetch the test accounts of hardhat development blockchain
        //getting the signers
        [deployer, addr1, addr2] = await ethers.getSigners()

        //deploy contracts
        nft = await NFT.deploy();
        marketplace = await Marketplace.deploy(feePercent);
    });

    //testing for deployment
    describe("Deployment", function(){
        //description of what deployement test should do via it function
        it("Should track name and symbol of nft collection", async function() {
            //use expect from chai library
            //verifies if current name and symbol equal to name and symbol asked for within expect function
            expect(await nft.name()).to.equal("Square NFT")
            expect(await nft.symbol()).to.equal("Square")
        })

        //test for marketplace
        it("Should track feeAccount and feePercent of marketplace", async function() {
            //verifies feePercent and if feeAccount is address of the deployer
            expect(await marketplace.feeAccount()).to.equal(deployer.address);
            expect(await marketplace.feePercent()).to.equal(feePercent)
        });
    })


    describe("Minting NFTs", function() {
        it("Should track each minted NFT", async function() {
            //addr1 mints an nft
            //connecting account to nft contract
            await nft.connect(addr1).mint(URI)//using mint function that inputs URI
            expect(await nft.tokenCount()).to.equal(1); //checks tokenCount
            expect(await nft.balanceOf(addr1.address)).to.equal(1); //nft balance of addr1 is equal to 1
            expect(await nft.tokenURI(1)).to.equal(URI); //tokenURI of the first token is equal to the test URI

            //addr2 mints an nft
            await nft.connect(addr2).mint(URI)
            expect(await nft.tokenCount()).to.equal(2);
            expect(await nft.balanceOf(addr2.address)).to.equal(1); //verify whether addr2 has 1 nft since they minted only 1 nft
            expect(await nft.tokenURI(2)).to.equal(URI);
        })
    })
    

    describe("Making marketplace items", function () {
        beforeEach(async function () {
            //addr1 mints an nft
            await nft.connect (addr1).mint(URI);
            //addr1 approves marketplace to spend nft
            //in order for transferfrom function to work, caller of makeItem needs to have approved marketplace contract to transfer
            await nft.connect(addr1).setApprovalForAll(marketplace.address, true)
        })
        it("Should track newly created item, transfer NFT from seller to marketplace and emit Offered event", async function() {
            //addr1 offers nft at price of 1 ether
            await expect(marketplace.connect(addr1).makeItem(nft.address, 1, toWei(1))) //toWei(1) is the price set because can't represent decimal values in solidity, it only takes in integers
                .to.emit(marketplace, "Offered")
                .withArgs(
                    1,
                    nft.address,
                    1,
                    toWei(1),
                    addr1.address
                )
            //check if transaction offered had arguments within withArgs ^^

            //check if the marketplace is the owner of the nft
            expect(await nft.ownerOf(1)).to.equal(marketplace.address);
            //check if itemCount is equal to 1
            expect(await marketplace.itemCount()).to.equal(1)

            //fetch newly created item
            const item = await marketplace.items(1) //passing the key of 1
            expect(item.itemId).to.equal(1)
            expect(item.nft).to.equal(nft.address)
            expect(item.tokenId).to.equal(1)
            expect(item.price).to.equal(toWei(1))
            expect(item.sold).to.equal(false)
        });

        it("Should fail if price is set to 0", async function() {
            //addr1 offers nft at price of 0 ether
            await expect(marketplace.connect(addr1).makeItem(nft.address, 1, 0)) //toWei(1) is the price set because can't represent decimal values in solidity, it only takes in integers
                .to.be.revertedWith("Price must be greater than zero"); //same message as the require statement

                //require statement: require(_price > 0, "Price must be greater than zero");
            //should return error message and revert transaction
        });
    });

    describe("Purchasing marketplace items", function () {
        beforeEach(async function() {
            //addr1 mints nft
            await nft.connect(addr1).mint(URI)
            //addr1 approves marketplace to spend nft
            await nft.connect(addr1).setApprovalForAll(marketplace.address, true)
            //addr1 makes their nft a marketplace item
            await marketplace.connect(addr1).makeItem(nft.address, 1, toWei(2))
        })

        it("Should update item as sold, pay the seller, transfer nft to buyer, charge fees and emit a Bought event", async function() {
            //get initial eth balance of seller (addr1)
            const sellerInitialEthBal = await addr1.getBalance()
            //get initial eth balance of fee account (deployer)
            const feeAccountInitialEthBal = await deployer.getBalance()

            //fetch items total price (market fees + item price)
            totalPriceInWei = await marketplace.getTotalPrice(1); //price of itemId 1
            //addr2 purchases the item
            //setting value property of price in wei
            await expect(marketplace.connect(addr2).purchaseItem(1, { value: totalPriceInWei}))
                .to.emit(marketplace, "Bought")
                .withArgs(
                    1,
                    nft.address,
                    1,
                    toWei(price),
                    addr1.address,
                    addr1.address
                )
        })
    })

})