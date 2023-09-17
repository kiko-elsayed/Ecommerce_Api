const { generateToken } = require('../config/jwtToken');
const User = require('../models/userModel')
const Cart = require('../models/cartModel')
const Product = require('../models/productModel')
const Coupon = require('../models/couponModel')
const Order = require('../models/orderModel');

const asyncHandler = require('express-async-handler');
const validateMongodbId = require('../utils/validateMongoDbId');
const { generateRefreshToken } = require('../config/refreshToken');
const jwt = require('jsonwebtoken');
const sendEmail = require('./emailCtrl');
const crypto = require('crypto');
const uniqid = require('uniqid');



// register
const createUser = asyncHandler(async (req,res)=>{
    const email = req.body.email;
    const findUser = await User.findOne({email})
    if(!findUser){
        const newUser = await User.create(req.body)
        res.status(201).json({
            message :"user created" ,
            user : newUser
        });
    }else{
        throw new Error("user Already Exist")
    }
})


//login
const loginUserCtrl = asyncHandler(async (req,res)=>{
    const {email , password} = req.body;
    // check if the user exist
    const findUser = await User.findOne({email})

    if( findUser && await findUser.isPasswordMatched(password) ){
        const refreshToken = await generateRefreshToken(findUser?._id)
        const updateUser = await User.findByIdAndUpdate(findUser.id ,{
            refreshToken :refreshToken
        } , {new :true})
        res.cookie('refreshToken' , refreshToken,{
            httpOnly: true ,
            maxAge : 72 * 60 * 60 * 1000
        })
        return res.status(201).json({
            message : "you are login",
            findUser ,
            token : generateToken(findUser._id)
        });
    }
    else{
        throw new Error("your are not registered , invalid credentials")
    }
})


//login admin
const loginAdmin = asyncHandler(async (req,res)=>{
    const {email , password} = req.body;
    // check if the user exist
    const findAdmin = await User.findOne({email})
    if(findAdmin.role !=="admin") throw new Error("Not Authorized ,you are not admin")

    if( findAdmin && await findAdmin.isPasswordMatched(password) ){
        const refreshToken = await generateRefreshToken(findAdmin?._id)
        const updateUser = await User.findByIdAndUpdate(findAdmin.id ,{
            refreshToken :refreshToken
        } , {new :true})
        res.cookie('refreshToken' , refreshToken,{
            httpOnly: true ,
            maxAge : 72 * 60 * 60 * 1000
        })
        return res.status(201).json({
            message : "you are login , you are Admin",
            findAdmin ,
            token : generateToken(findAdmin._id)
        });
    }
    else{
        throw new Error("your are not registered , invalid credentials")
    }
})


// handle refresh token
const handleRefreshToken = asyncHandler(async(req,res)=>{
    const cookie = req.cookies
    if(!cookie?.refreshToken){
        throw new Error("No refresh token in cookies")
    }
    const refreshToken = cookie.refreshToken
    const user = await User.findOne({refreshToken})
    if (!user) {
        throw new Error("No refresh token in db or not matched")
    }
    jwt.verify(refreshToken , process.env.JWT_SECRET , (err , decoded)=>{
        if(err || user.id !== decoded.id){
            throw new Error("error in refresh token")
        }
        const accessToken = generateToken(user?._id)
        // console.log(accessToken);
        res.status(200).json({accessToken : accessToken})
    })
    
})


// logout
const logout = asyncHandler(async(req,res)=>{
    const cookie = req.cookies
    if(!cookie?.refreshToken){
        throw new Error("No refresh token in cookies")
    }
    const refreshToken = cookie.refreshToken
    const user = await User.findOne({refreshToken})
    if (!user) {
        res.clearCookie("refreshToken", {
            httpOnly : true ,
            secure : true
        })
        return res.sendStatus(204)
    }
    await User.findOneAndUpdate({refreshToken} , {
        refreshToken : ""
    })
    res.clearCookie("refreshToken", {
        httpOnly : true ,
        secure : true
    })
    res.status(204).json("you are logged out") // forbidden
})

// get All users
const getAllUsers=  asyncHandler(async(req,res)=>{
    try {
        const users= await User.find({}).select("-password")
        res.status(200).json(users)
    } catch (error) {
        throw new Error(error)
    }
})

// get a user
const getOneUser = asyncHandler(async(req,res)=>{
    const {id} = req.params
    validateMongodbId(id)
    try {
        const user= await User.findById(id)
        res.status(200).json(user)
    } catch (error) {
        throw new Error(error)
    }
})

// update a user
const updateUser=  asyncHandler(async(req,res)=>{
    const {_id} = req.user
    validateMongodbId(_id)
    try {
        const updatedUser= await User.findByIdAndUpdate(_id , {
            $set:{
                firstname : req?.body?.firstname ,
                lastname : req?.body?.lastname ,
                email : req?.body?.email ,
                mobile : req?.body?.mobile 
            }
        },{new : true})
        res.status(200).json(updatedUser)
    } catch (error) {
        throw new Error(error)
    }
})


