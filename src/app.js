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

// route decleration.

app.use("/api/v1/users",userRouter)

export {app}