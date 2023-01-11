
const handler = (req, res) => {

    const { tokenId } = req.query;
    const metaData = {
      name: `Crypto Devs #${tokenId}`,
      description: "It's an NFT for crypto developers",
      image: `https://nft-collection-dapp-psi.vercel.app/nft/${tokenId}.svg`
    }
    res.status(200).json(metaData)
  }

  export default handler