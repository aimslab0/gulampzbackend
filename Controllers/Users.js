
const user = require("../models/Users.schema")
const jwt = require("jsonwebtoken")
let getAllUsers = async(req , res)=>{
  if(req.Tokendata.role==="superadmin"){
    let users = await user.find({ role: { $ne: 'superadmin' } ,addedby:req.Tokendata._id});
    if(users)
    {
       res.status(200).json(users)
    }else
    {
      res.status(404).json({"Message":"Error" , err:err})
    }
  }else{
    res.status(403).json({"Message":"You dont have access"})
  }
 
}

let getAllDistributors = async(req , res)=>{
  if(req.Tokendata.role==="superadmin"){
    let users = await user.find({ role:  'distributor'  });
    if(users)
    {
       res.status(200).json(users)
    }else
    {
      res.status(404).json({"Message":"Error" , err:err})
    }
  }else{
    res.status(403).json({"Message":"You dont have access"})
  }
 
}
let getBalance=async(req,res)=>{
  let id = req.Tokendata._id;
    let users = await user.findOne({_id:id});
    if(users)
    {
       res.status(200).json(users)
    }else
    {
      res.status(404).json({"Message":"Error" , err:err})
    }
}
let getAllSubDistributors = async(req , res)=>{
  if(req.Tokendata.role==="superadmin"){
    let users = await user.find({ role:  'subdistributor'  });
    if(users)
    {
       res.status(200).json(users)
    }else
    {
      res.status(404).json({"Message":"Error" , err:err})
    }
  }else{
    res.status(403).json({"Message":"You dont have access"})
  }
 
}
let getAllMyDistributors = async(req , res)=>{
  if(req.Tokendata.role==="superadmin"){
    let addedbyuserid=req.Tokendata.userid
    let users = await user.find({ role:  'distributor' ,addedby:addedbyuserid });
    if(users)
    {
       res.status(200).json(users)
    }else
    {
      res.status(404).json({"Message":"Error" , err:err})
    }
  }else{
    res.status(403).json({"Message":"You dont have access"})
  }
}
let getAllMySubDistributors = async(req , res)=>{
    let addedbyuserid=req.Tokendata._id
    let users = await user.find({ role:  'subdistributor' ,addedby:addedbyuserid });
    if(users)
    {
       res.status(200).json(users)
    }else
    {
      res.status(404).json({"Message":"Error" , err:err})
    }
 
}
let getAllMerchants= async(req , res)=>{
  if(req.Tokendata.role==="superadmin"){
    let addedbyuserid=req.Tokendata.userid
    let users = await user.find({ role:  'merchant' });
    if(users)
    {
       res.status(200).json(users)
    }else
    {
      res.status(404).json({"Message":"Error" , err:err})
    }
  }else{
    res.status(403).json({"Message":"You dont have access"})
  }
 
}
let getAllMyMerchants= async(req , res)=>{
    let addedbyuserid=req.Tokendata._id
    let users = await user.find({ role:  'merchant',addedby:addedbyuserid});
    if(users)
    {
       res.status(200).json(users)
    }else
    {
      res.status(404).json({"Message":"Error" , err:err})
    }
 
}

let GetUserById = async(req ,res)=>{
    let id = req.params.id;
    let users = await user.findOne({_id:id});
    if(users)
    {
       res.status(200).json(users)
    }else
    {
      res.status(404).json({"Message":"Error" , err:err})
    }
}
let Edituser =async (req , res)=>{
  let User=req.Tokendata
  
  let data = req.body;
  let id = data._id;
  let users = await user.findByIdAndUpdate(id , data);
  if(users)
  {
    res.status(200).json({status:true,data:users})
  }else
  {
    res.status(404).json({status:false,"Message":"Error" })
  }
}
let Createuser =async (req , res)=>{
  let {username,name,password,address,contact,role,blocked } = req.body;
let User = await user.findOne({username});
if(User){
  res.status(500).json({status:false,"Message":"A same user exists with this username enter another username"})
}
else{
  let addedbyuserid = req.Tokendata._id
  let temppay={cash:0,credit:0,balanceupline:0,availablebalance:0}
  let tempcommission={comission:0 , pcpercentage:0}
  let templimit={
    hindsaa:0,
    hindsab:0,
    akraa:0,
    akrab:0,
    tendolaa:0,
    tendolab:0,
    panogadaa:0,
    panogadab:0,
}
let tempprize={
    prizea:0,
    prizeb:0,
    prizec:0,
    prized:0,
}
let temppurchase={
    plimitaf:0,
    plimitas:0,
    plimitbf:0,
    plimitbs:0,
    plimitcf:0,
    plimitcs:0,
    plimitdf:0,
    plimitds:0,
}
  let data = {username,availablebalance,name,password,address,contact,payment:temppay,comission:tempcommission,limit:templimit,prize:tempprize,purchase:temppurchase ,role,blocked,addedby:addedbyuserid};
  user.create(data).then(data=>{
      res.status(200).json({status:true,data})
  }).catch(err=>{
      res.status(500).json({status:false,"Message":"there was Some Error"})
  })
}
}

