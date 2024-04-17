import {Router} from 'express'

import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from '../controllers/playlist.controller.js'

import { verifyJWT } from '../middleware/auth.middleware.js'

const router=Router()
router.use(verifyJWT)

router.route("/createPlaylist").post(createPlaylist)
router.route("/updatePlaylist/:playlistId").patch(updatePlaylist)
router.route("/deletePlaylist/:playlistId").delete(deletePlaylist)
router.route("/addVideoToPlaylist/:playlistId/:videoId").patch(addVideoToPlaylist)
router.route("/removeVideoFromPlaylist/:playlistId/:videoId").patch(removeVideoFromPlaylist)
router.route("/getPlaylistById/:playlistId").get(getPlaylistById)
router.route("/getUserPlaylists/:userId").get(getUserPlaylists)


export default router
