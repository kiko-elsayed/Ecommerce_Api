const express = require('express');
const { 
    createBlog, 
    likeBlog,
    disLikeBlog,
    getBlog,
    getAllBlog,
    deleteBlog,
    updateBlog,
    uploadImages
} = require('../controller/blogCtrl');
const router = express.Router();
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');
const { uploadPhoto, blogImgResize } = require('../middleware/uploadImage');


//routes
router.post('/' ,authMiddleware , isAdmin, createBlog)
router.put('/upload/:id',
    authMiddleware,
    isAdmin, 
    uploadPhoto.array('images',2),
    blogImgResize , 
    uploadImages
)
router.put('/likes' , authMiddleware ,likeBlog)
router.put('/disLikes' , authMiddleware ,disLikeBlog)
router.put('/:blogId' , authMiddleware ,isAdmin ,updateBlog)

router.get('/:blogId' , authMiddleware , getBlog)
router.get('/' , authMiddleware , getAllBlog)

router.delete('/:blogId' , authMiddleware , deleteBlog)




module.exports = router