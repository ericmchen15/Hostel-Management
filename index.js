const morgan = require('morgan')
const mongoose = require('mongoose')
require('dotenv').config();
const process = require('process');
const path = require('path')

const MONGOURI = process.env.MONGOURI
const PUBLISHABLE_KEY = process.env.PUBLISHABLE_KEY
const SECRET_KEY = process.env.SECRET_KEY

const PORT = 3000 || process.env.PORT


// //for cloud testing *comment it when not in use*
// const connectDB = async () => {
//     try {
//       const conn = await mongoose.connect(`mongodb+srv://${username}:${password}@cluster1.rprzzwl.mongodb.net/hostel-management?retryWrites=true&w=majority`);
//       console.log(`MongoDB Connected: ${conn.connection.host}`);
//     } catch (error) {
//       console.log(error);
//       process.exit(1);
//     }
//   }
  

//for local testing *comment it when not in use*
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


app.use(morgan('default'))
app.use(express.static(path.join(__dirname, "public")))


//for user routes
const userRoute = require('./routes/userRoute')
app.use(expressLayouts);
app.use('/', userRoute)

//for admin routes
const adminRoute = require('./routes/adminRoute')
app.use('/admin', adminRoute)

//for warden routes 
const wardenRoute = require("./routes/wardenRoute")
app.use('/warden', wardenRoute)


connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running at http://127.0.0.1:${PORT}`)    })
})





