import mongoose,{Schema} from "mongoose";

const playlistSchema=new Schema(
    {
        name:{
            type:String, //cloudinary url
            required:true
        },
        description:{
            type:String,
            required:true
        },
        createdAt:{
            type:String,
            required:true
        },
        updatedAt:{
            type:Number,
            required:true
        },
        videos:[{
            type:Schema.Types.ObjectId,
           ref:"Video"
        }],
        owner:{
            typr:Schema.type.ObjectId,
            ref:"USER"
        }


    },{
        timestamps:true
    }
)
export const Video=mongoose.model("playlist",playlistSchema)