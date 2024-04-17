import { ApiError } from "../utilis/ApiError.js";
import { asyncHandler } from "../utilis/asyncHandler.js";
import { ApiResponse } from "../utilis/ApiResponse.js";
import {Like} from "../model/like.model.js"
import {Video} from "../model/video.model.js"

//toggle video like.
const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const userId = req.user?._id; 

    if(!videoId){
        throw new ApiError(404,"videoId not found")
    }
    
    const alreadyLiked=await Like.findOne(
        {
            video:videoId,
            linkedBy:userId
        }
    )
    if(alreadyLiked){
       await Like.findByIdAndDelete(alreadyLiked?._id)

       return res
       .status(200)
       .json(new ApiResponse(200, { isLiked: false }));
    }

    await Like.create({
        video:videoId,
        linkedBy:userId
    })
    return res
    .status(200)
    .json(new ApiResponse(200, { isLiked: true }));

    
})

//toggle comment like.
const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const userId=req.user?._id
    if(!commentId){
        throw new ApiError(404,"commentId not found")
    }

    const alreadyLikedComment=await Like.findOne({
        comment:commentId,
        likedBy:userId
    })

    if(alreadyLikedComment){
        await Like.findByIdAndDelete(alreadyLikedComment?._id)
        return res
       .status(200)
       .json(new ApiResponse(200, { isLiked: false }));
    }

    await Like.create({
        comment:commentId,
        likedBy:userId
    })
    return res
    .status(200)
    .json(new ApiResponse(200, { isLiked: true }));

    

})

// toggle tweet like.
const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const userId=req.user?._id
    if(!tweetId){
        throw new ApiError(404,"tweetId not found")
    }

    const alreadyLikedTweet=await Like.findOne({
        tweet:tweetId,
        likedBy:userId
    })

    if(alreadyLikedTweet){
        await Like.findByIdAndDelete(alreadyLikedTweet?._id)

        return res
       .status(200)
       .json(new ApiResponse(200, { isLiked: false }));
    }

    await Like.create({
        tweet:tweetId,
        likedBy:userId
    })
    return res
    .status(200)
    .json(new ApiResponse(200, { isLiked: true }));
    
})

//get Liked Videos.
const getLikedVideos = asyncHandler(async (req, res) => {
    
    const userId = req.user?._id;
    if(!userId){
        throw new ApiError(404,"userId not found")
    }

    const userLike=await Like.find({likedBy:userId})
    const videoIds= userLike.map(like =>like.video)
    const likedVideos=await Video.find({_id:{$in:videoIds}})

    return res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));


})
export{toggleVideoLike,toggleCommentLike,toggleTweetLike,getLikedVideos}