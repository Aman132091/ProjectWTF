const mongoose = require("mongoose")
require("dotenv").config()
exports.db= async()=>{
    const URI = process.env.DATABASE_URI
    try{
         await mongoose.connect(URI)
        console.log(` Sucessfully connected to MongoDB `)
    }
    catch(error){
        console.log(`Something went wrong :  ${error}`)
    
    }
}