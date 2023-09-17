const express = require('express');
const { createProduct,
        getProduct, 
        getAllProduct,
        updateProduct,
        deleteProduct,
        addToWishlist,
        rating,
        uploadImages,
        deleteImages} = require('../controller/productCtrl');
const router = express.Router();
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');
const {  productImgResize, uploadPhoto } = require('../middleware/uploadImage');

//routes
router.post('/' ,authMiddleware, isAdmin , createProduct)

router.get('/:id', getProduct)
router.get('/' , getAllProduct)
router.put('/upload',
    authMiddleware,
    isAdmin, 
    uploadPhoto.array('images',10),
    productImgResize , 
    uploadImages
)
router.put('/wishlist',authMiddleware , addToWishlist )
router.put('/rating',authMiddleware , rating )

router.put('/:id',authMiddleware, isAdmin , updateProduct)
router.delete('/delete-img/:id',authMiddleware, isAdmin , deleteImages)
router.delete('/:id',authMiddleware, isAdmin , deleteProduct)




module.exports = router