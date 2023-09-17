const jwt = require("jsonwebtoken")
const asyncHandler = require("express-async-handler")
const User = require("../models/userModel")

const authMiddleware = asyncHandler(async (req,res , next)=>{
    let token;
    if (req?.headers?.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1]
        try {
            if (token) {
                const decoded = await jwt.verify(token , process.env.JWT_SECRET)
                console.log('decoded',decoded);
                const user = await User.findById(decoded?.id)
                req.user = user;
                next();
            }
        } catch (error) {
            throw new Error("not Authorized, token expired")
        }
    }else{
        throw new Error("there is no token attached to header")
    }
})


// is admin
const isAdmin = asyncHandler(async(req,res,next)=>{
    // console.log(req.user);
    const {email} = req.user
    const adminUser = await User.findOne({email})
    if (adminUser.role !== "admin") {
        throw new Error("you are not admin")
    }else{
        next();
    }
    
})





module.exports = {
    authMiddleware,
    isAdmin
}