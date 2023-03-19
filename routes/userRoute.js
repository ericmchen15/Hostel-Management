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

const multer = require('multer')
const path = require('path')

user_route.use(express.static('public'))

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, path.join(__dirname, '../public/userImages'))
    },
    filename: function(req, file, cb){
        const name = Date.now() + '-' + file.originalname
        cb(null, name)
    }
})

const upload = multer({storage:storage})

const userController = require("../controllers/userController")

// user_route.get('/', (req, res)=>{
//     res.send("HOME PAGE")
// })

user_route.get('/register', auth.isLogout, userController.loadRegister)

user_route.post('/register', upload.single('image') , userController.insertUser)

user_route.get('/',auth.isLogout , userController.loginLoad)

user_route.get('/login', auth.isLogout, userController.loginLoad)

user_route.post('/login', userController.verifyLogin)

user_route.get('/home', auth.isLogin, userController.loadHome)

user_route.get('/logout', auth.isLogin, userController.userLogout)

user_route.get('/apply-hostel', auth.isLogin, userController.loadApplyHostel)

user_route.post("/apply-hostel", auth.isLogin, userController.applyHostel)

user_route.get('/edit', auth.isLogin, userController.editLoad)

user_route.post('/edit', upload.single('image') ,userController.updateProfile)

user_route.get('/complaints', auth.isLogin, userController.submitComplaint);

user_route.post('/complaints', auth.isLogin, userController.saveComplaint);

user_route.get('/vacateUser', auth.isLogin, userController.loadVacate);

user_route.post('/vacateUser', auth.isLogin, userController.vacateUser);

user_route.get('/payment', auth.isLogin, userController.loadPayment)

user_route.post('/payment', auth.isLogin, userController.makePayment)

user_route.get('/apply-leave', auth.isLogin, userController.loadApplyLeave)

user_route.post('/apply-leave', auth.isLogin, userController.applyLeave)

user_route.get('/leaves', auth.isLogin, userController.loadLeave)

user_route.get('/hostels-list', auth.isLogin, userController.loadHostelsList)

user_route.get('/hostels/:id', auth.isLogin, userController.loadHostelDetails)

module.exports = user_route