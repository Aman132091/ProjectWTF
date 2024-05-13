const mongoose = require('mongoose')
const favTeamSchema = new mongoose.Schema({

    favTeam:[{
        type:String
    }],

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }

},{timestamps:true})

const favTeamModel = mongoose.model('Favourite Team',favTeamSchema)
module.exports = favTeamModel