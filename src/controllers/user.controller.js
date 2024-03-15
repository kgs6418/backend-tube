import { asyncHandler } from "../utilis/asyncHandler.js";
import { ApiError } from "../utilis/ApiError.js";
import { ApiResponse } from "../utilis/ApiResponse.js";
import { User } from "../model/user.model.js";
import { uploadCloudinary } from "../utilis/cloudinary.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    //saving the refreshToken in the db.
    user.refreshToken=refreshToken
    await user.save({validateBeforeSave: false})

    return {refreshToken, accessToken}

  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh token ans access token."
    );
  }
};

//register controller.
const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend.
  //validation-
  //does user exist? you can check via email,username,etc.
  //is files uploaded by user? compulsory check for avatar.
  // if Yes, then upload it to cloudinary. and check if files are uploaded properly or not.
  // create user object - create entry in db.
  //remove password and refresh token field from response.
  //check for user creation if created then return response.

  //step1-get user details from frontend.
  const { username, fullname, email, password } = req.body;
  // console.log("email:",email);

  //step2-validation.
  if (fullname === "") {
    throw new ApiError(400, "fullname is required");
  } else if (username === "") {
    throw new ApiError(400, "username is required");
  } else if (email === "") {
    throw new ApiError(400, "email is required");
  } else if (password === "") {
    throw new ApiError(400, "password is required");
  }

  //step-3 does user exist? you can check via email,username,etc.
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  console.log(existedUser);
  if (existedUser) {
    throw new ApiError(409, "user with email or username already exist");
  }

  //step-4- is files uploaded by user? compulsory check for avatar.
  const avatarLocalPath = req.files?.avatar[0]?.path;
  let coverImageLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar is required");
  }

  //step.5-if Yes, then upload it to cloudinary. and check if files are uploaded properly or not.
  const avatar = await uploadCloudinary(avatarLocalPath);
  const coverImage = await uploadCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "avatar is required");
  }

  //step6-create user object - create entry in db.
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username,
  });
  //check if user exist or not if "yes" then, remove password and refresh token field from response.
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError("500", "something went wrong while registering a user");
  }

  //   response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user registered successfully"));
});

//login controller.
const loginUser = asyncHandler(async (req, res) => {
  //steps to be followed for login user:-

  //data from req.body
  //check if username or email or password exist or not.
  //find user in db
  //password check
  //access and refresh token
  //send token via , send cookie


  //step:1
  const { username, password, email } = req.body;

  //step:2
  if (!username || !email) {
    throw new ApiError(400, "username or email is required");
  }

  // step:3
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiError(404, "user does not exist ");
  }

  //step:4-password check.
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "password incorrect ");
  }

  //step:5
  const {refreshToken,accessToken}=await generateAccessAndRefreshToken(user._id)

  const loggedInUser=await User.findOne(user._id).select("-password -refreshToken")

  //step:6 - send cookie.
  const options={
    httpOnly:true,
    secure:true,
  }
  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new ApiResponse(200,{user:accessToken,refreshToken,loggedInUser},"user logged in successfully")
  )



  
});

//logout controller.
const logoutUser=asyncHandler(async(req,res)=>{
await User.findOneAndUpdate(req.user._id,
    {$set:{refreshToken:undefined}},
    {new:true})

    const options={
        http:true,
        secure:true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"user logged out successfully"))
})





export { registerUser,loginUser,logoutUser};