let updateuserById = async(req ,res)=>{
  let User=req.Tokendata
    let id = User.id;
    let data = req.body;
    let users = await user.findByIdAndUpdate(id , data);
    if(users)
    {
       res.status(200).json({status:true,data:users})
    }else
    {
      res.status(404).json({status:false,"Message":"Error"})
    }
}


let DeleteUserById =  async(req ,res)=>{
    let id = req.params.id;
    let users = await user.findByIdAndDelete(id);
    if(users)
    {
       res.status(200).json(users)
    }else
    {
      res.status(404).json({"Message":"Error" , err:err})
    }
}
let getAlldetailsbyId = async (req, res) => {
  let id = req.params.id;
  try {
    let users = await user.findOne({ _id: id });
    if (users) {
      let referralusers = await user.find({ addedby: id });
      res.status(200).json({ users, referralusers });
    } else {
      res.status(404).json({ "Message": "User not found" });
    }
  } catch (error) {
    res.status(500).json({ "Message": "There was an error", "Error": error.message });
  }
};


let Login = async(req , res)=>{
    let {username , password} = req.body;
    try{
        let User = await user.findOne({username});
        if(User)
        {
          
          if(!User.blocked){
            if(User.password == password)
            {
                let {password , ...rest} = User
                let _id = User._id;
                let role = User.role;
                let name = User.name;
                let username = User.username;
                let userid=User.userid;
                let token = await jwt.sign({_id ,name, role,username,userid} ,
                     process.env.SECRET_KEY ,
                      {expiresIn :'30d'})
                res.json({rest , "Success":true , token})
            }else
            {
                res.json({ "Success":false , "Message":"Invalid password"})

            }
          }
          else{
            res.json({ "Success":false , "Message":"Your account has been blocked"})

          }
            
        }else
        {
            res.json({ "Success":false , "Message":"User not Found"})

        }
    }catch(err)
    {
        res.json({"Success":false , "Message":"User not Found" , err})
        
    }
    
}

let Loginasanother = async(req , res)=>{
  let {idtologin,id , key} = req.body;
  try{
    let User1 = await user.findOne({_id:id});
    if(User1){
      let {addedby,role}=User1;
      if(role==="superadmin"&&addedby===key){
        let User = await user.findOne({_id:idtologin});
        if(User)
        {
                let {password , ...rest} = User
                let _id = User._id;
                let role = User.role;
                let name = User.name;
                let username = User.username;
                let userid=User.userid;
                let token = await jwt.sign({_id ,name, role,username,userid} ,
                     process.env.SECRET_KEY ,
                      {expiresIn :'30d'})
                res.json({rest , "Success":true , token})
        }else
        {
            res.json({ "Success":false , "Message":"User not Found"})
  
        }
      }else{
        res.json({ "Success":false , "Message":"User not Found"})
      }
      
    }else{
      res.json({ "Success":false , "Message":"User not Found"})
    }
  
  }catch(err)
  {
      res.json({"Success":false , "Message":"User not Found" , err})
      
  }
  
}


module.exports  ={
    GetUserById,
    getAllUsers,
    getAllDistributors,
    getAllMyDistributors,
    getAllSubDistributors,
    getAllMySubDistributors,
    getAllMerchants,
    getAllMyMerchants,
    updateuserById,
    DeleteUserById,
    Createuser,
    Login,
    Edituser,
    getAlldetailsbyId,
    Loginasanother,
    getBalance
}