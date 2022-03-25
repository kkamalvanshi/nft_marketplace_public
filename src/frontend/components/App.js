
import logo from './logo.png';
import './App.css';

//allows website to connect to metamask
import { ethers } from "ethers"
import { useState } from "react"

import MarketplaceAbi from '../contractsData/Marketplace.json'
import MarketplaceAddress from '../contractsData/Marketplace-address.json'
import NFTAbi from '../contractsData/NFT.json'
import NFTAddress from '../contractsData/NFT-address.json'

function App() {
  //account is initially set to null
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState(null)
  const [marketplace, setMarketplace] = useState({})
  const [nft, setNFT] = useState({})

  //Connecting to metamask wallet
  const web3Handler = async () => {
    const accounts = await window.ethereum.request({ method : 'eth_requestAccounts' });
    //provider from metamask
    setAccount(accounts[0])
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    //set signer of the connected account
    const signer = provider.getSigner()


    loadContracts(signer)
  }

  const loadContracts = async (signer) => {
    //get deployed copy of marketplace contract by calling ethers.Contract
    const marketplace = new ethers.Contract(MarketplaceAddress.address, MarketplaceAbi.abi, signer)
    setMarketplace(marketplace)
    //get deployed copy of nft contract by callng ethers.Contract
    const nft = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer)
    setNFT(nft)
    setLoading(false)
  }

  return (
    <div>
      
      <div className="container-fluid mt-5">
        <div className="row">
          <main role="main" className="col-lg-12 d-flex text-center">
            <div className="content mx-auto mt-5">
              <a
                href="http://www.dappuniversity.com/bootcamp"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={logo} className="App-logo" alt="logo"/>
              </a>
              <h1 className= "mt-5">Dapp University Starter Kit</h1>
              <p>
                Edit <code>src/frontend/components/App.js</code> and save to reload.
              </p>
              <a
                className="App-link"
                href="http://www.dappuniversity.com/bootcamp"
                target="_blank"
                rel="noopener noreferrer"
              >
                LEARN BLOCKCHAIN <u><b>NOW! </b></u>
              </a>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
