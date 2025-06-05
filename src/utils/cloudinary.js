import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({ 
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
 
});
const uploadonCloudinary=async(localpath)=>{
    try {
        if(!localpath)return null
        //upload
      const response= await cloudinary.uploader.upload(localpath,{
            resource_type:"auto"
        })
        //file uploaded
        console.log("file uploaded on cloudinary ",response.url);
        return response
    } catch (error) {
        fs.unlinkSync(localpath)//remove the locally saved temp file as upload
        //failed
    }
}
  const uploadResult = await cloudinary.uploader
       .upload(
           'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
               public_id: 'shoes',
           }
       )
       .catch((error) => {
           console.log(error);
       });
    
    console.log(uploadResult);