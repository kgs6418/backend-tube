import { asyncHandler } from "../utilis/asyncHandler.js";
import { ApiResponse } from "../utilis/ApiResponse.js";
import { ApiError } from "../utilis/ApiError.js";
import { Video } from "../model/video.model.js";
import { uploadCloudinary } from "../utilis/cloudinary.js";


//publish a video.
const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(404, "title nad description required");
  }

  //check if video uploaded ?
  const videoFileLocalPath = req.files?.videoFile[0].path;
  const thumbnailLocalPath = req.files?.thumbnail[0].path;
  if (!videoFileLocalPath) {
    throw new ApiError(400, "videoFileLocalPath is required");
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "thumbnailLocalPath is required");
  }

  //if yes then upload to cloudinary.
  const videoFile = await uploadCloudinary(videoFileLocalPath);
  const thumbnail = await uploadCloudinary(thumbnailLocalPath);

  if (!videoFile) {
    throw new ApiError(400, "Video file not found");
  }

  if (!thumbnail) {
    throw new ApiError(400, "Thumbnail not found");
  }
  //create video object- entry in db.
  const video = await Video.create({
    title,
    description,
    videoFile: {
      url: videoFile.url,
    },
    thumbnail: {
      url: thumbnail.url,
    },
    owner: req.user?._id,
    isPublished: false,
  });
  const videoUploaded = await Video.findById(video._id);

  if (!videoUploaded) {
    throw new ApiError(500, "videoUpload failed please try again !!!");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video uploaded successfully"));
});

// update a video.(details like title, description, thumbnail)
const updateVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(404, "videoId not found");
  }
  if (!(title && description)) {
    throw new ApiError(404, "title and description are required");
  }
  const video = await video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "video not found");
  }
  if (video?.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(404, "only owner can update this");
  }
  // thumbnail updation.
  const thumbnailLocalPath = req.files?.thumbnail[0].path;

  // Check if the thumbnail is provided
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is required");
  }

  // Upload the new thumbnail to Cloudinary
  const thumbnail = await uploadCloudinary(thumbnailLocalPath);

  // Check if the thumbnail was successfully uploaded
  if (!thumbnail) {
    throw new ApiError(400, "Thumbnail upload failed");
  }

  // Update the video in the database
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title,
        description,
        thumbnail: {
          url: thumbnail.url,
        },
      },
    },
    { new: true }
  );
  return res
    .status(200)
    .json(ApiResponse(200, updatedVideo, "successfully updated"));
});

// delete a video.
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(404, "videoId not found");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "video not found");
  }
  if (video.owner?.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "only owner can delete video");
  }
  await Video.findByIdAndDelete(videoId);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "video deleted successfully"));
});

// toggle publish status.
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(404, "videoId not found");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner?.toString() !== req.user?._id.toString()) {
    throw new ApiError(
      400,
      "You can't toggle publish status as you are not the owner"
    );
  }
  const toggleVideoPublish = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !video?.isPublished,
      },
    },
    { new: true }
  );
  if (!toggleVideoPublish) {
    throw new ApiError(500, "Failed to toggle video publish status");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isPublished: toggleVideoPublish.isPublished },
        "Video publish toggled successfully"
      )
    );
});

//get video by id.
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(404, "videoId not found");
  }
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "video not found");
  }
  if (video.owner?.toString() !== req.user?._id) {
    throw new ApiError(400, "only owner can get the video");
  }
  const videoToRetrieve = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
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
      $project: {
        "videoFile.url": 1,
        title: 1,
        description: 1,
        username: 1,
      },
    },
  ]);
  if (videoToRetrieve.length === 0) {
    throw new ApiError(404, "Video not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, videoToRetrieve[0], "video  fetched successfully")
    );
});

//get all videos.
const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  if (!userId) {
    throw new ApiError(404, "userId not found");
  }

  const filter = [];

  if (query) {
    filter.push({
      $search: {
        index: "search-videos",
        text: {
          query: query,
          path: ["title", "description"],
        },
      },
    });
  }

  if (userId) {
    filter.push({
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    });
  }
  // sortBy and sortType.
  if (sortBy && sortType) {
    filter.push({
        $sort: {
            [sortBy]: sortType === "asc" ? 1 : -1
        }
    });
    } else {
    filter.push({ $sort: { createdAt: -1 } });
    }

    filter.push(
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            "avatar.url": 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$ownerDetails"
        }
    )

    const videoAggregate = Video.aggregate(filter);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    const video = await Video.aggregatePaginate(videoAggregate, options);

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Videos fetched successfully"));
});

export {
  publishAVideo,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  getVideoById,
  getAllVideos,
};
