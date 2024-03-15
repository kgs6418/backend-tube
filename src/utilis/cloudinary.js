import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// cloudinary configuration.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//method for uploading file.
const uploadCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath){
            return "could not find the path"
        }else{
           const response = await cloudinary.uploader.upload(localFilePath,{
                resource_type:"auto"
            })
            // console.log(response)
            // console.log("file is uploaded in cloudinary",response.url)
            fs.unlinkSync(localFilePath)
            return response;
        }
        
    } catch (error) {
        fs.unlinkSync(localFilePath) // removes the locally saved file as upload operation got failed.
        return null
    }
};
export {uploadCloudinary}
