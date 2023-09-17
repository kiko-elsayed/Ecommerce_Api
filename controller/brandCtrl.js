const Brand = require('../models/brandModel')
const validateMongodbId = require('../utils/validateMongoDbId');
const asyncHandler = require('express-async-handler')


// create Brand
const createBrand = asyncHandler(async(req,res)=>{
    try {
        const newBrand = await Brand.create(req.body)
        if (!newBrand)throw new Error("no brand to create")
        res.status(200).json({
            message: "create Brand successfully" ,
            createdBrand: newBrand 
        })
    } 
    catch (error) {
        res.status(400).json({
            message: "error in create brand" ,
            error: error.message  
        })
    }
})


// update Brand
const updateBrand = asyncHandler(async(req,res)=>{
    try {
        const {id} = req.params
        validateMongodbId(id)
        const brand = await Brand.findByIdAndUpdate(id , req.body,{new:true})
        if (!brand)throw new Error("no Brand to update")
        await brand.save();
        res.status(200).json({
            message: "update brand successfully" ,
            updatedBrand: brand 
        })
    } 
    catch (error) {
        res.status(400).json({
            message: "error in update Brand" ,
            error: error.message  
        })
    }
})

// get a Brand
const getBrand = asyncHandler(async(req,res)=>{
    try {
        const {id} = req.params
        validateMongodbId(id)
        const brand = await Brand.findById(id)
        if (!brand)throw new Error("brand not found")
        res.status(200).json({
            message: "get brand successfully" ,
            brand: brand 
        })
    } 
    catch (error) {
        res.status(400).json({
            message: "error in get this brand" ,
            error: error.message  
        })
    }
})


// get all Brand
const getAllBrand = asyncHandler(async(req,res)=>{
    try {
        const brands = await Brand.find()
        if (!brands)throw new Error("brands not found")
        res.status(200).json({
            message: "get brands successfully" ,
            AllBrands: brands 
        })
    } 
    catch (error) {
        res.status(400).json({
            message: "error in get this brands" ,
            error: error.message  
        })
    }
})


// delete a category
const deleteBrand = asyncHandler(async(req,res)=>{
    try {
        const {id} = req.params
        validateMongodbId(id)
        const brand = await Brand.findByIdAndDelete(id)
        if (!brand)throw new Error("brand not found")
        res.status(200).json({
            message: "delete brand successfully" ,
            deletedBrand: brand 
        })
    } 
    catch (error) {
        res.status(400).json({
            message: "error in delete Brand" ,
            error: error.message  
        })
    }
})


module.exports ={
    createBrand,
    updateBrand,
    getBrand,
    getAllBrand,
    deleteBrand
}