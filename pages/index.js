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
import {Contract, ethers, providers} from 'ethers';
import { CONTRACT_ADDRESS, ABI } from '../constants';
import { useWindowSize } from '@react-hook/window-size'
import SnackBar from '../components/SnackBar'
import ConfettiDrop from '../components/ConfettiDrop';
import BackDropLoading from '../components/BackDropLoading';
import CustomModal from '../components/CustomModal';
import Image from 'next/image';



const Home = () => {

const [walletConnected, setWalletConnected] = useState(false);
const [numberMinted, setNummberMinted] = useState(0);
const [loading, setLoading] = useState(false);
const [showErrorAccount, setShowErrorAccount] = useState(false);
const [width, height] = useWindowSize();
const [winWidth, setWd] = useState(width);
const [winHeight, setHt] = useState(height);
const web3ModalRef = useRef();
const [openBackDrop, setOpenBackDrop] = useState(false)
const [needMetamsk, setNeedMetamsk] = useState(false)
const [presaleStarted, setPresaleStarted] = useState(false)
const [isOwner, setIsOwner] = useState(false)
const [isPresaleEnded, setIsPresaleEnded] = useState(false)
const [isMintedOpen, setIsMintedOpen] = useState(true)


const getProviderOrSigner = async(needSigner=false) => {
    try {
        if(!web3ModalRef.current.userOptions.length) {
            setNeedMetamsk(true);
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


const connectWallet = async() => {
    try {
        await getProviderOrSigner();
        setWalletConnected(true);
    } catch (err) {
        console.error(err);
    }
}

const checkContractOwnership = async() => {
    try {
        const signer = await getProviderOrSigner(true)
        const userAddress = await signer.getAddress();
        const cryptoDevCon = new Contract(
            CONTRACT_ADDRESS,
            ABI,
            signer
        );
        const owner = await cryptoDevCon.owner()
        
        if (owner == userAddress) {

            setIsOwner(true)
        }


    } catch (err) {
        console.log(err)
    }
}

const checkPresaleStarted = async() => {
 
    try {        
        const provider = await getProviderOrSigner()
        const cryptoDevCon = new Contract(
            CONTRACT_ADDRESS,
            ABI,
            provider
        );
        const isPresaleStarted = await cryptoDevCon.presaleStarted()
        setPresaleStarted(isPresaleStarted);

    } catch (err) {
        console.log(err)
    }

}

const checkPresaleEnded = async() => {
  
    try{
        const provider = await getProviderOrSigner();
        const cryptoDevCon = new Contract(
            CONTRACT_ADDRESS,
            ABI,
            provider
        )
        const presaleEndedTime = await cryptoDevCon.presaleEnded()
        const nowTimeInSec = Math.floor(Date.now() / 1000)
        const presaleEnded = presaleEndedTime.lt(nowTimeInSec);
        setIsPresaleEnded(presaleEnded)

    } catch(err){
        console.log(err)
    }
}

const checkNumberMinted = async() => {
    try {
        const provider = await getProviderOrSigner()
        const cryptoDevCon = new Contract(
            CONTRACT_ADDRESS,
            ABI,
            provider
        )
        const tokenIds = await cryptoDevCon.tokenIds()
        setNummberMinted(tokenIds.toNumber())
    } catch (err) {
        console.log(err)
    }
}

const startPresale = async () => {
    try {
        setLoading(true)
        const signer = await getProviderOrSigner(true)
        const cryptoDevCon = new Contract(
            CONTRACT_ADDRESS,
            ABI,
            signer
        )
        const txn = await cryptoDevCon.startPresale()
        await txn.wait()
        setLoading(false)
    }
    catch(err) {

    }
}

const presaleMint = async() => {
    try {
        setLoading(true)
        const signer = await getProviderOrSigner(true)
        const cryptoDevCon = new Contract(
            CONTRACT_ADDRESS,
            ABI,
            signer
        )
        const txn = await cryptoDevCon.presaleMint({
            value: ethers.utils.parseEther("0.01")
        });
        await txn.wait()
        await checkNumberMinted()
        setLoading(false)
        alert("You have successfully minted crypto Devs NFT")
    } catch (err) {
        console.log(err)
    }
}

const mint = async() => {
    try {
        setLoading(true)
        const signer = await getProviderOrSigner(true)
        const cryptoDevCon = new Contract(
            CONTRACT_ADDRESS,
            ABI,
            signer
        )
        const txn = await cryptoDevCon.mint({
            value: ethers.utils.parseEther("0.01")
        })
        await txn.wait()
        await checkNumberMinted()
        setLoading(false)
        alert("You have successfully minted crypto Devs NFT")
    } catch (err) {
        console.log(err)
    }
}


const loadingButton = () => {
  return (
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
            loading please wait
    </Button>
  )
}

const renderButton = () => {
    if(!presaleStarted && isOwner) {
        return (
               loading? loadingButton() : (<Button 
                    variant="contained" 
                    sx={{textTransform: 'none'}}
                    color="primary"
                    onClick={startPresale}
                    >
                        start presale
                </Button>)
        );
    } else if(!presaleStarted && !isOwner) {
        return (
                <p className={styles.description}>
                    Presale have not yet started
                </p>
        );
    }
    else {
        if(!isPresaleEnded) {
           return ( 
                    loading? loadingButton() : (<Button 
                            variant="contained" 
                            sx={{textTransform: 'none'}}
                            color="primary"
                            onClick={presaleMint}
                                >
                                presale mint
                        </Button>)
                    )
        } else {
            return ( 
                loading? loadingButton() : (<Button 
                        variant="contained" 
                        sx={{textTransform: 'none'}}
                        color="primary"
                        onClick={mint}
                            >
                             mint
                    </Button>)
                )
        }
        
    }
    
}

const onPageLoad = async() => {
    try {
        await connectWallet();
        await checkContractOwnership();
        await checkPresaleStarted();
        await checkPresaleEnded();
        await checkNumberMinted();
        
    setInterval(async() => {
        await checkPresaleEnded()
    }, 5000)

    } catch (err) {
        console.log(err)
    }

}

useEffect(() => {
    
    if(!walletConnected) {
        web3ModalRef.current = new Web3Modal({
            network: 'goerli',
            providerOptions: {},
            disableInjectedProvider: false
        });
        
    }
    onPageLoad();
    
})

  return (
    <div>
        <Head>
            <title>Crypto Dev</title>
            <meta name='description' content='Mint your Crypto Devs NFT with Goerli ETH here' />
        </Head>
        <SnackBar />

        {needMetamsk && <CustomModal />}

        <BackDropLoading open={openBackDrop} />

        {/* {joinedWhitelist && <ConfettiDrop width={winWidth} height={winHeight}/>} */}
      { showErrorAccount && <Alert variant='filled' severity='error' sx={{
          display: 'flex',
          justifyContennpmt: 'center'
        }}>
            <b>Error!!</b> Change to Goerli Network
        </Alert>}
        <Container className={styles.muiContainer} >
            <Grid container sx={{
                position: 'relative',
                top: process.env.NODE_ENV == "production" ? '100px': 0 
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
                            It is an NFT collection for developers in crypto.
                        </p>
                        <p className={styles.description}>
                           {numberMinted}/20 NFT had already been minted
                        </p>
                        <div>
                            {renderButton()}
                        </div>
                        </Box>
                    </Box>
                </Grid>
                <Grid item sm={12} xs={12} md={6} lg={6}>
                    <Box sx={{
                        display: {
                            md: 'flex',
                            lg: 'flex',
                            xl: 'flex',
                            sm: 'none',
                            xs: 'none'
                        },
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <Image src="/crypto-devs.svg"  width={350} height={350} alt="developer vector svg" />
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