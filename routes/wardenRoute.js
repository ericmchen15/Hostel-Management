const express = require('express')
const warden_route = express()
const path = require('path')

const auth = require('../middleware/wardenAuth')
const session = require('express-session')
const config = require('../config/config')
warden_route.use(session({
    secret: config.sessionSecret,
    resave :true,
    saveUninitialized: true
}))

const bodyParser = require('body-parser')
warden_route.use(bodyParser.json())
warden_route.use(bodyParser.urlencoded({extended:true}))


warden_route.set('view engine', 'ejs')
warden_route.set('views', './views/warden')

const wardenController = require('../controllers/wardenController')


warden_route.get('/', auth.isLogout, wardenController.loadLogin)

warden_route.post('/', wardenController.verifyLogin)

warden_route.get('/logout' , auth.isLogin , wardenController.logout)

warden_route.get('/dashboard', auth.isLogin, wardenController.loadDashboard)

warden_route.get('/hostel-details', auth.isLogin, wardenController.loadHostelDetails)

warden_route.get('/leaves', auth.isLogin, wardenController.loadLeaves)

warden_route.post('/leaves/approve', auth.isLogin, wardenController.approveLeave)

warden_route.post('/leaves/reject', auth.isLogin, wardenController.rejectLeave)

warden_route.get('/add-mess-details', auth.isLogin, wardenController.loadAddMessDetails)

warden_route.post('/add-mess-details', auth.isLogin, wardenController.addMessDetails)

warden_route.get("/view-complaints", auth.isLogin, wardenController.loadComplaints)

warden_route.get("/remove-boarder", auth.isLogin, wardenController.removeBoarder)

warden_route.get('/view-payments', auth.isLogin, wardenController.loadPayments)

warden_route.get('/view-payment-file', auth.isLogin, wardenController.viewPaymentFile)

warden_route.get('/mess-details', auth.isLogin, wardenController.loadMessDetails)

warden_route.post('/view-complaints/resolve', auth.isLogin, wardenController.resolveComplaint)


module.exports =  warden_route