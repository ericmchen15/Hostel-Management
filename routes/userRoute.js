const express = require('express')
const user_route = express()

const session = require('express-session')

const config = require('../config/config')
user_route.use(session({
    secret: config.sessionSecret,
    resave :true,
    saveUninitialized: true
}))
const auth = require('../middleware/userAuth')

user_route.set('view engine', 'ejs')
user_route.set('views', './views/users')

const bodyParser = require('body-parser')
user_route.use(bodyParser.json())
user_route.use(bodyParser.urlencoded({extended:true}))


const userController = require("../controllers/userController")
const uploadImage = require('../helpers/uploadFile')

// user_route.get('/', (req, res)=>{
//     res.send("HOME PAGE")
// })

user_route.get('/register', auth.isLogout, userController.loadRegister)

user_route.post('/register' , userController.insertUser)

user_route.get('/login',auth.isLogout , userController.loginLoad)

user_route.get('/login', auth.isLogout, userController.loginLoad)

user_route.post('/login', userController.verifyLogin)

user_route.get('/home', auth.isLogin, userController.loadHome)

user_route.get('/logout', auth.isLogin, userController.userLogout)

user_route.get('/apply-hostel', auth.isLogin, userController.loadApplyHostel)

user_route.post("/apply-hostel", auth.isLogin, userController.applyHostel)

user_route.get('/edit', auth.isLogin, userController.editLoad)

user_route.post('/edit' ,userController.updateProfile)

user_route.get('/complaints', auth.isLogin, userController.submitComplaint);

user_route.post('/complaints', auth.isLogin, userController.saveComplaint);

user_route.get('/vacate-user', auth.isLogin, userController.loadVacate);

user_route.post('/vacate-user', auth.isLogin, userController.vacate);

user_route.get('/payment', auth.isLogin, userController.loadPayment)

// user_route.post('/payment', auth.isLogin, userController.makePayment)

user_route.post('/create-payment', auth.isLogin, userController.createPaymentIntent)

user_route.get('/payment-success', auth.isLogin, userController.loadPaymentSuccess)

user_route.get('/apply-leave', auth.isLogin, userController.loadApplyLeave)

user_route.post('/apply-leave', auth.isLogin, userController.applyLeave)

user_route.get('/leaves', auth.isLogin, userController.loadLeave)

user_route.get('/hostels-list', auth.isLogin, userController.loadHostelsList)

user_route.get('/hostels/:id', auth.isLogin, userController.loadHostelDetails)

user_route.get('/mess-details', auth.isLogin, userController.loadMessDetails)

user_route.get('/my-complaints', auth.isLogin, userController.loadComplaints)

user_route.get('/warden-details/:name', auth.isLogin, userController.wardenDetails)

user_route.get('/start-payment', auth.isLogin, userController.startPayment)

module.exports = user_route