const Enquiry = require('../models/enqModel')
const validateMongodbId = require('../utils/validateMongoDbId');
const asyncHandler = require('express-async-handler')


// create Enquiry
const createEnquiry = asyncHandler(async(req,res)=>{
    try {
        const newEnquiry = await Enquiry.create(req.body)
        if (!newEnquiry)throw new Error("no Enquiry to create")
        res.status(200).json({
            message: "create Enquiry successfully" ,
            createdEnquiry: newEnquiry
        })
    } 
    catch (error) {
        res.status(400).json({
            message: "error in create Enquiry" ,
            error: error.message  
        })
    }
})


// update Enquiry
const updateEnquiry = asyncHandler(async(req,res)=>{
    try {
        const {id} = req.params
        validateMongodbId(id)
        const updateEnquiry = await Enquiry.findByIdAndUpdate(id , req.body,{new:true})
        if (!updateEnquiry)throw new Error("no Enquiry to update")
        await updateEnquiry.save();
        res.status(200).json({
            message: "update Enquiry successfully" ,
            updatedEnquiry: updateEnquiry 
        })
    } 
    catch (error) {
        res.status(400).json({
            message: "error in update Enquiry" ,
            error: error.message  
        })
    }
})

// get a Enquiry
const getEnquiry = asyncHandler(async(req,res)=>{
    try {
        const {id} = req.params
        validateMongodbId(id)
        const enquiry = await Enquiry.findById(id)
        if (!enquiry)throw new Error("Enquiry not found")
        res.status(200).json({
            message: "get enquiry successfully" ,
            Enquiry: enquiry 
        })
    } 
    catch (error) {
        res.status(400).json({
            message: "error in get this Enquiry" ,
            error: error.message  
        })
    }
})


// get all Enquiry
const getAllEnquiry = asyncHandler(async(req,res)=>{
    try {
        const enquiries = await Enquiry.find()
        if (!enquiries)throw new Error("enquiries not found")
        res.status(200).json({
            message: "get enquiries successfully" ,
            AllEnquiries: enquiries 
        })
    } 
    catch (error) {
        res.status(400).json({
            message: "error in get this enquiries" ,
            error: error.message  
        })
    }
})


// delete a category
const deleteEnquiry = asyncHandler(async(req,res)=>{
    try {
        const {id} = req.params
        validateMongodbId(id)
        const enquiry = await Enquiry.findByIdAndDelete(id)
        if (!enquiry)throw new Error("Enquiry not found")
        res.status(200).json({
            message: "delete Enquiry successfully" ,
            deletedEnquiry: enquiry 
        })
    } 
    catch (error) {
        res.status(400).json({
            message: "error in delete Enquiry" ,
            error: error.message  
        })
    }
})


module.exports ={
    createEnquiry,
    updateEnquiry,
    getEnquiry,
    getAllEnquiry,
    deleteEnquiry
}