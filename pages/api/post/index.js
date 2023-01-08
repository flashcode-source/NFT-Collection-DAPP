const handler = (req, res) => {
    const bodyData = req.body
    const newData = {
        request: "accepted",
        data: bodyData
    }
    res.status(200).send(newData)
}

export default handler