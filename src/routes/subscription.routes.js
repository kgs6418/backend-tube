import { Router } from "express";
import { 
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription } from "../controllers/subscription.controller";

import {verifyJWT} from "../middleware/auth.middleware.js"

const router=Router()

router.use(verifyJWT) // Apply verifyJWT middleware to all routes in this file

router.route("/toggleSubscription/:channelId").post(toggleSubscription)
router.route("/getUserChannelSubscribers/:channelId").get(getUserChannelSubscribers)
router.route("/getSubscribedChannels/:subscriberId").get(getSubscribedChannels)


export default router