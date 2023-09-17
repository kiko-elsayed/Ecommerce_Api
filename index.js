const express = require('express')
const app = express();
const dotenv = require('dotenv').config();
const PORT =process.env.PORT || 4000
const dbConnect = require('./config/dbConnect');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser')
const morgan = require('morgan')

// connect to DB
dbConnect();

// middleware
app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))

//routes
app.use("/api/user" , require('./routes/authRoute'))
app.use("/api/product" , require('./routes/productRoute'))
app.use("/api/blog" , require('./routes/blogRoutes'))
app.use("/api/category" , require('./routes/prodcategoryRoutes'))
app.use("/api/blogcategory" , require('./routes/blogCategoryRoutes'))
app.use("/api/brand" , require('./routes/brandRoutes'))
app.use("/api/coupon" , require('./routes/couponRoutes'))
app.use("/api/enquiry" , require('./routes/enqRoutes'))



//
app.use(notFound)
app.use(errorHandler)


app.listen(PORT ,()=>{
    console.log(`Server is running in port ${ PORT }`)
})