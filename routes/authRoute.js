const express = require('express')
const router = express.Router()
const { 
    createUser, 
    loginUserCtrl, 
    getAllUsers,  
    getOneUser,
    updateUser,
    deleteUser,
    blockUser,
    unBlockUser,
    handleRefreshToken,
    logout,
    updatePassword,
    forgotPassword,
    resetPassword,
    loginAdmin,
    getWishlist,
    userAddress,
    userCart,
    getCart,
    removeCart,
    applyCoupon,
    createOrder,
    getAllOrders,
    updateOrderStatues} = require('../controller/userCtrl')
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware')



router.post('/register' , createUser )
router.post('/login' , loginUserCtrl )
router.post('/admin-login' , loginAdmin )


router.post('/cart',authMiddleware , userCart )
router.post('/cart/apply-coupon',authMiddleware , applyCoupon )
router.post('/cart/cash-order',authMiddleware , createOrder )


router.get("/products-cart" , authMiddleware , getCart)
router.get("/user-wishlist" , authMiddleware , getWishlist)
router.get('/all-users', authMiddleware, getAllUsers)
router.get('/user-orders', authMiddleware, getAllOrders)
router.get('/:id' , authMiddleware, isAdmin , getOneUser)
router.get("/refresh" , handleRefreshToken)
router.get("/logout" , authMiddleware , logout)


router.put('/user-address',authMiddleware, userAddress)
router.put('/:id',authMiddleware, updateUser)
router.put('/block-user/:id' ,authMiddleware, isAdmin, blockUser)
router.put('/unblock-user/:id',authMiddleware, isAdmin , unBlockUser)
router.put('/order/update-status/:id' ,authMiddleware, isAdmin, updateOrderStatues)

router.post('/update-password', authMiddleware, updatePassword)
router.post('/forgot-password-token', forgotPassword)
router.put('/reset-password/:token' , authMiddleware, resetPassword)


router.delete('/empty-cart' ,authMiddleware, removeCart)
router.delete('/:id' ,authMiddleware, deleteUser)



module.exports = router