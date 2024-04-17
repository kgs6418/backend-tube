import { asyncHandler } from "../utilis/asyncHandler.js";
import { ApiError } from "../utilis/ApiError.js";
import { ApiResponse } from "../utilis/ApiResponse.js";
import {Comment} from '../model/comment.model.js'


//add comment
const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const{content}=req.body
    const{videoId}=req.params
    if(!content){
        throw new ApiError(404,"No content found")
    }
    if(!videoId){
        throw new ApiError(404,"No videoId found")
    }
    const comment=await Comment.create({
        content:content,
        owner:req.user?._id,
        video:videoId
    })
    if(!comment){
        throw new ApiError(500,"failed to create comment please try again")
    }
    //send response
    return res
    .status(200)
    .json(new ApiResponse(200,{comment},"comment created successfully"))
})

//update comment
const updateComment = asyncHandler(async (req, res) => {
    
    const{content}=req.body
    const{commentId}=req.params

   // Check if content or ID is missing
  if(!content){
    throw new ApiError(401,"content not found")
  }

  if(!commentId){
    throw new ApiError(401,"commentId not found")
  }

  // Find the comment by ID
  const comment=await Comment.findById(commentId)
  if(!comment){
    throw new ApiError(404,"comment not found")
  }
  if(comment.owner.toString()!== req.user?._id.toString()){
    throw new ApiError(403,"only owner can edit the comment")
  }

  // Check if content is actually different
  if (comment.content === content) {
    throw new ApiError(400, "Content is the same as before");
  }

  //update the comment
  const newComment=await Comment.findByIdAndUpdate(
    commentId,
    {
        $set:{
            content:content
        }
    },{
        new :true
    }
  )

  if (!newComment) {
    throw new ApiError(404, "comment not updated");
  }
  
  return res
  .status(200)
  .json(new ApiResponse(200, newComment, "comment updated successfully"));

})

//delete comment
const deleteComment = asyncHandler(async (req, res) => {
   const {commentId}=req.params
   if(!commentId){
    throw new ApiError(404,"id not found")
   }
   const comment=await Comment.findById(commentId)
   if(!comment){
    throw new ApiError(404,"comment collection in db not found")
   }
   if(comment.owner.toString()!==req.user?._id.toString()){
    throw new ApiError(403, "Only the owner can delete their comment");
   }
   await Comment.findByIdAndDelete(commentId)
   return res 
   .status(200)
   .json(new ApiResponse(200,{comment },"comment deleted successfully")) 

})

//get video comment
const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  if (!videoId) {
      throw new ApiError(404, "videoId not found");
  }
  //if videoId exists then,
  const comments = await Comment.find({ video: videoId })
                                .skip((page - 1) * limit)
                                .limit(limit);

  //check if comments exist,
  if (!comments || comments.length === 0) {
      throw new ApiError(404, "comments not found");
  }
  return res
      .status(200)
      .json(new ApiResponse(200,comments , "Comments found"));
});

export { addComment, updateComment, deleteComment, getVideoComments };
