import mongoose from "mongoose";
import cors from 'cors'
import express from 'express'
import multer from 'multer'
import UserDb from "./UserDb.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import PublicPost from "./PublicPost.js";

const app = express();
const port = process.env.PORT || 8080;


app.use(express.json())
app.use(cors())


const connection_url = 'mongodb+srv://mdMahfuz:noPassword123@cluster0.wwcd5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
// const db = ''
mongoose
    .connect(connection_url, { 
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // useFindAndModify: false,
        // useCreateIndex: true,
      })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err))

app.get('/',(req,res)=>res.status(200).send("it is working wow!!!"));



// app.post("/upload/single/update",
//  async (req, res) => { 
//   const postalId = req.body.id; 
//   const comment = req.body.comments;
//   // console.log(postalId)
//   // console.log(comment)
//   try{
//     if(postalId){
//       let findPost = await DbModel.findById({
//        _id:postalId
//       })
//       if(findPost){
//         console.log("post exist and we can use")
//         // console.log(findPost)
//         const commenting = comment ;
//         await DbModel.findByIdAndUpdate({_id:postalId},      {
//           $push: {
//               comments: commenting
//           }
//       });
//         res.send("Comment was added successfully");
//       }
//       else{
//         console.log("post does not exist")
//       }
//     }
//     else{
//       console.log("we did not find the id")
//     }

//   } catch(e){
//     console.log(e)

//   }
// })







// app.get('/sync', (req, res) => {
//     DbModel.find((err,data)=>{
//         if(err){
//             res.status(500).send(err)
//         }
//         else{
//             res.status(201).send(data)
//         }
//     }).sort( {file: -1,UserName:-1} )


// });


const storage = multer.diskStorage({
	destination: (req, file, cb) => {
	  cb(null, "../linkedin-clone/public/images/") // this directory is from public directory
	},
	filename: (req, file, cb) => {
	  cb(null, Date.now() + "-" + file.originalname)
	},
  })
  
  const uploadStorage = multer({ storage: storage })
  app.post("/uplaodPost", uploadStorage.single('file'),(req, res) =>{
	  console.log(req.body.file)
	const obj = {
	  avater:req.body.avatar,
	  status:req.body.text,
	  userName:req.body.userName,
	  file:req.file.filename,
	  timestamp: new Date()
	}
	console.log(obj)
	if(obj){
	  PublicPost.create(obj,(err,data) => {
		if(err){
		  res.status(500).send(err)
		  console.log(err)
		}
		else{
		  res.status(201).send(data)
		  console.log("created post")
		}
	  })
	}
  
  })

app.get('/publicPosts', (req, res) => {
    PublicPost.find((err,data)=>{
        if(err){
            res.status(500).send(err)
        }
        else{
            res.status(201).send(data)
        }
    }).sort( {file: -1,UserName:-1} )


});
//  <<<<<<<<<<<this the script of user Athentication in the user model>>>>>>>>>>>

app.post("/signUp", 
 async (req, res) => {
 const email = req.body.email;
 let password = req.body.password;
 console.log(email)
    try {
      if(email && password){
        let user = await UserDb.findOne({
          email
      });
      if (user) {
         res.status(500).send("user Already exists")
         console.log("user already")
      }else{

        // const salt = await bcrypt.genSalt(10);
        // user.password = await bcrypt.hash(password, salt);
         password = await bcrypt.hash(password, 10);
      user = new UserDb({
          email,
          password
      });
      await user.save()
      res.status(201).send("successfully created the user")
      console.log("successfulll")
    }
      }
      else{
        res.status(400).send("please confirm the password")
        console.log("please conmfirm the password")
      }
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Saving");
    }
}
);


app.post(
  "/userinfo/sign",
  async (req, res) => {
    const { email, password } = req.body;
    try {
      let user = await UserDb.findOne({
        email
      });
      if (!user){
         res.status(400).json({
          message: "User Not Exist"
        });}

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.json({
          message: "Provide me with correct info!"
        });

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        "randomString",
        {
          expiresIn: "1y"
        },
        (err, token) => {
          if (err) throw err;
          res.json({
            token,
            message:"sucess"
          });
          // localStorage.setItem("token", token);
          console.log("your token is : " + token);
        }
      );
    } catch (e) {
      console.error(e);
      res.status(500).json({
        message: "Server Error"
      });
    }
  }
);


