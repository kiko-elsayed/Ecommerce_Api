const express = require('express')
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware')
const { 
    createEnquiry,
    deleteEnquiry,
    getAllEnquiry,
    getEnquiry,
    updateEnquiry
} = require('../controller/enqCtrl')
const router = express.Router();

//routes
router.post('/',authMiddleware ,createEnquiry)
router.put('/:id',authMiddleware ,isAdmin ,updateEnquiry)

router.get('/:id', getEnquiry)
router.get('/', getAllEnquiry) 
router.delete('/:id',authMiddleware ,isAdmin ,deleteEnquiry)



module.exports = router ;