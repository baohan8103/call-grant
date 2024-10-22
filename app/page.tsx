"use client"
import { PeraWalletConnect } from "@perawallet/connect";
import { useEffect, useState } from "react";
import { FaWallet, FaUsers, FaRocket } from 'react-icons/fa';
import algosdk from 'algosdk';
import { NetworkId, useWallet } from '@txnlab/use-wallet-react';
import React from "react";
import Image from 'next/image';

const peraWallet = new PeraWalletConnect();

interface Project {
  id: number;
  name: string;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  image: string;
  endDate: string;
}

export default function Home() {
  const {
    algodClient,
    activeAddress,
    setActiveNetwork,
    transactionSigner,
    wallets
  } = useWallet();
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const isConnectedToPeraWallet = !!accountAddress;
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      name: "DeFi Lending Platform",
      description: "A decentralized lending platform for crypto assets",
      goalAmount: 500000,
      raisedAmount: 250000,
      image: "https://peach-realistic-spider-498.mypinata.cloud/ipfs/QmPey2hP619WpPWeHfDEdskNhYwJ6pm7dTRNeL4sSPJXQ7",
      endDate: "2024-06-30"
    },
    {
      id: 2,
      name: "NFT Marketplace",
      description: "A marketplace for trading unique digital assets",
      goalAmount: 300000,
      raisedAmount: 150000,
      image: "https://peach-realistic-spider-498.mypinata.cloud/ipfs/QmYPF68Aa2Ng9QUUdZ16NYJ8dyNTTRqv6ej7YoJankGKkY",
      endDate: "2024-07-15"
    },
    {
      id: 3,
      name: "Decentralized Exchange",
      description: "A fully decentralized exchange for crypto trading",
      goalAmount: 1000000,
      raisedAmount: 750000,
      image: "https://peach-realistic-spider-498.mypinata.cloud/ipfs/QmcX9JyVp6PjF8Nb9D5bcbJVp2tZWFBQheSMASq1ynY9mJ",
      endDate: "2024-08-31"
    },
  ]);

  useEffect(() => {
    peraWallet
      .reconnectSession()
      .then((accounts: string[]) => {
        peraWallet.connector?.on("disconnect", handleDisconnectWalletClick);
        if (accounts.length) {
          setAccountAddress(accounts[0]);
        }
      })
      .catch((e: Error) => console.log(e));
  }, []);

  function handleConnectWalletClick() {
    wallets[0]
      .connect()
      .then((newAccounts) => {
        peraWallet.connector?.on("disconnect", handleDisconnectWalletClick);
        setAccountAddress(newAccounts[0].address);
        setActiveNetwork(NetworkId.TESTNET);
        wallets[0].setActiveAccount(newAccounts[0].address)
      })
      .catch((error) => {
        if (error?.data?.type !== "CONNECT_MODAL_CLOSED") {
          console.log(error);
        }
      });
  }

  function handleDisconnectWalletClick() {
    wallets[0].disconnect();
    setAccountAddress(null);
  }

  async function handleInvest(projectId: number) {
    if (!accountAddress || !activeAddress) {
      alert('Please connect your wallet before investing.');
      return;
    }

    const project = projects.find(p => p.id === projectId);
    if (!project) {
      alert('Project not found.');
      return;
    }

    const investmentAmount = 1; // Number of ALGO to invest, can be changed to a value entered by the user

    try {
      const atc = new algosdk.AtomicTransactionComposer()
      const suggestedParams = await algodClient.getTransactionParams().do()
      const transaction = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        suggestedParams: suggestedParams,
        from: accountAddress,
        to: "DTUA424DKCJYPHF5MLO6CL4R2BWOTH2GLOUQA257K5I7G65ENHSDJ4TTTE",
        amount: investmentAmount * 1000000,
      });
      
      atc.addTransaction({ txn: transaction, signer: transactionSigner })

      const result = await atc.execute(algodClient, 2)
      console.info(`Transaction successful!`, {
        confirmedRound: result.confirmedRound,
        txIDs: result.txIDs
      })
      alert(`You have successfully invested ${investmentAmount} ALGO in the project ${project.name}!`);
      
      // Update the amount raised for the project
      const updatedProjects = projects.map(p => 
        p.id === projectId ? {...p, raisedAmount: p.raisedAmount + investmentAmount} : p
      );
      setProjects(updatedProjects);
    } catch (error) {
      console.error('Error when performing transaction:', error)
      alert('An error occurred while investing. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-800 text-white">
      <header className="bg-black bg-opacity-50 p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">Web3 Startup Funding</h1>
          <button
            className="bg-purple-600 text-white px-6 py-2 rounded-full flex items-center hover:bg-purple-700 transition duration-300"
            onClick={isConnectedToPeraWallet ? handleDisconnectWalletClick : handleConnectWalletClick}
          >
            <FaWallet className="mr-2" />
            {isConnectedToPeraWallet ? "Disconnect Wallet" : "Connect Pera Wallet"}
          </button>
        </div>
      </header>

      <main className="container mx-auto p-8">
        <h2 className="text-4xl font-semibold mb-12 text-center">Featured Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {projects.map((project) => (
            <div key={project.id} className="bg-white bg-opacity-10 rounded-xl shadow-lg overflow-hidden backdrop-filter backdrop-blur-lg">
              <Image 
                src={project.image} 
                alt={project.name} 
                width={500} 
                height={300} 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="font-semibold text-2xl mb-2">{project.name}</h3>
                <p className="text-gray-300 mb-4">{project.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-gray-400">Goal</p>
                    <p className="font-bold">{project.goalAmount.toLocaleString()} ALGO</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Raised</p>
                    <p className="font-bold">{project.raisedAmount.toLocaleString()} ALGO</p>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
                  <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${(project.raisedAmount / project.goalAmount) * 100}%` }}></div>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <FaUsers className="mr-2" />
                    <span>{Math.floor(Math.random() * 1000)} investors</span>
                  </div>
                  <div>
                    <span className="text-sm">Ends: {project.endDate}</span>
                  </div>
                </div>
                <button
                  className="w-full bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700 transition duration-300 flex items-center justify-center"
                  onClick={() => handleInvest(project.id)}
                >
                  <FaRocket className="mr-2" />
                  Invest Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="bg-black bg-opacity-50 text-white p-8 mt-12">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 Web3 Startup Funding. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
