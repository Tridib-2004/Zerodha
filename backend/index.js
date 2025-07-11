const express = require('express');
require('dotenv').config();
const cors=require('cors');
const bodyParser = require('body-parser');
const  mongoose = require('mongoose');
const PORT= process.env.PORT || 3002;
const uri= process.env.MONGO_URL ;
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const app = express();
app.use(cors({
    origin: ["http://localhost:3001"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
const { HoldingsModel } = require("./models/HoldingsModel");
const { PositionsModel } = require("./models/PositionsModel");
const { OrdersModel } = require("./models/OrdersModel");

const { createSecretToken } = require("./util/SecretToken");
const bcrypt = require("bcryptjs");
const { UsersModel } = require('./models/UsersModel');
//for sign up
app.post("/signup",async (req, res, next) => {
const { email, password,username } = req.body;
    const existingUser = await UsersModel.findOne({ email });
     if (existingUser) {
      return res.json({ message: "User already exists" });
    }
    const user = new UsersModel({ email,  username,password});
    user.save();
    const token = createSecretToken(user._id);
    
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });
    res
      .status(201)
      .json({ message: "User signed in successfully", success: true, user });
    next();

});
//for login

app.post("/login",async (req, res, next) => {
  const { email, password } = req.body;
  if(!email || !password ){
      return res.json({message:'All fields are required'})
    }
    const user = await UsersModel.findOne({ email });
    if(!user){
      return res.json({message:'Incorrect password or email' }) 
    }
    const auth = await bcrypt.compare(password,user.password);
    if (!auth) {
      return res.json({message:'Incorrect password or email' }) 
    }
    const token = createSecretToken(user._id);
     res.cookie("token", token, {
       withCredentials: true,
       httpOnly: false,
     });
    res.status(201).json({ message: "User logged in successfully", success: true });
     next()
});
//authentication
app.post("/verify",(req, res) => {
  const token = req.cookies.token
  if (!token) {
    return res.json({ status: false })
  }
  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
     return res.json({ status: false })
    } else {
      const user = await UsersModel.findById(data.id)
      if (user) return res.json({ status: true, user: user.username })
      else return res.json({ status: false })
    }
  })
});
app.get("/allHoldings", async (req, res) => {
  
    const holdings = await HoldingsModel.find({});
    res.json(holdings);
 
});
app.get("/allPositions", async (req, res) => {
  
    const positions = await PositionsModel.find({});
    res.json(positions);
 
});
app.post("/newOrder",async (req, res) => {
  const { name, qty, price, mode } = req.body;
  const newOrder = new OrdersModel({
    name,
    qty,
    price,
    mode,
  });
  newOrder.save();
});

app.listen(3002, () => {
  console.log('Server is running on http://localhost:3002');
  mongoose.connect(uri);
  console.log('Connected to MongoDB');
});