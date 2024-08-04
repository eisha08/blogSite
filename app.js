const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const session = require("express-session");
const bcrypt = require("bcrypt");
require("./src/database");
const Register = require('./src/register');
const blogDB = require('./src/model');
const path = require('path');
const formDB = require('./src/form');
const homeStartingContent = "AgonyMother is your go-to destination for sharing your daily life updates. Our mission is to be a listener for all those as well as reader for all those who dont have people with whom they can share whats going in their life.Just like a agonymother we will give you a warn space to vent out.";
const aboutContent = "Our mission is simple: to provide valuable, insightful, and engaging content that informs, educates, and entertains our readers. We're dedicated to delivering high-quality articles, guides, and resources that cater to the interests and needs of our audience.We are a team of 3 enthusiasts who share a deep passion for comapnionship. Our diverse backgrounds and experiences allow us to approach topics from various angles, ensuring that we provide well-rounded and comprehensive content. From beginners looking for tips and guidance to seasoned professionals seeking the latest trends and innovations, our content is designed to cater to a wide range of readers.";
const contactContent = "Thank you for visiting AgonyMother! We value your feedback, questions, and suggestions. We are here to assist you in any way we can. Please don't hesitate to get in touch with us.";

const app = express();
const arraylist = [];


app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

// Session middleware
app.use(session({
  secret: "your_secret_key",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});
app.get("/", async function (req, res) {
  try {
    let posts;
    if (req.session.userId) {
      // Show only posts of the logged-in user
      posts = await blogDB.find({ user: req.session.userId }).populate('user');
    } else {
      // Show only posts not associated with any user
      posts = await blogDB.find({ user: null }).populate('user');
    }

    res.render("home", {
      homeStartingContent: homeStartingContent,
      posts: posts,
      session: req.session
    });
  } catch (err) {
    console.log("Error:", err);
    res.status(500).send("An error occurred while fetching posts.");
  }
});




app.get("/about", function (req, res) {
  res.render("about", { aboutContent });
});
app.get("/contact", function (req, res) {
  res.render("contact", { contactContent });
});

app.post("/form-submit", async (req, res) => {
  try {
    const formEntry = new formDB({
      email: req.body.email,
      suggestions: req.body.thoughts
    });

    await formEntry.save();
    res.redirect("/");
  } catch (err) {
    console.log("Error:", err);
    res.status(500).send("An error occurred while saving the form entry.");
  }
});

app.get("/login", function (req, res) {
  res.render("login");
});
app.get("/register", function (req, res) {
  res.render("register");
});
app.get("/compose", function (req, res) {
  res.render("compose");
});

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

app.post("/submit", async (req, res) => {
  if (req.session.userId) {
    try {
      const post = new blogDB({
        title: req.body.title,
        content: req.body.thoughts,
        user: req.session.userId
      });

      await post.save();
      await Register.findByIdAndUpdate(req.session.userId, {
        $push: { list: post._id }
      });

      res.redirect("/");
    } catch (err) {
      console.log("Error:", err);
      res.status(500).send("An error occurred while saving the post.");
    }
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("An error occurred while logging out.");
    }
    res.redirect("/");
  });
});


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

app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const user = await Register.findOne({ email: email });

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        req.session.userId = user._id; // Save user ID in the session
        res.redirect("/compose");
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

app.listen(8000, function () {
  console.log("Server started on port 8000");
});
