import mongoose from "mongoose"

const instance = mongoose.Schema({
      email: {
        type: String,
        required: true
      },
      password: {
        type: String,
        required: true
      },
      displayName:String,
      avatar:String,
      notification:[],
      followers:[],
      coverPhoto:String,
      userTitle:String,
      createdAt: {
        type: Date,
        default: Date.now()
      }
});

export default mongoose.model("UserDb",instance)

