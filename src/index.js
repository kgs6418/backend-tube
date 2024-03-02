import dotenv from "dotenv"

import connectDB from './db/index.js';


dotenv.config({path:'./env'})


connectDB()
.then(()=>{
    
    app.listen(process.env.PORT|| 9000,()=>{
        console.log(`server is running at port: ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log(`MONGO_DB connection FAILED: ${error}`)
})


















/*import mongoose from 'mongoose
import {DB_NAME} from "./constants"

import express from 'express'
const app=express()

(async()=>{
    try {
        await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)

        app.on("error",(error)=>{
            console.log("ERROR:",error)
            throw  error
        })

        app.listen(process.env.PORT,()=>{
            console.log(`app is listening on port ${process.env.PORT}`)
        })
    } catch (error) {
        console.log(error)
        throw   error
    }
})()
*/