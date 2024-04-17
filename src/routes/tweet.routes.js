import { Router } from "express";
import { createTweet,updateTweet,deleteTweet,getTweet } from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js"

const router=Router()

router.route("/createTweet").post(verifyJWT,createTweet)
router.route("/updateTweet/:id").patch(verifyJWT,updateTweet)
router.route("/deleteTweet/:id").patch(verifyJWT,deleteTweet)
router.route("/getTweet/:id").get(verifyJWT,getTweet)


export default router
