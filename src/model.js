const mongoose=require('mongoose');
const blogSchema=new mongoose.Schema({
    title:{
     type:String,
     required:true,
     
    },
    
    content:{
        type:String,
        required:true,
        
       },
       user:
       {
           type:mongoose.Types.ObjectId,
           ref:"Register"
       },
})
const blogDB=new mongoose.model("blogDB",blogSchema);
module.exports=blogDB;