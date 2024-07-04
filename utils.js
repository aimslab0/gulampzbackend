const jwt = require("jsonwebtoken")

let AuthenticateUser = async(req , res , next) =>{

    let token = req.headers.token;

    try{
    let DecodedData = await jwt.verify(token , process.env.SECRET_KEY)
    if(DecodedData)
    {
        req.Tokendata = DecodedData;
        next()
    }else
    {
        res.status(404).json({status:false,"Message":"Your Are Not Authenticated"})
    }
}catch(err)
{
    res.status(404).json({"Message":"Your Are Not Authenticated" , err})

}}
let Authenticatedornot = async(req , res , next) =>{

    let token = req.headers.token;

    try{
    let DecodedData = await jwt.verify(token , process.env.SECRET_KEY)
    if(DecodedData)
    {
        req.Tokendata = DecodedData;
        res.status(200).json({status:true,data:DecodedData})
    }else
    {
        res.status(404).json({status:false,"Message":"Your Are Not Authenticated"})
    }
}catch(err)
{
    res.status(404).json({status:false,"Message":"Your Are Not Authenticated" })

}}

module.exports ={
    AuthenticateUser,
    Authenticatedornot
}