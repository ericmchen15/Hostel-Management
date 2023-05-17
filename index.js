//const morgan = require('morgan')
const mongoose = require('mongoose')
require('dotenv').config();
const process = require('process');
const path = require('path')
const nocache = require('nocache')


const MONGOURI = process.env.MONGOURI

const PORT = 3000 || process.env.PORT



const connectDB = async () => {
    try {
      const conn = await mongoose.connect(MONGOURI);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  }



var expressLayouts = require("express-ejs-layouts");
const express = require('express')
const app = express()

app.use(expressLayouts);

app.use(express.static(path.join(__dirname, "public")))

app.use(nocache())
app.use(express.json({limit: "10mb", extended: true}))

//for public routes 
const publicRoute = require("./routes/publicRoute")
app.use('/', publicRoute)

//for user routes
const userRoute = require('./routes/userRoute')
app.use('/', userRoute)

//for admin routes
const adminRoute = require('./routes/adminRoute')
app.use('/admin', adminRoute)

//for warden routes 
const wardenRoute = require("./routes/wardenRoute")
app.use('/warden', wardenRoute)

app.get('*', function(req, res){
  res.send('What where are you, it\'s a 404', 404);
});



connectDB().then(() => {
  app.listen(PORT, () => {
      console.log(`Server is running at http://127.0.0.1:${PORT}`)    })
})