// user Address
const userAddress=  asyncHandler(async(req,res)=>{
    const {_id} = req.user
    validateMongodbId(_id)
    try {
        const updatedUser= await User.findByIdAndUpdate(_id , {
            $set:{
                address : req?.body?.address 
            }
        },{new : true})
        .select("-password -wishlist -updatedAt -createdAt -isBlocked")
        .populate("wishList")
        res.status(200).json(updatedUser)
    } catch (error) {
        throw new Error(error)
    }
})


// get a wishlist
const getWishlist =  asyncHandler(async(req,res)=>{
    const {_id} = req.user
    validateMongodbId(_id)
    try {
        const user= await User.findById(_id)
        .select("-password")
        .populate("wishList")
        res.status(200).json(user)
    } catch (error) {
        throw new Error(error)
    }
})

// delete a user
const deleteUser=  asyncHandler(async(req,res)=>{
    const {id} = req.params
    validateMongodbId(id)
    try {
        const deletedUser= await User.findByIdAndDelete(id)
        res.status(200).json(deletedUser)
    } catch (error) {
        throw new Error(error)
    }
})


//block a user
const blockUser= asyncHandler(async(req,res)=>{
    const {id} = req.params
    validateMongodbId(id)
    try {
        const block = await User.findByIdAndUpdate(id ,{
            isBlocked : "true"
        },{new :true})
        res.status(200).json({
            success : true ,
            message : "Blocked successfully"
        })
    } 
    catch (error) {
        throw new Error(error)
    }
})

//unBlock a user
const unBlockUser= asyncHandler(async(req,res)=>{
    const {id} = req.params
    validateMongodbId(id)
    try {
        const unblock = await User.findByIdAndUpdate(id ,{
            isBlocked : "false"
        },{new :true})
        res.status(200).json({
            success : true ,
            message : "unBlocked successfully"
        })
    } 
    catch (error) {
        throw new Error(error)
    }
})


// update password
const updatePassword = asyncHandler(async(req,res)=>{
    
        // console.log(req.user);
        const { _id } = req.user;
        const { password } = req.body
        validateMongodbId(_id)
        const user = await User.findById(_id);
        console.log(user);
        if(password) {
            user.password = password;
            const updatedPassword = await user.save();
            res.status(200).json(updatedPassword)
        }else{
            res.json(user)
        }
    
    
})


//forgot password
const forgotPassword= asyncHandler(async(req,res)=>{
    const {email} = req.body
    const user = await User.findOne({email})
    if (!user) throw new Error("user not found")
    try {
        const token = await user.createPasswordResetToken()
        await user.save();
        const baseUrl = `Hi, please follow this link to reset password ,this link iis valid till 10 minute from now <a href='http://localhost:5000/api/user/reset-password/${token}'>click here </a>`
        const data = {
            to : email ,
            subject : 'forgot password link' ,
            text :'Hey user' ,
            htm : baseUrl
        }
        sendEmail(data) ;
        res.status(200).json(token)
    } 
    catch (error) {
        res.status(400).json(error.message)
    }
    
})


//resetPassword
const resetPassword = asyncHandler(async(req,res)=>{
    const {password} = req.body
    const {token} = req.params
    const hashToken = crypto.createHash("sha256").update(token).digest("hex")

    const user = await User.findOne({
        passwordResetToken:hashToken,
        passwordResetExpires : { $gt : Date.now()}
    })
    if (!user) throw new Error('user not found')
    user.password = password ;
    user.passwordResetToken = undefined ;
    user.passwordResetExpires = undefined ;
    await user.save();
    res.status(200).json(user)

})


// user cart 
const userCart = asyncHandler(async(req,res)=>{
    const {cart } = req.body;
    const {_id} = req.user
    validateMongodbId(_id)
    try {
        let products = []
        const user = await User.findById(_id)
        // check if user already have this product in the cart
        const alreadyExistInCart = await Cart.findOne({orderby: user._id})
        if (alreadyExistInCart) {
            alreadyExistInCart.remove();
        }
        for (let i = 0; i < cart.length; i++) {
            let object = {}
            object.product = cart[i]._id ;
            object.count = cart[i].count;
            object.color = cart[i].color;
            let getPrice = await Product.findById(cart[i]._id).select("price").exec();
            object.price = getPrice.price;
            products.push(object)
        }
        let cartTotal = 0
        for (let i = 0; i < products.length; i++) {
            cartTotal = cartTotal + products[i].price * products[i].count
        }   
        // console.log(products , cartTotal);
        let newCart = await new Cart({
            products ,
            cartTotal ,
            orderby : user._id
        }).save();
        res.status(200).json(newCart)
    } 
    catch (error) {
        throw new Error(error.message)
    }
})


