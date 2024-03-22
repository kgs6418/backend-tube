import mongoose,{Schema} from "mongoose"



const tweetSchema=new mongoose.Schema({
    
    owner:{type:Schema.Types.ObjectId,ref:"User"},
    content:{type:String,required:true}
    
    
},{timestamps})


export const Tweet=mongoose.model("Tweet",tweetSchema)