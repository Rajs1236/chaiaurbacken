import mongoose,{ Schema }  from "mongoose";

const SubscriptionSchema=new Schema( {
        subscriber:{
            type:Schema.Types.ObjectId,
            ref:"User"
        },
        channel:{
          type:Schema.Types.ObjectId,
            ref:"User"   
        }
    },{timestamps:true})

// basically hmare m channel ko subscribe kr skte h aur hmesha 
// ek naya doc create hoga
// to hr ek subscriber k liye uske subscribed channels ka list hoga
//isilye doc bnega hr subs k subscribed channels k sath
//user n kitne channels ko subscribe kia h
//basically ulta chalega ki channels m jha jha h select kroge to
//subscriber milega wahi subscriber select kroge to channel milega 
export const Subscription=mongoose.model.Schema("Subscription",SubscriptionSchema)
