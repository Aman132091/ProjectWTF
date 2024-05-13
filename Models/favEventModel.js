const mongoose = require('mongoose')
const favEventSchema = new mongoose.Schema({

    favEvent:[{
        type:String
    }],

    userId:{

        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }

},{timestamps:true})

const favEventModel = mongoose.model('FAVOURITE Events',favEventSchema)
module.exports = favEventModel