// get cart
const getCart = asyncHandler(async(req,res)=>{
    const {_id} = req.user
    validateMongodbId(_id)
    try{
        const cart = await Cart.findOne({orderby : _id})
        .populate("products.product" , "_id title price color brand category totalRating")
        if (!cart) {
            return res.status(404).json({message : "not found products"})
        }
        return res.status(200).json(cart)
    }
    catch(error){
        throw new Error(error.message)
    }
})


// remove cart
const removeCart = asyncHandler(async(req,res)=>{
    const {_id} = req.user
    validateMongodbId(_id)
    try{
        const user = await User.findOne(_id)
        const cart = await Cart.findOneAndRemove({orderby :user._id})
        return res.status(200).json({
            message : "cart deleted successfully",
            cart
        })
    }
    catch(error){
        throw new Error(error.message)
    }
})


// apply coupon 
const applyCoupon = asyncHandler(async(req,res)=>{
    const {_id} = req.user 
    const {coupon} = req.body
    validateMongodbId(_id)
    try {
        const validCoupon = await Coupon.findOne({name : coupon})
        if(validCoupon === null ){
            throw new Error("invalid coupon")
        }
        const user = await User.findOne({_id})
        let {cartTotal} = await Cart.findOne({orderby : user._id})
        .populate("products.product" , "_id title price color brand category totalRating")
        let totalAfterDiscount = (
            cartTotal - (cartTotal * validCoupon.discount)/100
        ).toFixed(2);
        await Cart.findOneAndUpdate(
            { orderby: user._id },
            { totalAfterDiscount },
            { new: true }
        );
        
        res.status(200).json({
            cartTotal : cartTotal ,
            discount : validCoupon.discount ,
            totalAfterDiscount :totalAfterDiscount
        })
    } 
    catch (error) {
        throw new Error(error)
    }
})



// create order
const createOrder = asyncHandler(async(req,res)=>{
    const {_id}=req.user
    const {COD , couponApplied}=req.body
    validateMongodbId(_id)
    try {
        if (!COD) throw new Error("create cash order failed")
        const user = await User.findById(_id)
        let userCart = await Cart.findOne({orderby : user._id})
        .populate("products.product")
        let finalAmount = 0
        if (couponApplied && userCart.totalAfterDiscount) {
            finalAmount = userCart.totalAfterDiscount 
        }else{
            finalAmount = userCart.cartTotal 
        }
        const newOrder = await new Order({
            products : userCart.products ,
            orderby : user._id,
            orderStatues : "Cash on Delivery" ,
            paymentIntent :{
                id :uniqid(),
                method : "COD",
                amount :finalAmount ,
                status :"Cash on Delivery" ,
                created : Date.now(),
                currency : "usd"
            }
        })
        .populate("products.product" , "_id title price color brand category totalRating")
        await newOrder.save();

        let update = userCart.products.map((item)=>{
            return {
                updateOne:{
                    filter :{ _id : item.product._id } ,
                    update :{ $inc :{"quantity":-item.count , sold : +item.count}}
                }
            }
        });
        const updated = await Product.bulkWrite(update ,{})
        res.status(200).json({
            message : "order created successfully",
            newOrder : newOrder 
        })
    } 
    catch (error) {
        throw new Error(error)
    }
})


// @desc    get all orders of a particular customer
const getAllOrders = asyncHandler(async(req,res)=>{
    const {_id}=req.user
    validateMongodbId(_id)
    try {
        const userOrders = await Order.findOne({orderby :_id})
        .populate("products.product" , "_id title price color brand category totalRating")
        if(!userOrders){
            throw new Error(`No Orders Found`)
        }
        res.status(200).json(userOrders)
    } 
    catch (error) {
        throw new Error(error)
    }
})


// @desc    get all orders of a particular customer
const updateOrderStatues = asyncHandler(async(req,res)=>{
    const {id}=req.params
    const {status}=req.body
    validateMongodbId(id)
    try {
        const updateOrdersStatus = await Order.findByIdAndUpdate(id,{
            orderStatue: status ,
            paymentIntent : {
                status : status
            }
        }, {new:true})
        .populate("products.product" , "_id title price color brand category totalRating")
        
        res.status(200).json(updateOrdersStatus)
    } 
    catch (error) {
        throw new Error(error)
    }
})

module.exports = {
    createUser,
    loginUserCtrl,
    getAllUsers,
    getOneUser,
    updateUser,
    getWishlist,
    userAddress,
    deleteUser,
    blockUser ,
    unBlockUser,
    handleRefreshToken,
    logout,
    updatePassword,
    forgotPassword,
    resetPassword,
    loginAdmin,
    userCart,
    getCart,
    removeCart,
    applyCoupon,
    createOrder,
    getAllOrders,
    updateOrderStatues
}