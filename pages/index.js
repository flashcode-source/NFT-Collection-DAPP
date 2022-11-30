import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import styles from '../styles/Test.module.css';
import Grid from '@mui/material/Grid'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Web3Modal from 'web3modal';
import {Contract, providers} from 'ethers';
import { CONTRACT_ADDRESS, ABI } from '../constants';

const Home = () => {

const [walletConnected, setWalletConnected] = useState(false);
const [joinedWhitelist, setJoinedWhitelist] = useState(false);
const [numberJoined, setNummberjoined] = useState(0);
const [loading, setLoading] = useState(false);
const [showErrorAccount, setShowErrorAccount] = useState(false);
const web3ModalRef = useRef();

const getProviderOrSigner = async(needSigner=false) => {
        const provider = await web3ModalRef.current.connect();
        const web3Provider = new providers.Web3Provider(provider);
        const {chainId} = await web3Provider.getNetwork();
        
        if(chainId !== 5) {
            setShowErrorAccount(true);
        }

        if(needSigner) {
            const signer = await web3Provider.getSigner();
            return signer;
        }
        return web3Provider;
    
}

const getNumberOfWhitelisted = async() => {
    try {
        const provider = await getProviderOrSigner();
        const nftWhitelistContract = new Contract(
            CONTRACT_ADDRESS,
            ABI,
            provider
        );
        const numberOfWL = await nftWhitelistContract.numAddressesWhitelisted();
        setNummberjoined(numberOfWL);
    } catch (err) {
        console.error(err);
    }
}

const checkAddressWhitelisted = async() => {
    try {
        const signer = await getProviderOrSigner(true);
        const address = await signer.getAddress();
        const nftWhitelistContract = new Contract(
            CONTRACT_ADDRESS,
            ABI,
            signer
        );
        const checkWhitelist = await nftWhitelistContract.whitelistedAddresses(
            address
        );
        setJoinedWhitelist(checkWhitelist);
    } catch (err) {
        console.error(err);
    }

}

const addToWhitelist = async() => {
    try {
        const signer = await getProviderOrSigner(true);
        const address = await signer.getAddress();
        const nftWhitelistContract = new Contract(
            CONTRACT_ADDRESS,
            ABI,
            signer
        );
       const tx = await nftWhitelistContract.addAddressToWhitelist(address);
       setLoading(true);
       await tx.wait();
       await getNumberOfWhitelisted();
       setJoinedWhitelist(true);
       setLoading(false);
    } catch (err) {
        console.error(err)
    }
}

const connectWallet = async() => {
    try {
        await getProviderOrSigner();
        getNumberOfWhitelisted();
        checkAddressWhitelisted();
        setWalletConnected(true);
    } catch (err) {
        console.error(err);
    }
}

const renderButton = () => {
    if(joinedWhitelist) {
        return (
            <p className={styles.description}>
                Thank you for joining the whitelist!!
            </p>
        );
    }
    else {
        return (
            loading?(
                <Button 
                    variant="contained" 
                    sx={{
                        textTransform: 'none',
                    }}
                    color="primary" 
                    disabled
                    >
                        <CircularProgress 
                            color='primary'
                            size={20}
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                position: 'absolute'
                            }}    
                        />
                        join the whitelist
                </Button>
            ):(    
                <Button 
                    variant="contained" 
                    sx={{textTransform: 'none'}}
                    onClick={addToWhitelist}
                    color="primary">
                        join the whitelist
                </Button>
                )
        );
    }
    
}

useEffect(() => {
    if(!walletConnected) {
        web3ModalRef.current = new Web3Modal({
            network: 'goerli',
            providerOptions: {},
            disableInjectedProvider: false
        });
        connectWallet();
    }
}, [walletConnected])

  return (
    <div>
        <Head>
            <title>Crypto Dev</title>
            <meta name='description' content='Is Nft whitelist DApp for developers currently running Goerli testnet' />
        </Head>
      { showErrorAccount && <Alert variant='filled' severity='error' sx={{
          display: 'flex',
          justifyContent: 'center'
        }}>
            <b>Error!!</b> Change to Goerli Network
        </Alert>}
        <Container className={styles.muiContainer} >
            <Grid container>
                <Grid item sm={12} xs={12} md={6} lg={6}>
                    <Box sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <Box>
                        <h3 className={styles.title}>
                            Welcome to Crypto Devs!
                        </h3>
                        <p className={styles.description}>
                            Its an NFT collection for developers in crypto.
                        </p>
                        <p className={styles.description}>
                            {numberJoined} had already joined the whitelist
                        </p>
                        <div>
                            {renderButton()}
                        </div>
                        </Box>
                    </Box>
                </Grid>
                <Grid item sm={12} xs={12} md={6} lg={6}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <img src='./crypto-devs.svg' width={350} height={350} />
                    </Box>
                </Grid>
            </Grid>
        </Container>
        <footer className={styles.footer}>
            My NFT whitelist demo
        </footer>
    </div>
  )
}

export default Home
