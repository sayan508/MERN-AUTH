import jwt from "jsonwebtoken"
const userAuth=async(req,res,next)=>{
    const{token}=req.cookies;
    if(!token){
        return res.json({success:false,message:'not authorized login againm'})
    }
    try{
        const tokenDecode=jwt.verify(token,process.env.JWT_SECRET);
        if(tokenDecode.id){
            req.userId=tokenDecode.id
        }else{
            return res.json({success:false,message:'not authorized user'})
        }
        next();
    }
    catch(error){
        res.json({success:false,message:error.message})
    }
}
export default userAuth