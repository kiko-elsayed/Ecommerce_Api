const express = require('express')
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware')
const { 
    createBrand,
    deleteBrand,
    getAllBrand,
    getBrand,
    updateBrand
} = require('../controller/brandCtrl')
const router = express.Router();

//routes
router.post('/',authMiddleware ,isAdmin ,createBrand)
router.put('/:id',authMiddleware ,isAdmin ,updateBrand)

router.get('/:id', getBrand)
router.get('/', getAllBrand) 
router.delete('/:id',authMiddleware ,isAdmin ,deleteBrand)



module.exports = router ;