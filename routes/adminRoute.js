const express = require('express')
const admin_route = express()

const session = require('express-session')
const config = require('../config/config')
admin_route.use(session({
    secret: config.sessionSecret,
    resave :true,
    saveUninitialized: true
}))


const bodyParser = require('body-parser')
admin_route.use(bodyParser.json())
admin_route.use(bodyParser.urlencoded({ extended: true }))

admin_route.set('view engine', 'ejs')
admin_route.set('views', './views/admin')

const auth = require('../middleware/adminAuth')

const adminController = require('../controllers/adminController')




admin_route.get('/', auth.isLogout, adminController.loadLogin)

admin_route.post('/', adminController.verifyLogin)

admin_route.get('/home', auth.isLogin, adminController.loadHome)

admin_route.get('/logout', auth.isLogin, adminController.logout)

admin_route.get('/dashboard', auth.isLogin, adminController.loadDashboard)

admin_route.get('/addHostel', auth.isLogin, adminController.loadAddHostel)

admin_route.post('/addHostel', auth.isLogin, adminController.insertHostel)

admin_route.get('/hostel-details', auth.isLogin, adminController.allocatedRooms)

admin_route.get('/user-details', auth.isLogin, adminController.loadUserDetails)

admin_route.get('/viewComplaints', auth.isLogin, adminController.loadComplaints)

admin_route.get('/addWarden', auth.isLogin, adminController.loadAddWarden)

admin_route.post('/addWarden', auth.isLogin, adminController.addWarden)

admin_route.post('/search-user', auth.isLogin, adminController.returnSearch)

admin_route.get('/dashboard/users-list', auth.isLogin, adminController.loadUsersList)

admin_route.get('/dashboard/hostels-list', auth.isLogin, adminController.loadHostelsList)

admin_route.get('/view-applications', auth.isLogin, adminController.loadApplications)

admin_route.get('/allocate', auth.isLogin, adminController.randomHostel)

admin_route.get('/vacate-all', auth.isLogin, adminController.vacateAll)

admin_route.get('/view-allocated', auth.isLogin, adminController.allocatedList)

admin_route.get('/allocated-rooms', auth.isLogin, adminController.allocatedRooms)

admin_route.get('/view-records', auth.isLogin, adminController.viewRecords)

admin_route.get('/add-hostel-product', auth.isLogin, adminController.loadCreateHostelProduct);

admin_route.post("/add-hostel-product", auth.isLogin, adminController.createHostelProduct);

admin_route.get("/viewLeaves", auth.isLogin, adminController.loadLeaves);

admin_route.get("/warden-data", auth.isLogin, adminController.loadWardenData);

admin_route.get('*', function (req, res) {
    res.redirect('/admin')
})

module.exports = admin_route
