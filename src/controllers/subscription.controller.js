import { asyncHandler } from "../utilis/asyncHandler.js";
import { ApiError } from "../utilis/ApiError.js";
import { ApiResponse } from "../utilis/ApiResponse.js";
import { Subscription } from "../model/subscription.model.js";
import { User } from "../model/user.model.js";
import mongoose from "mongoose";

// TODO: toggle subscription
const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId) {
    throw new ApiError(404, "channelId not found");
  }

  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(404, "userId not found");
  }

  const subscription = await Subscription.findOne({
    channel: channelId,
    subscriber: userId,
  });
  if (subscription) {
    // User is already subscribed, so unsubscribe
    await subscription.remove();
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Subscription removed"));
  } else {
    // User is not subscribed, so subscribe
    await Subscription.create({ channel: channelId, subscriber: userId });
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Subscription added"));
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId) {
    throw new ApiError(404, "channelId not found");
  }

  const UserChannelSubscribers = await Subscription.aggregate([
    {
      $match: {
        channel: mongoose.Types.createFromTime(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "UserChannelSubscribers",
        pipeline: [
          {
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscribedTo",
            },
          },
          {
            $addFields: {
              subscribedTo: {
                $cond: {
                  if: {
                    $in: [channelId, "$subscribedTo.UserChannelSubscribers"],
                  },
                  then: true,
                  else: false,
                },
              },
              subscriberCount: {
                $size: "subscribedTo",
              },
            },
          },
        ],
      },
    },
    {
      $unwind: "$UserChannelSubscribers",
    },
    {
      $project: {
        _id: 0,
        UserChannelSubscribers: {
          _id: 1,
          username: 1,
        },
      },
    },
  ]);
  // Check if UserChannelSubscribers is falsy
  if (
    UserChannelSubscribers.length === 0 ||
    !UserChannelSubscribers[0].UserChannelSubscribers
  ) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "User Channel Subscribers not found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { UserChannelSubscribers },
        "These are the user channel subscribers"
      )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!subscriberId) {
    throw new ApiError(404, "User has not subscribed to any channel");
  }

  const subscribedChannels = await Subscription.aggregate([
    {
      $match: {
        subscriber: mongoose.Types.createFromTime(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "subscribedChannels",
        pipeline: [
          {
            $lookup: {
              from: "videos",
              localField: "_id",
              foreignField: "owner",
              as: "videos",
            },
          },
          {
            $addFields: {
              latestVideo: {
                $last: "$videos",
              },
            },
          },
        ],
      },
    },
    {
      $unwind: "$subscribedChannels",
    },
    {
      $project: {
        _id: 0,
        subscribedChannels: {
          _id: 1,
          username: 1,
          latestVideo: {
            _id: 1,
            title: 1,
          },
        },
      },
    },
  ]);

  // Check if subscribedChannels is falsy
  if (
    subscribedChannels.length === 0 ||
    !subscribedChannels[0].subscribedChannels
  ) {
    return res
      .status(404)
      .json(
        new ApiResponse(404, null, "User has not subscribed to any channel")
      );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscribedChannels },
        "These are the channels user has subscribed"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
