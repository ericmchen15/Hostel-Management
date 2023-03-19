const User = require('../models/userModel')
const Hostel = require('../models/hostelModel')
const Complaint = require('../models/complaintModel')
const Warden = require('../models/wardenModel')
const bcrypt = require('bcrypt')
const Leave = require('../models/leaveModel')


const loadDashboard = async (req, res) => {

    try {
        const wardenId = req.session.user_id
        
        const hostelData = await Warden.findOne({_id: wardenId})
        
        res.render('dashboard', {hostelName: hostelData.hostel_name})
    } catch (error) {
        console.log(error.message)
    }
}

const loadLogin = async (req, res) => {

    try {
        res.render('login')
    } catch (error) {
        console.log(error.message)
    }
}

const verifyLogin = async (req, res) => {

    try {
        const email = req.body.email
        const password = req.body.password

        const userData = await Warden.findOne({ email: email })
        if (userData) {

            const passwordMatch = await bcrypt.compare(password, userData.password)
            if (passwordMatch) {

                if (userData.role === 2) {
                    req.session.user_id = userData._id
                    req.session.role = userData.role
                    res.redirect('/warden/dashboard')
                }
                else {
                    res.render('login', { message: "Not a warden" })
                    
                }

            } else {
                res.render('login', { message: "Email and password is incorrect" })
            }

        } else {
            res.render('login', { message: "Email and password is incorrect" })
        }
    }
    catch (error) {
        console.log(error.message)
    }
}

const logout = async (req, res) => {

    try {
        req.session.destroy()
        res.redirect('/warden')
    } catch (error) {
        console.log(error.message)
    }
}

const loadHostelDetails = async (req, res) => {

    try {

        const hostelData = await Hostel.findOne({name : req.query.n})
        console.log(hostelData)
        res.render('hostel-details', {hostel: hostelData})
        
    } catch (error) {
        console.log(error.message)
    }
}

const loadLeaves = async (req, res) => {
    try {
      const wardenHostel = (await Warden.findOne({_id: req.session.user_id})).hostel_name
      console.log(wardenHostel)
      
      Leave.find({ hostel_name : wardenHostel }, (err, leavesList) => {
        if (err) {
          console.log(err);
          res.send('An error occurred while retrieving leaves.');
        } else {
          leavesList.reverse();
          res.render('leaves', { leavesList: leavesList });
        }
      });
    } catch (error) {
      console.log(error.message);
    }
};

const approveLeave = async (req, res) => {
    try {
        console.log("This is the leave id: \n",req.body.leave_id)
        const leave = await Leave.findOneAndUpdate(
            { leave_id: req.body.leave_id, status: 'pending' },
            { $set: { status: 'approved' } },
            { new: true }
        );
        if (leave) {
            res.status(200).json({ message: 'Leave approved successfully' });
        } else {
            res.status(404).json({ message: 'Leave not found' });
        }

    } catch (error) {
        console.error(err);
        res.status(500).json({ message: 'Failed to approve leave' });
    }
}

const rejectLeave = async (req, res) => {
    try {
        console.log(req.body.leave_id)
        const leave = await Leave.findOneAndUpdate(
            { leave_id: req.body.leave_id , status: 'pending'},
            { $set: { status: 'rejected' } },
            { new: true }
        );
        if (leave) {
            res.status(200).json({ message: 'Leave rejected successfully' });
        } else {
            res.status(404).json({ message: 'Leave not found' });
        }

    } catch (error) {
        console.error(err);
        res.status(500).json({ message: 'Failed to reject leave' });
    }
}


module.exports = {
    loadDashboard,
    loadLogin,
    verifyLogin,
    logout,
    loadHostelDetails,
    loadLeaves,
    approveLeave,
    rejectLeave
}


