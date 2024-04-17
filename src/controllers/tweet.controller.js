import { asyncHandler } from "../utilis/asyncHandler.js";
import { ApiError } from "../utilis/ApiError.js";
import { ApiResponse } from "../utilis/ApiResponse.js";
import { Tweet } from "../model/tweet.model.js";
import mongoose from "mongoose";

//create Tweet.
const createTweet = asyncHandler(async (req, res) => {
  // Getting content from frontend
  const { content } = req.body;

  // Check if content is missing
  if (!content) {
    throw new ApiError(400, "Content is missing");
  }
  const tweet = await Tweet.create({
    content,
    owner: req.user?._id,
  });

  if (!tweet) {
    throw new ApiError(500, "failed to create tweet please try again");
  }

  // Send response
  return res
    .status(200)
    .json(new ApiResponse(200, { tweet }, "Tweet content created"));
});

//update tweet
const updateTweet=asyncHandler(async(req,res)=>{
  const{content}=req.body
  const {id} = req.params;

  

 // Check if content or ID is missing
  if(!content){
    throw new ApiError(401,"content not found")
  }

  if(!id){
    throw new ApiError(401,"id not found")
  }

  // Find the tweet by ID
  const tweet=await Tweet.findById(id)
  // Check if tweet exists
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }
  

  if (tweet.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "Only the owner can edit their tweet");
}

   // Check if content is actually different
   if (tweet.content === content) {
    throw new ApiError(400, "Content is the same as before");
  }

  // Update the tweet  
  const newTweet = await Tweet.findByIdAndUpdate(
    id,
    {
      $set:{
        content:content
      }
    },
    {
      new :true
    }
    )

    if (!newTweet) {
      throw new ApiError(404, "Tweet not updated");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, newTweet, "tweet updated successfully"));
})

//delete tweet
const deleteTweet=asyncHandler(async(req,res)=>{
  const{id}=req.params
  if(!id){
    throw new ApiError(404,"id not found")
  }
  const tweet=await Tweet.findById(id)
  if(!tweet){
    throw new ApiError(404,"tweet collection  not found")
  }
  if(tweet.owner.toString()!==req.user?._id.toString()){
    throw new ApiError(403, "Only the owner can delete their tweet");
  }

  //delete the tweet
  await Tweet.findByIdAndDelete(tweet)

  return res 
  .status(200)
  .json(new ApiResponse(200,{tweet },"tweet deleted successfully")) 
})

//get the tweet
const getTweet = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(404, "id not found");
  }

  // Find the tweet by ID
  const tweet = await Tweet.findById(id);

  // Check if tweet exists
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  return res.status(200).json(new ApiResponse(200, { tweet }, "Tweet found"));
});

export { createTweet, updateTweet, deleteTweet, getTweet };




