const Category = require('../models/prodcategoryModel')
const validateMongodbId = require('../utils/validateMongoDbId');
const asyncHandler = require('express-async-handler')


// create category
const createCategory = asyncHandler(async(req,res)=>{
    try {
        const newCategory = await Category.create(req.body)
        if (!newCategory)throw new Error("no category to create")
        res.status(200).json({
            message: "create category successfully" ,
            createdCategory: newCategory 
        })
    } 
    catch (error) {
        res.status(400).json({
            message: "error in create category" ,
            error: error.message  
        })
    }
})


// update category
const updateCategory = asyncHandler(async(req,res)=>{
    try {
        const {id} = req.params
        validateMongodbId(id)
        const category = await Category.findByIdAndUpdate(id , req.body,{new:true})
        if (!category)throw new Error("no category to update")
        await category.save();
        res.status(200).json({
            message: "update category successfully" ,
            updatedCategory: category 
        })
    } 
    catch (error) {
        res.status(400).json({
            message: "error in update category" ,
            error: error.message  
        })
    }
})

// get a category
const getCategory = asyncHandler(async(req,res)=>{
    try {
        const {id} = req.params
        validateMongodbId(id)
        const category = await Category.findById(id)
        if (!category)throw new Error("category not found")
        res.status(200).json({
            message: "get category successfully" ,
            category: category 
        })
    } 
    catch (error) {
        res.status(400).json({
            message: "error in get this category" ,
            error: error.message  
        })
    }
})


// get all category
const getAllCategory = asyncHandler(async(req,res)=>{
    try {
        const categories = await Category.find()
        if (!categories)throw new Error("categories not found")
        res.status(200).json({
            message: "get categories successfully" ,
            AllCategories: categories 
        })
    } 
    catch (error) {
        res.status(400).json({
            message: "error in get this category" ,
            error: error.message  
        })
    }
})


// delete a category
const deleteCategory = asyncHandler(async(req,res)=>{
    try {
        const {id} = req.params
        validateMongodbId(id)
        const category = await Category.findByIdAndDelete(id)
        if (!category)throw new Error("category not found")
        res.status(200).json({
            message: "delete category successfully" ,
            deletedCategory: category 
        })
    } 
    catch (error) {
        res.status(400).json({
            message: "error in delete category" ,
            error: error.message  
        })
    }
})


module.exports ={
    createCategory,
    updateCategory,
    getCategory,
    getAllCategory,
    deleteCategory
}