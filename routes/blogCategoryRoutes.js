const express = require('express')
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware')
const { createCategory, 
        updateCategory, 
        getCategory,
        getAllCategory,
        deleteCategory
} = require('../controller/blogCategoryCtrl')
const router = express.Router();

//routes
router.post('/',authMiddleware ,isAdmin ,createCategory)
router.put('/:id',authMiddleware ,isAdmin ,updateCategory)

router.get('/:id', getCategory)
router.get('/', getAllCategory) 
router.delete('/:id',authMiddleware ,isAdmin ,deleteCategory)



module.exports = router ;