const mongoose = require('mongoose'); // Erase if already required

var orderSchema = new mongoose.Schema({
    products :[
        {
            product :{
                type: mongoose.Schema.Types.ObjectId,
                ref:'Product'
            },
            count : Number ,
            color : String
        }
    ],
    paymentIntent :{} ,
    orderStatues:{
        type:String,
        default:"not processed",
        enum :[
            "not processed",
            "Cash on Delivery" ,
            "processing",
            "Dispatched",
            "Cancelled" ,
            "Delivered"
        ]
    },
    orderby :{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
    }
},{timestamps :true});

//Export the model
module.exports = mongoose.model('Order', orderSchema);