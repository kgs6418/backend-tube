import dotenv from "dotenv"

import connectDB from './db/index.js';


dotenv.config({path:'./env'})


connectDB()


















/*import express from 'express'
const app=express()
(async()=>{
    try {
        await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
        app.on("error",()=>{
            console.log("ERROR:",error)
            throw new error
        })

        app.listen(process.env.PORT,()=>{
            console.log(`app is listening on port ${process.env.PORT}`)
        })
    } catch (error) {
        console.log(error)
        throw new  error
    }
})()
*/