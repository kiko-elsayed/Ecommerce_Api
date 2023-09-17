const mongoose= require('mongoose')

const dbConnect =async ()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("connected to DB successfully ^_^");
    } catch (error) {
        console.log("cannot connect to DB..");
    }
}
module.exports = dbConnect