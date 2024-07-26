const mongoose=require("mongoose");

const userSchema=new mongoose.Schema({
    fullname:{
     type:String,
     required:true,
     index:true
    },
    
       email:{
        type:String,
        required:true,
        unique:true,
        index:true
        
       },
       username:{
        type:String,
        required:true
       },
      
       age:{
        type:Number,
        required:true,
        index:true
        
        
       },
       password:{
        type:String,
        required:true
       },
       confirmpassword:{
        type:String,
        required:true
       },
      
       list:[
        {
            type:mongoose.Types.ObjectId,
            ref:"blogDB"
        }
    ],
})
const Register=new mongoose.model("Register",userSchema);
//employSchema.index({fullname:1,email:1,gender:1,age:1,password:1,confirmpassword:1,courseType:1},{unique:true})
//Register.createIndexes();
userSchema.index({fullname:1,email:1,username:1,age:1,password:1,confirmpassword:1},{unique:true})
module.exports=Register;