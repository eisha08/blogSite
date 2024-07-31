const mongoose=require('mongoose');
const formSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    suggestions:{
        type:String,
        required:true
    }
})
const formDB=new mongoose.model("formDB",formSchema);
module.exports=formDB;

