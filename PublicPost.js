import mongoose from "mongoose"

const instance = mongoose.Schema({
      userName: String,
      userAvatar:String,
        status: {
        type: String,
        required: true
      },
      file:[],
      Like:[],
      Comment:[],
      Share:[],
      createdAt: {
        type: Date,
        default: Date.now()
      }
});

export default mongoose.model("PublicPost",instance)

