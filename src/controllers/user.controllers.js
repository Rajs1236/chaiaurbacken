import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import jwt from "jsonwebtoken"
const { JsonWebTokenError }= jwt;
const generateAccessAndRefreshToken=async(userId)=>{
    try {
       const user=await User.findById(userId)
       const accesstoken=user.generateAccessToken()
       const refreshtoken=user.generateRefreshToken()

user.refreshtoken=refreshtoken
await user.save({validateBeforeSave:false})
return {accesstoken,refreshtoken}

    } catch (error) {
        throw new ApiError(500,"somethingwentwrong");
        
    }
}
const registerUser = asyncHandler(async (req, res) => {
    // Step 1: Get user details from frontend
    const { fullName, email, username, password } = req.body;
    
    // Step 2: Validation - check for empty fields
    if ([fullName, email, password, username].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // Step 3: Check if user already exists
    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });
    
    if (existingUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    // Step 4: Check for avatar (required) and cover image (optional)
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    
    // Check if avatar exists
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // Get cover image path if exists
    let coverImageLocalPath;
    if (req.files?.coverImage && Array.isArray(req.files.coverImage)) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    // Step 5: Upload files to Cloudinary
    const avatar = await uploadonCloudinary(avatarLocalPath);
    let coverImage;
    
    if (coverImageLocalPath) {
        coverImage = await uploadonCloudinary(coverImageLocalPath);
    }

    // Check if avatar upload was successful
    if (!avatar) {
        throw new ApiError(400, "Avatar file upload failed");
    }

    // Step 6: Create user object - entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    });

    // Step 7: Remove sensitive fields from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // Step 8: Check for user creation
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    // Step 9: Return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    );
});

  const loginUser = asyncHandler(async (req, res) => {
    // Debugging: Log the incoming request body
    console.log("Incoming request body:", req.body);
    
    const { email, username, password } = req.body;
    
    // Validation - check if either username or email exists
    if (!username && !email) {
        throw new ApiError(400, "username or email is required");
    }

    // Find user by username or email
    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Verify password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    // Generate tokens
    const { accesstoken, refreshtoken } = await generateAccessAndRefreshToken(user._id);

    // Get user without sensitive data
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // Cookie options
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
    };

    return res
        .status(200)
        .cookie("accessToken", accesstoken, options)
        .cookie("refreshToken", refreshtoken, options) // Fixed typo: was "refresshToken"
        .json(new ApiResponse(200, {
            user: loggedInUser.toObject(),
            accesstoken, 
            refreshtoken
        }, "User logged in successfully"));
});

const logoutUser=asyncHandler(async(req,res)=>{
await User.findByIdAndUpdate(req.user._id,{
    $set:{
        refreshToken:undefined
    }
},{
    new:true
})
const options={
    httpOnly:true,
    secure:true,
    sameSite:'strict'
}
return res
.status(200)
.clearCookie("accessToken",options)
.clearCookie("refreshToken",options)
.json(new ApiResponse(200,"user loggedout successfully"))
});
const refreshAccessToken=asyncHandler(async(req,res)=>{
   const incomingRefreshToken=req.cookies.refreshToken||req.body.refreshToken
if(!incomingRefreshToken){
    throw new ApiError(401,"invalid refresh token")
}
const decodedtoken=jwt.verify(
    incomingRefreshToken,
    process.env.Refresh_TOKEN_SECRET
)
const user=await User.findById(decodedtoken?._id)
if(!user){
    throw new ApiError(401,"invalid refresh token")
}
if(incomingRefreshToken!==user?.refreshToken){
     throw new ApiError(401,"expired refresh token")
}
const options={
    httpOnly:true,
    secure:true
}

const {accesstoken,newrefreshtoken}=await generateAccessAndRefreshToken(user._id)
return res
.status(200)
.cookie("accessToken",accesstoken,options)
.cookie("refreshToken",newrefreshtoken,options)
.json(new ApiResponse(200,{accesstoken,refreshToken:newrefreshtoken},
    "access token generated successfully"
))



})



export { registerUser,loginUser,logoutUser,refreshAccessToken};