import { asyncHandler } from "../utilis/asyncHandler.js";
import { ApiError } from "../utilis/ApiError.js";
import { ApiResponse } from "../utilis/ApiResponse.js";
import { Playlist } from "../model/playlist.model.js";
import { Video } from "../model/video.model.js";

//create playlist.
const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    throw new ApiError(404, "name of the playlist is missing");
  }
  if (!description) {
    throw new ApiError(404, "name of the description is missing");
  }

  const playlistCreated = await Playlist.create({
    name: name,
    description: description,
    owner: req.user?._id,
  });
  if (!playlistCreated) {
    throw new ApiError(401, "playlist not created");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, { playlistCreated }, "new playlist has been created")
    );
});
//update playlist.
const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  if (!playlistId) {
    throw new ApiError(404, "playlistId not found");
  }
  if (!name) {
    throw new ApiError(404, "name not found, name is required");
  }
  if (!description) {
    throw new ApiError(404, "description not found, name is required");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "playlist not found");
  }
  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "only owner can edit the playlist");
  }
  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlist?._id,
    {
      $set: {
        name: name,
        description: description,
      },
    },
    { new: true }
  );
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "playlist updated successfully")
    );
});
//delete playlist.
const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId) {
    throw new ApiError(404, "playlistId not found");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "playlist not found");
  }
  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "only owner can delete the playlist");
  }

  await Playlist.findByIdAndDelete(playlist?._id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "playlist deleted successfully"));
});
// add video to playlist.
const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!playlistId || !videoId) {
    throw new ApiError(404, "both playlistId and videoId is required");
  }

  const playlist = await Playlist.findById(playlistId);
  const video = await Video.findById(videoId);
  if (!playlist) {
    throw new ApiError(404, " playlist not found ");
  }
  if (!video) {
    throw new ApiError(404, " video not found ");
  }

  if (
    playlist.owner?.toString() !== req.user?._id.toString() ||
    video.owner.toString() !== req.user?._id.toString()
  ) {
    throw new ApiError(400, "only owner can add video to their playlist");
  }

  const updateThePlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $addToSet: {
        videos: videoId,
      },
    },
    {
      new: true,
    }
  );

  if (!updateThePlaylist) {
    throw new ApiError(400, "playlist not updated");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updateThePlaylist,
        "Added video to playlist successfully"
      )
    );
});
// remove video from playlist.
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!playlistId) {
    throw new ApiError(404, "playlistId not found");
  }
  if (!videoId) {
    throw new ApiError(404, "videoId not found");
  }

  const playlist = await Playlist.findById(playlistId);
  const video = await Video.findById(videoId);

  if (!playlist) {
    throw new ApiError(404, "playlist not found");
  }
  if (!video) {
    throw new ApiError(404, "video not found");
  }
  if (
    playlist.owner.toString() !== req.user?._id.toString() ||
    video.owner.toString() !== req.user?._id.toString()
  ) {
    throw new ApiError(404, "only the owner can remove the video");
  }
  const videoRemoved = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        videos: videoId,
      },
    },
    { new: true }
  );
  if (!videoRemoved) {
    throw new ApiError(404, "Video was not found in the playlist");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, videoRemoved, "video removed successfully"));
});
// get playlist by id.
const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId) {
    throw new ApiError(404, "playlistId not found");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "playlist not found");
  }
  const playlistVideos = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
      },
    },
    {
      $match: {
        "videos.isPublished": true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $addFields: {
        totalVideos: {
          $size: "$videos",
        },
        totalViews: {
          $sum: "$videos.views",
        },
        owner: {
          $first: "$owner",
        },
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        createdAt: 1,
        updatedAt: 1,
        totalVideos: 1,
        totalViews: 1,
        videos: {
          _id: 1,
          "videoFile.url": 1,
          "thumbnail.url": 1,
          title: 1,
          description: 1,
          duration: 1,
          createdAt: 1,
          views: 1,
        },
        owner: {
          username: 1,
          fullName: 1,
          "avatar.url": 1,
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlistVideos[0], "playlist fetched successfully")
    );
});
//get users playlist.
const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(404, "userId not found");
  }

  const userPlaylist = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
      },
    },
    {
      $addFields: {
        totalVideos: {
          $size: "$videos",
        },
        totalViews: {
          $sum: "$videos.views",
        },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        totalVideos: 1,
        totalViews: 1,
        updatedAt: 1,
      },
    },
  ]);
  return res
  .status(200)
  .json(new ApiResponse(200, userPlaylist, "User playlists fetched successfully"));
});

export {
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  getPlaylistById,
  getUserPlaylists,
};
