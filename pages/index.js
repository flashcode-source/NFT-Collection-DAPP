import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Grid from '@mui/material/Grid'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Web3Modal from "web3modal";
import {Contract, providers} from 'ethers';
import { CONTRACT_ADDRESS, ABI } from '../constants';
import { useWindowSize, useWindowHeight, useWindowWidth } from '@react-hook/window-size'
import SnackBar from '../components/SnackBar'
import ConfettiDrop from '../components/ConfettiDrop';
import BackDropLoading from '../components/BackDropLoading';

const Home = () => {

const [walletConnected, setWalletConnected] = useState(false);
const [joinedWhitelist, setJoinedWhitelist] = useState(false);
const [numberJoined, setNummberjoined] = useState(0);
const [loading, setLoading] = useState(false);
const [showErrorAccount, setShowErrorAccount] = useState(false);
const [width, height] = useWindowSize();
const [winWidth, setWd] = useState(width);
const [winHeight, setHt] = useState(height);
const web3ModalRef = useRef();
const [openBackDrop, setOpenBackDrop] = useState(false)


const getProviderOrSigner = async(needSigner=false) => {
    try {
        if(web3ModalRef.current.userOptions.length) {
            setOpenBackDrop(true);
        }
        else {
            console.log("install metamask");
            throw new Error("Error install metamask wallet")
        }
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
    } catch (err) {
            console.log(err)
            setOpenBackDrop(false)
        }
    
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
        setOpenBackDrop(false);
    } catch (err) {
        console.log(err);
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
        console.log(err);
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
        console.log(err)
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
        <SnackBar />
        <BackDropLoading open={openBackDrop} />
        {joinedWhitelist && <ConfettiDrop width={winWidth} height={winHeight}/>}
        <Head>
            <title>Crypto Dev</title>
            <meta name='description' content='Crypto Devs Nft whitelist page' />
        </Head>
      { showErrorAccount && <Alert variant='filled' severity='error' sx={{
          display: 'flex',
          justifyContent: 'center'
        }}>
            <b>Error!!</b> Change to Goerli Network
        </Alert>}
        <Container className={styles.muiContainer} >
            <Grid container sx={{
                position: 'relative',
                top: process.env.NODE_ENV == "production" ? 10: 0 
            }}>
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