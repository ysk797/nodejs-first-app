import express from "express";
import mongoose from "mongoose";
import path from "path";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
mongoose.connect("mongodb://localhost:27017",{
    dbname : "backend" ,
}).then(()=>console.log("database connected"))
.catch((e)=>console.group(e));
const userSchema= new mongoose.Schema({
    name:String,
    email:String,
    password:String,

});
const User= mongoose.model("User",userSchema);

const app= express();

app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.set("view engine","ejs");

const isAuthenticated=async(req,res,next)=>{
    const {token}=req.cookies;
    if(token){
        const decoded=jwt.verify(token,"ndnidi4ni4nfi");
        req.user= await User.findById(decoded._id);

        next();
    }
    else{
        res.redirect("login");
    }
};
app.get("/",isAuthenticated,(req,res)=>{

    res.render("logout",{name:req.user.name});
});
app.get("/login",(req,res)=>{

    res.render("login");
});

app.get("/register",(req,res)=>{

    res.render("register");
});

app.post("/login",async(req,res)=>{
    const{email,password}=req.body;
    let user=await User.findOne({email});
    if(!user) return res.redirect("/register")                         //User nahi hai toh kya karoge is this
    const ismatch=await bcrypt.compare(password,user.password)//comapres both passwords apne aap
    if(!ismatch) return res.render("login",{email,message:"incorrect password"});
    const token= jwt.sign({_id:user._id},"ndnidi4ni4nfi");
    res.cookie("token",token,{
        expires: new Date(Date.now()+60*1000),
    });
    res.redirect("/");
});

    


app.post("/register",async(req,res)=>{
    const{name,email,password}=req.body;
    let user= await User.findOne({email});
    if(user)
        {
            return res.redirect("/login");
        }
    const hashedpassword= await bcrypt.hash(password,10);    
    user= await User.create({
        name,
        email,
        password:hashedpassword,//password meh hashed password aa gayi hai
    });

    const token= jwt.sign({_id:user._id},"ndnidi4ni4nfi");
    res.cookie("token",token,{
        expires: new Date(Date.now()+60*1000),
    });
    res.redirect("/");
    
});


app.get("/logout",(req,res)=>{
    res.cookie("token",null,{
        expires: new Date(Date.now()),
    });
res.redirect("/");
    
});

app.get("/add",async(req,res)=>{
    await Message.create({name:"Abhi2",email:"Sample2@gmail.com"}).then(() => {
    res.send("Nice123");
    });
});


app.listen(5000,()=>{
    console.log("yo");
});