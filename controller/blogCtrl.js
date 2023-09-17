const Blog = require('../models/blogModel')
const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')
const validateMongodbId = require('../utils/validateMongoDbId');
const cloudinaryUploadImage = require('../utils/cloudinary');
const fs = require('fs')

// create blog
const createBlog = asyncHandler(async(req,res)=>{
    try {
        const blog = await Blog.create(req.body)
        res.status(200).json(blog)
    } 
    catch (error) {
        res.status(400).json(error.message)
    }
})


// get a blog
const getBlog = asyncHandler(async(req,res)=>{
    try {
        const {blogId} = req.params
        validateMongodbId(blogId)
        const blog = await Blog.findById(blogId)
        .populate('likes')
        .populate('dislikes')
        if (!blog) throw new Error("this blog not found")
        const updateViews = await Blog.findByIdAndUpdate(blogId,
            {
                $inc:{"numViews":1}
            },{new :true})

        res.status(200).json(blog)
    } 
    catch (error) {
        res.status(400).json(error.message)
    }
})


// update a blog
const updateBlog = asyncHandler(async(req,res)=>{
    try {
        const {blogId} = req.params
        validateMongodbId(blogId)
        const blog = await Blog.findByIdAndUpdate(blogId , req.body ,{new:true})
        if (!blog) throw new Error("this blog not found")
        res.status(200).json({
            message : "blog updated successfully",
            blog : blog
        })
    } 
    catch (error) {
        res.status(400).json(error.message)
    }
})


// get all blog
const getAllBlog = asyncHandler(async(req,res)=>{
    try {
        const blogs = await Blog.find()
        if (!blogs) throw new Error("no blogs found")
        res.status(200).json(blogs)
    } 
    catch (error) {
        res.status(400).json(error.message)
    }
})


// delete a blog
const deleteBlog = asyncHandler(async(req,res)=>{
    try {
        const {blogId} = req.params
        validateMongodbId(blogId)
        const blog = await Blog.findByIdAndDelete(blogId)
        if (!blog) throw new Error("blog not found")
        res.status(200).json({
            message : "blog deleted successfully",
            blog : blog
        })
    } 
    catch (error) {
        res.status(400).json(error.message)
    }
})



// like Blog
const likeBlog = asyncHandler(async(req,res)=>{
    const {blogId} = req.body
    validateMongodbId(blogId)
    console.log(blogId);

    const blog = await Blog.findById(blogId)
    const loginUserId = req?.user?._id 
    //find the user has liked the blog
    const isLiked = blog?.isLiked
    //find the user has disliked the blog
    const alreadyDisLike = blog?.dislikes?.find(
        (userId)=> userId?.toString() === loginUserId?.toString()
    )
    if (alreadyDisLike) {
        const blog = await Blog.findByIdAndUpdate(blogId ,{
            $pull:{ dislikes : loginUserId},
            isDisLiked : false
        },{new :true})
        res.json(blog)
    }
    if (isLiked) {
        const blog = await Blog.findByIdAndUpdate(blogId ,{
            $pull:{ likes : loginUserId},
            isLiked : false
        },{new :true})
        res.json(blog)
    }
    else{
        const blog = await Blog.findByIdAndUpdate(blogId ,{
            $push:{ likes : loginUserId},
            isLiked : true
        },{new :true})
        res.json(blog)
    }
})


// like Blog
const disLikeBlog = asyncHandler(async(req,res)=>{
    const {blogId} = req.body
    validateMongodbId(blogId)
    console.log(blogId);

    const blog = await Blog.findById(blogId)
    const loginUserId = req?.user?._id 
    //find the user has liked the blog
    const isDisLiked = blog?.isDisLiked
    //find the user has disliked the blog
    const alreadyLiked = blog?.likes?.find(
        (userId)=> userId?.toString() === loginUserId?.toString()
    )
    if (alreadyLiked) {
        const blog = await Blog.findByIdAndUpdate(blogId ,{
            $pull:{ likes : loginUserId},
            isLiked : false
        },{new :true})
        res.json(blog)
    }
    if (isDisLiked) {
        const blog = await Blog.findByIdAndUpdate(blogId ,{
            $pull:{ dislikes : loginUserId},
            isDisLiked : false
        },{new :true})
        res.json(blog)
    }
    else{
        const blog = await Blog.findByIdAndUpdate(blogId ,{
            $push:{ dislikes : loginUserId},
            isDisLiked : true
        },{new :true})
        res.json(blog)
    }
})



const uploadImages = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    validateMongodbId(id)
    try {
        const uploader = (path)=> cloudinaryUploadImage(path , "images")
        const urls = []
        const files = req.files;
        for(const file of files){
            const {path} = file
            const newPath = await uploader(path)
            console.log(newPath);
            urls.push(newPath)
            fs.unlinkSync(path)
        }
        const findBlog = await Blog.findByIdAndUpdate(id ,
            {images: urls.map((file)=>{
                return file
            })},{new:true})
        res.json(findBlog)
    } 
    catch (error) {
        throw new Error(error.message)
    }

})



module.exports = {
    createBlog,
    getBlog,
    getAllBlog,
    deleteBlog,
    updateBlog,
    likeBlog,
    disLikeBlog,
    uploadImages
}