import mongoose,{Schema} from "mongoose"

const subscriptionSchema=new mongoose.Schema({
    subscriber:{type:Schema.Types.ObjectId,ref:"User"}, //one who is subscribing.
    
    channel:{type:Schema.Types.ObjectId,ref:"User"}, // this is one to whom above user is subscribing.

},{timestamps:true})

export const Subscription=mongoose.model("Subscription",subscriptionSchema)
