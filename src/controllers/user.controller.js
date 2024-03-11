import {asyncHandler} from "../utilis/asyncHandler.js"
import { ApiError } from "../utilis/ApiError.js";
import {ApiResponse} from "../utilis/ApiResponse.js"
import {User} from "../model/user.model.js"
import{uploadCloudinary} from "../utilis/cloudinary.js"

const registerUser=asyncHandler(async (req,res)=>{
    //get user details from frontend.
    //validation- 
    //does user exist? you can check via email,username,etc.
    //is files uploaded by user? compulsory check for avatar.
    // if Yes, then upload it to cloudinary. and check if files are uploaded properly or not.
    // create user object - create entry in db.
    //remove password and refresh token field from response.
    //check for user creation if created then return response.

    //step1-get user details from frontend.
    const {username,fullname,email,password}=req.body
    console.log("email:",email);

    //step2-validation.
    if(fullname===""){
        throw new ApiError(400,"fullname is required")
    }else if(username===""){
        throw new ApiError(400,"username is required")
    }else if(email===""){
        throw new ApiError(400,"email is required")
    }else if(password===""){
        throw new ApiError(400,"password is required")
    }

    //step-3 does user exist? you can check via email,username,etc.
    const existedUser=User.findOne({
        $or:[{username},{email}]
    })
    console.log(existedUser)
    if(existedUser){
        throw new ApiError(409,"user with email or username already exist")
    }

    //step-4- is files uploaded by user? compulsory check for avatar.
    const avatarLocalPath=req.files?.avatar[0]?.path
    const coverImageLocalPath=req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"avatar is required")
    }

    //step.5-if Yes, then upload it to cloudinary. and check if files are uploaded properly or not.
    const avatar=await uploadCloudinary(avatarLocalPath)
    const coverImage=await uploadCloudinary(coverImageLocalPath)
    if(!avatar){
        throw new ApiError(400,"avatar is required")
    }

    //step6-create user object - create entry in db.
    const user=await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username
    
        })
    //check if user exist or not if "yes" then, remove password and refresh token field from response.    
        const createdUser=await User.findById(user._id).select(
            "-password -refreshToken"
        )
        if(!createdUser){
            throw new ApiError("500","something went wrong while registering a user")
        }

     //   response
     return res.status(201).json(
        new ApiResponse(200,createdUser,"user registered successfully")
     )


})

export {registerUser}