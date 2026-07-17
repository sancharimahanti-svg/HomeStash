require("dotenv").config();
const express= require("express");
const connectDB = require("./config/db");
const app=express();
app.use(express.json());
connectDB();
//Home route
app.get("/",(req, res)=>{
    res.send("Backend is running successfully!");
});
//start the server
const PORT=process.env.PORT || 5000;


app.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`);

});