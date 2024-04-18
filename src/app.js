import express from 'express'
import cors from 'cors'
import cookieParser from "cookie-parser"



const app=express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true,

}))

app.use(express.json({limit:"20kb"})) //limiting the json data to 20 kb
app.use(express.urlencoded({extended:true})) //
app.use(express.static("public")) // to store file,folder,pdf.
app.use(cookieParser())

//import routes.

import userRouter from './routes/user.routes.js'
import tweetRouter from './routes/tweet.routes.js'
import subscriptionRouter from './routes/subscription.routes.js'
import commentRouter from './routes/comment.routes.js'
import likeRouter from './routes/like.routes.js'
import playlistRouter from './routes/playlist.routes.js'
import videoRouter from './routes/playlist.routes.js'
import dashboardRouter from './routes/dashboard.routes.js'

// route decleration.

app.use("/api/v1/users",userRouter)
app.use("/api/v1/tweet",tweetRouter)
app.use("/api/v1/subscription",subscriptionRouter)
app.use("/api/v1/comment",commentRouter)
app.use("/api/v1/like",likeRouter)
app.use("/api/v1/playlist",playlistRouter)
app.use("/api/v1/video",videoRouter)
app.use("/api/v1/dashboard",dashboardRouter)




export {app}