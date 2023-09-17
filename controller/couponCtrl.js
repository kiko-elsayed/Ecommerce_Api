const Coupon = require('../models/couponModel')
const validateMongodbId = require('../utils/validateMongoDbId')
const asyncHandler = require("express-async-handler")

// create coupon
const createCoupon = asyncHandler(async(req,res)=>{
    try {
        const coupon = await Coupon.create(req.body)
        if(!coupon){
            throw new Error('Error creating the coupon!')
        }
        res.status(200).json(coupon)
    } catch (error) {
        throw new Error(error.message)
    }
})

// get all coupon
const getAllCoupon = asyncHandler(async(req,res)=>{
    try {
        const coupons = await Coupon.find()
        if(!coupons){
            throw new Error(' No coupons found')
        }
        res.status(200).json(coupons)
    } catch (error) {
        throw new Error(error.message)
    }
})


// update coupon
const updateCoupon = asyncHandler(async(req,res)=>{
    try {
        const {id} = req.params
        validateMongodbId(id)
        const coupon = await Coupon.findByIdAndUpdate(id, req.body ,{new:true})
        if(!coupon){
            throw new Error('not found this coupon')
        }
        res.status(200).json({
            message:'update successfully',
            updatedCoupon :  coupon
        })
    } catch (error) {
        throw new Error(error.message)
    }
})


// delete coupon
const deleteCoupon = asyncHandler(async(req,res)=>{
    try {
        const {id} = req.params
        validateMongodbId(id)
        const coupon = await Coupon.findByIdAndDelete(id)
        if(!coupon){
            throw new Error('not found this coupon')
        }
        res.status(200).json({
            message:"coupon deleted successfully",
            deletedCoupon :coupon
        })
    } catch (error) {
        throw new Error(error.message)
    }
})




module.exports ={
    createCoupon,
    getAllCoupon,
    updateCoupon,
    deleteCoupon
}
