import express from 'express';
import { loginUser,
    logoutUser,
    registerUser,
    refreshAccessToken,
     changeCurrentPassword,
      getcurrentUser, 
      updateAccountDetails,
       updateUserAvatar, 
       updateUserCoverImage,
        getUserChannelProfile,
         getwatchhistory } from '../controllers/user.controllers.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { resourceUsage } from 'process';
const router = express.Router();

router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    registerUser
);
router.route("/login").post(loginUser)

//seccured routes

router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(verifyJWT,getcurrentUser)
router.route("/update-details").patch(verifyJWT,updateAccountDetails)
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)

router.route("/cover-image").patch(verifyJWT,upload.single("/coverImage"),updateUserCoverImage)

router.route("/c/:username").get(verifyJWT,getUserChannelProfile)

router.route("/history").get(verifyJWT,getwatchhistory)
export default router;