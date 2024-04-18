import { asyncHandler } from "../utilis/asyncHandler.js";
import { ApiError } from "../utilis/ApiError.js";
import { ApiResponse } from "../utilis/ApiResponse.js";
import { Like } from "../model/like.model.js";
import { Subscription } from "../model/subscription.model.js";
import { Video } from "../model/video.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like "total video views", "total subscribers", "total videos", "total likes" etc.
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(404, "userId not found");
  }
  //total subscribers.
  const totalSubscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: null,
        subscribersCount: { $sum: 1 },
      },
    },
  ]);

  // total videos.
  const totalVideos = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $project: {
        totalLikes: {
          $size: "$likes",
        },
        totalViews: "$views",
        totalVideos: 1,
      },
    },
    {
      $group: {
        _id: null,
        totalLikes: {
          $sum: "$totalLikes",
        },
        totalViews: {
          $sum: "$totalViews",
        },
        totalVideos: {
          $sum: 1,
        },
      },
    },
  ]);

  const channelStats = {
    totalSubscribers: totalSubscribers[0]?.subscribersCount || 0,
    totalLikes: totalVideos[0]?.totalLikes || 0,
    totalViews: totalVideos[0]?.totalViews || 0,
    totalVideos: totalVideos[0]?.totalVideos || 0,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, channelStats, "channel stats fetched successfully")
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(404, "no userId found");
  }
  const videosUploaded = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likes",
        },
      },
    },
    {
      $project: {
        _id: 1,
        "videoFile.url": 1,
        "thumbnail.url": 1,
        title: 1,
        description: 1,
        isPublished: 1,
        likesCount: 1,
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(200, videosUploaded, "channel stats fetched successfully")
    );
});

export { getChannelStats, getChannelVideos };
