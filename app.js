//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _=require("lodash");
const { forEach } = require("lodash");

const homeStartingContent="AgonyMother is your go-to destination for sharing your daily life updates. Our mission is to be a listener for all those as well as reader for all those who dont have people with whom they can share whats going in their life.Just like a agonymother we will give you a warn space to vent out.";
const aboutContent = "Our mission is simple: to provide valuable, insightful, and engaging content that informs, educates, and entertains our readers. We're dedicated to delivering high-quality articles, guides, and resources that cater to the interests and needs of our audience.We are a team of 3 enthusiasts who share a deep passion for comapnionship. Our diverse backgrounds and experiences allow us to approach topics from various angles, ensuring that we provide well-rounded and comprehensive content. From beginners looking for tips and guidance to seasoned professionals seeking the latest trends and innovations, our content is designed to cater to a wide range of readers.";
const contactContent = "Thank you for visiting AgonyMother! We value your feedback, questions, and suggestions. We are here to assist you in any way we can. Please don't hesitate to get in touch with us.";

const app = express();
const arraylist=[];
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
//app.use(express.static("public"));




app.get("/",function(req,res){
  res.render("home",{ homeStartingContent,arraylist:arraylist}
   );
  //console.log(posts);
})
app.get("/about",function(req,res){
  res.render("about",{ aboutContent});
})
app.get("/contact",function(req,res){
  res.render("contact",{ contactContent});
})

app.get("/compose",function(req,res){
  res.render("compose");
})
app.post("/submit", (req, res) => {
  const content={
    head:req.body.title,
    para:req.body.thoughts
  }
  // console.log(content);
  arraylist.push(content);
  res.redirect("/");
  
  
});
app.get("/post/:day",function(req,res){
  var requestedTitle=_.lowerCase(req.params.day);
  arraylist.forEach(function(list){
    const storeTitle=_.lowerCase(list.head);
    if(storeTitle==requestedTitle){
      
        res.render("post",postContent={
          head:arraylist.head,
          para:arraylist.para   
      })
      
      arraylist.push(postContent);
       //res.redirect("/post")
    }
  })

})
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
