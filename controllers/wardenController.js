const User = require('../models/userModel')
const Hostel = require('../models/hostelModel')
const Complaint = require('../models/complaintModel')
const Warden = require('../models/wardenModel')
const bcrypt = require('bcrypt')
const Leave = require('../models/leaveModel')
const Payment = require('../models/paymentModel')
const getImage = require('../helpers/getFile')
const encode = require('../helpers/encode')

const loadDashboard = async (req, res) => {

    try {
        const wardenId = req.session.user_id
        const wardenName = (await Warden.findOne({ _id: wardenId })).name
        const wardenHostel = (await Warden.findOne({ _id: wardenId })).hostel_name
        const hostelData = await Hostel.findOne({ name: wardenHostel})
        const complaintData = await Complaint.find({hostelName: hostelData.name})
        const leaveData = await Leave.find({hostel_name: wardenHostel})

        res.render('dashboard', { wardenName: wardenName, hostel: hostelData, complaints: complaintData, leaves: leaveData, hostelName: hostelData.name })
        console.log(complaintData)

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

        const hostelData = await Hostel.findOne({ name: req.query.n })
        res.render('hostel-details', { hostel: hostelData, hostelName: hostelData.name })

    } catch (error) {
        console.log(error.message)
    }
}

const loadLeaves = async (req, res) => {
    try {
        const wardenHostel = (await Warden.findOne({ _id: req.session.user_id })).hostel_name


        Leave.find({ hostel_name: wardenHostel }, (err, leavesList) => {
            if (err) {
                console.log(err);
                res.send('An error occurred while retrieving leaves.');
            } else {
                leavesList.reverse();
                res.render('leaves', { leavesList: leavesList, hostelName: wardenHostel });
            }
        });
    } catch (error) {
        console.log(error.message);
    }
};

const approveLeave = async (req, res) => {
    try {
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
        const leave = await Leave.findOneAndUpdate(
            { leave_id: req.body.leave_id, status: 'pending' },
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

const loadAddMessDetails = async (req, res) => {
    try {
        const wardenId = req.session.user_id

        const hostelData = await Warden.findOne({ _id: wardenId })
        res.render("add-mess-details", { hostelName: hostelData.hostel_name })
    } catch (error) {
        console.log(error.message)
    }
}

const addMessDetails = async (req, res) => {
    try {
        await Hostel.updateOne(
            { name: (await Warden.findOne({ _id: req.session.user_id })).hostel_name },
            { $set: { mess: req.body } },
            { new: true }
        )

        res.send("Success")

    } catch (error) {
        console.log(error)
    }
}

const loadComplaints = async (req, res) => {
    try {
        const wardenId = req.session.user_id

        const hostelData = await Warden.findOne({ _id: wardenId })
        const complaintData = await Complaint.find({ hostelName: hostelData.hostel_name })


        res.render('view-complaints', { complaints: complaintData, hostelName: hostelData.hostel_name })
    } catch (error) {
        console.log(error.message)
    }
}

const removeBoarder = async (req, res) => {
    try {
        const userData = await User.findOne({ reg_no: req.query.q })
        const userHostel = userData.hostel_allocated.hostel_name
        const userRoom = userData.hostel_allocated.room_no
        const userDept = userData.dept

        const hostelData = await Hostel.findOne({ name: userHostel })

        const vacancy = hostelData.vacancy;

        var deptPath = `dept.${userDept}.vacancy`;
        console.log("Dept Path: ", deptPath)
        var dept_vacancy = parseInt(hostelData.dept.get(userDept).vacancy)
        console.log("Dept vacancy: ", dept_vacancy)

        await Hostel.updateOne(
            { name: userHostel, "rooms.room_no": userRoom },
            {
                $set: {
                    "vacancy": vacancy + 1,
                    "rooms.$.vacant": true,
                    "rooms.$.student_reg_no": 'NA',
                    "rooms.$.student_allocated": 'NA',
                    [deptPath]: dept_vacancy + 1
                }
            }
        );

        await User.findOneAndUpdate({ reg_no: req.query.q }, { $set: { "hostel_allocated.hostel_name": "NA", "hostel_allocated.room_no": 0, "hostel_allocated.status": "NA" } });

        res.redirect('/warden/dashboard?message=Successfully removed boarder!');


    } catch (error) {
        console.log(error.message)
    }
}

const loadPayments = async(req, res) => {
    try {
        const wardenId = req.session.user_id

        const hostelName = (await Warden.findOne({ _id: wardenId })).hostel_name
        const paymentList = (await Payment.find({hostel_name: hostelName}))
        res.render('view-payments', {paymentList: paymentList, hostelName: hostelName})
        
    } catch (error) {
        console.log(error.message)
    }
}

const viewPaymentFile = async(req, res) => {
    try {
        const { key } = req.query
        const hostelName = (await Warden.findOne({ _id: req.session.user_id })).hostel_name

        const img = await getImage(key);

        const data = await encode(img.Body);
        const file = `data:image/jpg;base64,${data}`;

        res.render('view-payment-file', {file: file, hostelName: hostelName})
        
    } catch (error) {
        console.log(error.message)
    }
}

const loadMessDetails = async(req, res) => {
    try {
        const warden = await Warden.findOne({ _id: req.session.user_id });
        const hostelName = warden.hostel_name;

        const hostel = await Hostel.findOne({ name: hostelName })
        const mess = hostel.mess;

        console.log(hostelName);
        console.log(mess);

        const messDetails = [...hostel.mess.entries()];

        res.render('mess-details', { hostelName: hostelName, messDetails: messDetails })
        
    } catch (error) {
        console.log(error.message);
    }
}

const resolveComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findOneAndUpdate(
            { complaint_id: req.body.complaint_id, status: 'Pending' },
            { $set: { status: 'Resolved' } },
            { new: true }
        );
        if (complaint) {
            res.status(200).json({ message: 'Resolved successfully' });
        } else {
            res.status(404).json({ message: 'Complaint not found' });
        }

    } catch (error) {
        console.error(err);
        res.status(500).json({ message: 'Failed to resolve Complaint' });
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
    rejectLeave,
    loadAddMessDetails,
    addMessDetails,
    loadComplaints,
    removeBoarder,
    loadPayments,
    viewPaymentFile,
    loadMessDetails,
    resolveComplaint
}


