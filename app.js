//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _=require("lodash");
const session = require("express-session");
const bcrypt = require("bcrypt");
const { forEach } = require("lodash");
//const mongoose=require("mongoose");
require("./src/database");
const Register=require('./src/register')
const blogDB=require('./src/model');
const homeStartingContent="AgonyMother is your go-to destination for sharing your daily life updates. Our mission is to be a listener for all those as well as reader for all those who dont have people with whom they can share whats going in their life.Just like a agonymother we will give you a warn space to vent out.";
const aboutContent = "Our mission is simple: to provide valuable, insightful, and engaging content that informs, educates, and entertains our readers. We're dedicated to delivering high-quality articles, guides, and resources that cater to the interests and needs of our audience.We are a team of 3 enthusiasts who share a deep passion for comapnionship. Our diverse backgrounds and experiences allow us to approach topics from various angles, ensuring that we provide well-rounded and comprehensive content. From beginners looking for tips and guidance to seasoned professionals seeking the latest trends and innovations, our content is designed to cater to a wide range of readers.";
const contactContent = "Thank you for visiting AgonyMother! We value your feedback, questions, and suggestions. We are here to assist you in any way we can. Please don't hesitate to get in touch with us.";

//connect to mongodb


const app = express();
const arraylist=[];
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
//app.use(express.static("public"));




// app.get("/",function(req,res){
//   res.render("home",{ homeStartingContent,arraylist:arraylist}
//    );
//   //console.log(posts);
// })
app.get("/", async function (req, res) {
  try {
    const posts = await blogDB.find({});
    res.render("home", {
      homeStartingContent: homeStartingContent,
      posts: posts
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred while fetching posts.");
  }
});


app.get("/about",function(req,res){
  res.render("about",{ aboutContent});
})
app.get("/contact",function(req,res){
  res.render("contact",{ contactContent});
})
app.get("/login",function(req,res){
  res.render("login");
})
app.get("/register",function(req,res){
  res.render("register");
})


app.get("/compose",function(req,res){
  res.render("compose");
})
app.post("/register", async (req, res) => {
  try {
    const password = req.body.password;
    const cpassword = req.body.confirmpassword;

    if (password === cpassword) {
      const existingUser = await Register.findOne({ email: req.body.email });

      if (existingUser) {
        res.send("Email already registered. Please use a different email.");
      } else {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const employDetails = new Register({
          fullname: req.body.fullname,
          username: req.body.username,
          email: req.body.email,
          age: req.body.age,
          gender: req.body.gender,
          password: hashedPassword,
          confirmpassword: hashedPassword
        });

        await employDetails.save();
        res.redirect("/login");
      }
    } else {
      res.send("Passwords do not match.");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});
// app.post("/submit", (req, res) => {
//   const content={
//     head:req.body.title,
//     para:req.body.thoughts
//   }
//   // console.log(content);
//   // arraylist.push(content);
//   // res.redirect("/");
  
  
// });
app.post("/submit", async (req, res) => {
  const post = new blogDB({
    title: req.body.title,
    content: req.body.thoughts
  });

  try {
    await post.save();
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});
// app.get("/post/:day",function(req,res){
//   var requestedTitle=_.lowerCase(req.params.day);
//   arraylist.forEach(function(list){
//     const storeTitle=_.lowerCase(list.head);
//     if(storeTitle==requestedTitle){
      
//         res.render("post",postContent={
//           head:arraylist.head,
//           para:arraylist.para   
//       })
      
//       arraylist.push(postContent);
//        //res.redirect("/post")
//     }
//   })

// })
// app.get("/post/:postId", async function (req, res) {
//   const requestedPostId = req.params.postId;

//   try {
//     const post = await blogDB.findOne({ _id: requestedPostId });
//     res.render("post", {
//       title: post.title,
//       content: post.content
//     });
//   } catch (err) {
//     console.log(err);
//   }
// });

app.get("/post/:postId", async function (req, res) {
  const requestedPostId = req.params.postId;

  try {
    const post = await blogDB.findOne({ _id: requestedPostId });
    res.render("post", {
      title: post.title,
      content: post.content
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred while fetching the post.");
  }
});
app.post("/submit", async (req, res) => {
  if (req.session.userId) {
    const post = new blogDB({
      title: req.body.title,
      content: req.body.thoughts,
      author: req.session.userId // Save the user ID with the post
    });

    try {
      await post.save();
      res.redirect("/");
    } catch (err) {
      console.log(err);
      res.status(500).send("An error occurred while saving the post.");
    }
  } else {
    res.redirect("/login");
  }
});

app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const cpassword=req.body.confirmpassword;
    const user = await Register.findOne({ email: email });

    if (user) {
      const isMatch = await bcrypt.compare(password, cpassword);
      if (isMatch) {
        req.session.userId = user._id; // Save user ID in the session
        res.redirect("/");
      } else {
        res.send("Incorrect password.");
      }
    } else {
      res.send("No user found with this email.");
    }
  } catch (error) {
    res.status(400).send("Invalid email.");
  }
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
