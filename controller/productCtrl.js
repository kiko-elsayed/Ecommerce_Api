const asyncHandler = require('express-async-handler')
const Product = require('../models/productModel')
const slugify = require('slugify')
const User = require('../models/userModel')
const validateMongodbId = require('../utils/validateMongoDbId');
const {cloudinaryUploadImage, cloudinaryDeleteImage} = require('../utils/cloudinary')
const fs = require('fs')


// create product
const createProduct = asyncHandler(async(req,res)=>{
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title)
        }
        const newProduct = await Product.create(req.body)
        res.status(200).json(newProduct)
    } 
    catch (error) {
        // throw new Error("error in create product")
        res.status(400).json(error.message)
    }
    
})

//update product
const updateProduct = asyncHandler(async(req,res)=>{
    try{
        if (req.body.title) {
            req.body.slug = slugify(req.body.title)
        }
        const updatedProduct = await Product.findByIdAndUpdate({_id:req.params.id},
                req.body, {new:true})
        if (!updatedProduct) {
            res.status(404).json({message: "no product to update"})
        }
        await updatedProduct.save();
        res.status(200).json({
            success : true ,
            data : updatedProduct
        })
    }
    catch (error) {
        res.status(400).json({
            message: error.message,
            err : "error in update product"
        })
    }
})

// get a product
const getProduct = asyncHandler(async(req,res)=>{
    try {
        const product = await Product.findById({ _id:req.params.id})
        if (!product) {
            throw new Error('there is no product')
        }
        res.status(200).json(product)
    } 
    catch (error) {
        // throw new Error("error in get a product")
        res.status(400).json(error.message)
    }
    
})


// get all product
const getAllProduct = asyncHandler(async(req,res)=>{
    try {
        //filtering
        const queryObj = {...req.query}
        const excludeField = ["page" ,"sort" ,"limit","fields" ] 
        excludeField.forEach((item)=> delete  queryObj[item])

        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g ,(match)=>`$${match}`)
        console.log(queryStr);
        let query = Product.find(JSON.parse(queryStr));

        //sorting
        if (req.query.sort){
            const sortBy = req.query.sort.split(",").join(" ")
            query= query.sort(sortBy)
        }else{
            query= query.sort("-createdAt")
        }

        //limiting the fields
        if (req.query.fields) {
            const fields = req.query.fields.split(",").join(" ")
            query = query.select(fields)
        }else{
            query = query.select("-__v")
        }

        //pagination
        const page = req.query.page
        const limit = req.query.limit
        const skip = (page - 1) * limit 
        query = query.skip(skip).limit(limit)
        if (req.query.page) {
            const productCount = await Product.countDocuments();
            if(skip >= productCount) throw new Error("this page does not exist")
        }
    
        const product = await query
        if (!product) {
            throw new Error('there is no product')
        }
        res.status(200).json(product)
    } 
    catch (error) {
        // throw new Error("error in get all products")
        res.status(400).json(error.message)
    }
    
})


//delete product
const deleteProduct = asyncHandler(async(req,res)=>{
    try{
        const deletedProduct = await Product.findByIdAndDelete({_id:req.params.id})
        if (!deletedProduct) {
            res.status(404).json({message: "no product to delete"})
        }
        res.status(200).json({
            success : true ,
            data : deletedProduct
        })
    }
    catch (error) {
        res.status(400).json({
            message: error.message,
            err : "error in delete product"
        })
    }
})


// add to wishlist
const addToWishlist = asyncHandler(async(req,res)=>{
    const {_id} = req.user ;
    const {productId} = req.body ;
    console.log(productId);
    try {
        const user = await User.findById(_id)
        const alreadyWish = user.wishList.find((id)=>id.toString() === productId)
        if (alreadyWish) {
            let user =await User.findByIdAndUpdate(_id ,{
                $pull:{wishList: productId},
            },{new:true})
            res.status(200).json(user)
        }
        else{
            let user =await User.findByIdAndUpdate(_id ,{
                $push:{wishList: productId},
            },{new:true})
            res.status(200).json(user)
        }
    } 
    catch (error) {
        throw new Error(error.message)
    }
    

})


// ratings
const rating = asyncHandler(async(req,res)=>{
    const {_id} = req.user;
    const {star , productId , comment} = req.body;
    try {
        const product = await Product.findById(productId)
        let alreadyRated = product.ratings.find(
            (userId) => userId.postedBy.toString() === _id.toString()
        );
        // user.wishList.find((id)=>id.toString() === productId)
        if (alreadyRated) {
            await Product.updateOne(
                {
                    ratings : {$elemMatch : alreadyRated}
                },
                {
                    $set : {"ratings.$.star" : star, "ratings.$.comment" : comment}
                },
                {new :true}
            )
        }
        else{
            await Product.findByIdAndUpdate(productId,
                {
                    $push :{
                        ratings : {
                            postedBy:_id,
                            star : star,
                            comment : comment,
                        }
                    }
                },
                {new:true}
            )
        }
        const getallRating= await Product.findById(productId)
        // get num of person ratings
        let totalRating = getallRating.ratings.length
        // get sum of persons ratings
        let ratingSum = getallRating.ratings.map((item)=>item.star).reduce((prev,current)=>{
            return prev + current
        },0)
        let actualRating =Math.round(ratingSum / totalRating);
        const finalProduct = await Product.findByIdAndUpdate(productId ,
            {
                totalRating : actualRating
            },{new:true}
        )
        res.status(200).json(finalProduct);
    }
    catch(error){
        throw new Error(error.message)
    }
})

// upload image
const uploadImages = asyncHandler(async(req,res)=>{
    try {
        const uploader = (path)=> cloudinaryUploadImage(path , "images")
        const urls = []
        const files = req.files;
        for(const file of files){
            const {path} = file
            const newPath = await uploader(path)
            console.log(newPath);
            urls.push(newPath)
            // console.log(file);
            fs.unlinkSync(path)
        }
        const images = urls.map((file)=>{
            return file
        })
        
        res.json(images)
    } 
    catch (error) {
        throw new Error(error.message)
    }

})

// delete image
const deleteImages = asyncHandler(async(req,res)=>{
    const {id} = req.params
    try {
        const deleted = cloudinaryDeleteImage(id , "images")
        res.json({message : "deleted successfully"})
    } 
    catch (error) {
        throw new Error(error.message)
    }

})



module.exports = {
    createProduct,
    getProduct,
    getAllProduct,
    updateProduct,
    deleteProduct,
    addToWishlist,
    rating,
    uploadImages,
    deleteImages
}