const auth = (req, res, next) => {
  const { authorization } = req.headers
  // console.log(token);
  // if (!token){res.status(401).json({ message: "Auth Error" });}

  try {
    const token = authorization.split(' ')[1];
    if(token){
    const decoded = jwt.verify(token, "randomString");
    req.user = decoded.user;
    next();}
    else{
      res.status(401).json({ message: "Auth Error" });
    }
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: "Invalid Token" });
  }
};


app.get('/userinfo', (req, res) => {
    UserDb.find((err,data)=>{
        if(err){
            res.status(500).send(err)
  
        }
        else{
            // console.log(data.user)
            res.status(201).send(data)
            console.log(data)
            
        }
    })
  
  });
  

  app.get("/authenticatduser", auth, async (req, res) => {
    try {
      // request.user is getting fetched from Middleware after token authentication
      const user = await UserDb.findById(req.user.id);
      res.json(user);
      // console.log(user);
      // console.log("successfully fatched data of that user")
    } catch (e) {
      res.send({ message: "Error in Fetching user" });
    }
  });





  // app.get('/userinfo/sign', (req, res) => {
  //   UserDb.find((err,data)=>{
  //       if(err){
  //           res.status(500).send(err)
  
  //       }
  //       else{
  //           console.log(data.user)
  //           res.status(201).send(data)
  //         //   console.log(data)
            
  //       }
  //   })
  
  // });
  app.post("/likeAdd",
  async (req, res) => { 
   const postalId = req.body.id; 
   const react = req.body.react;
   const userId = req.body.userProfileId;
   const userProfileAvatar = req.body.userProfileAvatar;
   const displayName = req.body.displayName;
   try{
     if(postalId){
     let findPost = await PublicPost.findById({
      _id:postalId
     })
     if(findPost){
       console.log("post exist and we can use")
       // console.log(findPost)
       const reacting = {
          userId:userId,
          userProfileAvatar:userProfileAvatar,
          displayName:displayName,
          comment:react
       } ;
       await PublicPost.findByIdAndUpdate({_id:postalId},{
       $push: {
        Like: reacting
       }
     });
       res.send(reacting);
       console.log(reacting);
     }
     else{
       console.log("post does not exist")
     }
     }
     else{
     console.log("we did not find the id")
     }
  
   } catch(e){
     console.log(e)
  
   }
  })
  
  app.post("/likeRemove",
  async (req, res) => { 
    const postalId = req.body.id; 
    const react = req.body.react;
    const userId = req.body.userProfileId;
    const userProfileAvatar = req.body.userProfileAvatar;
    const displayName = req.body.displayName;
    try{
      if(postalId){
      let findPost = await PublicPost.findById({
       _id:postalId
      })
      if(findPost){
        console.log("post exist and we can use")
        // console.log(findPost)
        const reacting = {
           userId:userId,
           userProfileAvatar:userProfileAvatar,
           displayName:displayName,
           comment:react
        } ;
        await PublicPost.findByIdAndUpdate({_id:postalId},{
        $pull: {
         Like: {
           userId:userId
         }
        }
      });
        res.send(reacting);
        console.log(reacting);
      }
      else{
        console.log("post does not exist")
      }
      }
      else{
      console.log("we did not find the id")
      }
   
    } catch(e){
      console.log(e)
   
    }
  })



app.listen(port, ()=>console.log(`listening on the localhost:${port}`));



// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, "uploads/")
//     },
//     filename: (req, file, cb) => {
//       cb(null, Date.now() + "-" + file.originalname)
//     },
//   })
  
//   const uploadStorage = multer({ storage: storage })
  
//   // Single file
//   app.post("/upload/single", uploadStorage.single("imageUrl"), (req, res) => {
//     console.log(req.file)
//     return res.send("Single file")
  
  
  
//   })
//   //Multiple files
//   app.post("/upload/multiple", uploadStorage.array("file", 10), (req, res) => {
//     console.log(req.files)
//     return res.send("Multiple files")
//   })