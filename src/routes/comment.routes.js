import {Router} from "express"
import{
    addComment,
    updateComment,
    deleteComment,
    getVideoComments} from "../controllers/comment.controller.js"
import { verifyJWT } from "../middleware/auth.middleware.js"    

const router=Router()

router.use(verifyJWT)// applying the verifyJWT to all the routes.

router.route("/addComment/:videoId").post(addComment)
router.route("/updateComment/:commentId").patch(updateComment)
router.route("/deleteComment/:commentId").delete(deleteComment)
router.route("/getVideoComments/:videoId").get(getVideoComments)

export default router
