const User = require('../models/userModel')
const Hostel = require('../models/hostelModel')
const Complaint = require('../models/complaintModel');
const Warden = require('../models/wardenModel')
const Leave = require('../models/leaveModel')
const Department = require('../models/departmentModel')
const Vacate = require('../models/vacateModel')
const Payment = require('../models/paymentModel')
const bcrypt = require('bcrypt')
const moment = require('moment')
const getImage = require('../helpers/getFile')
const encode = require('../helpers/encode')

const { ObjectId } = require('mongodb');
const { createNewCustomer, createSession, validateSession } = require('../helpers/payment');
const PUBLISHABLE_KEY = process.env.PUBLISHABLE_KEY
const SECRET_KEY = process.env.SECRET_KEY


const stripe = require('stripe')(SECRET_KEY)



const randHostel = async (req, res) => {
    try {
        var allocatedStudents = []
        var nonAllocatedStudents = []

        const userData = await User.find({ "hostel_allocated.status": "pending" }).sort({ percentage: -1 });
        const hostelsData = await Hostel.find({ vacancy: { $gt: 0 } });

        const boys_hos = hostelsData.filter(hostel => hostel.type === "male");
        const girls_hos = hostelsData.filter(hostel => hostel.type === "female");

        for (let i = 0; i < userData.length; i++) {
            const random_boys_hos = boys_hos.filter(hostel => hostel.dept[userData[i].dept].vacancy > 0);
            if (random_boys_hos.length === 0) {
                // No hostel with vacancy in the user's department for their gender
                nonAllocatedStudents.push(userData[i].reg_no)
                continue;
            }
            const random_girls_hos = girls_hos.filter(hostel => hostel.dept[userData[i].dept].vacancy > 0);
            if (random_girls_hos.length === 0) {
                // No hostel with vacancy in the user's department for their gender
                nonAllocatedStudents.push(userData[i].reg_no)
                continue;
            }

            const allocatedHostel = (userData[i].gender === "male") ? random_boys_hos[Math.floor(Math.random() * random_boys_hos.length)] : random_girls_hos[Math.floor(Math.random() * random_girls_hos.length)];

            const vacantRooms = allocatedHostel.rooms.filter(room => room.vacant);
            const allocatedRoom = vacantRooms[Math.floor(Math.random() * vacantRooms.length)].room_no;

            await Hostel.updateOne(
                { name: allocatedHostel.name, "rooms.room_no": allocatedRoom },
                {
                    $set: {
                        "rooms.$.vacant": false,
                        "rooms.$.student_reg_no": userData[i].reg_no,
                        "rooms.$.student_allocated": userData[i].name,
                    },
                    $inc: { vacancy: -1, "dept.$[dept].vacancy": -1 }
                },
                { arrayFilters: [{ "dept._id": allocatedHostel._id }] }
            );

            await User.updateOne(
                { _id: userData[i]._id, "hostel_allocated.status": "pending" },
                { $set: { "hostel_allocated.$.status": "approved" } }
            );


            const allocatedData = {
                hostel_name: allocatedHostel.name,
                room_no: allocatedRoom
            };

            allocatedStudents.push(userData[i].reg_no)

        }

        console.log(allocatedStudents)
        console.log(nonAllocatedStudents)

        res.send("Success");
    } catch (error) {
        console.log(error.message);
        throw error;
    }
};

const securePassword = async (password) => {

    try {

        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash

    } catch (error) {
        console.log(error.message)
    }
}



const loadRegister = async (req, res) => {
    try {

        res.render('registration')

    } catch (error) {
        console.log(error.message)
    }
}

const insertUser = async (req, res) => {

    try {
        
        const spassword = await securePassword(req.body.password)

        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.mno,
            password: spassword,
            reg_no: req.body.regNo,
            gender: req.body.gender,
            role: 0,
            user_created_timestamp: getTimestamp(),
            user_customer_id: await createNewCustomer(req.body.name, req.body.email),
            user_profile_image: req.file.key
        })

        if (await User.findOne({ reg_no: req.body.reg_no }) || await User.findOne({ email: req.body.email })) {
            res.send("A user with the same registration no or email is already registered")
        } else {
            await user.save()
            res.redirect('/')
        }


    } catch (error) {
        console.log(error.message)
    }
}

const loadApplyHostel = async (req, res) => {
    try {
        const departmentsData = await Department.find({})
        const userRegNo = (await User.findById({ _id: req.session.user_id })).reg_no

        const userHostel = (await User.findOne({ reg_no: userRegNo })).hostel_allocated.hostel_name
        const userHostelStatus = (await User.findOne({ reg_no: userRegNo })).hostel_allocated.status

        if (userHostel !== 'NA' || (userHostelStatus === 'pending' || userHostelStatus === 'approved')) {
            res.send('<script>alert("You have already applied for hostel. Please click ok to proceed"); window.location.href = "/home";</script>');
            return;
        }

        res.render('apply-hostel', { departmentsData: departmentsData })

    } catch (error) {
        console.log(error.message)
    }
}

//got it working
const applyHostel = async (req, res) => {
    try {
        if (await User.findOne({ reg_no: req.body.reg_no })) {


            User.updateOne({ _id: req.session.user_id },
                {
                    $set: {
                        dept: req.body.dept,
                        semester: req.body.semester,
                        address: req.body.address,
                        percentage: req.body.percentage,
                        guardian_name: req.body.guardian_name,
                        guardian_phone: req.body.guardian_phone,
                        hostel_allocated: {
                            hostel_name: "NA",
                            room_no: 0,
                            status: "pending"
                        },
                        user_allocation_batch: 'applied'

                    }
                }, function (err, result) {
                    if (err) {
                        console.log(`error ${err}`);
                    } else {
                        console.log(result);
                        res.send('<script>alert("Success"); window.location.href = "/home";</script>');
                        // res.send(`You have been allocated at ${randHostel.hostel_name} room no ${randHostel.room_no}`)
                    }
                });

        } else {
            res.send('<script>alert("Invalid Registration No"); window.location.href = "/apply-hostel";</script>');
        }


    } catch (error) {
        console.log(`errrrro ${error.message}`)
    }

}


const loginLoad = async (req, res) => {

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

        const userData = await User.findOne({ email: email })

        if (userData) {

            const passwordMatch = await bcrypt.compare(password, userData.password)

            if (passwordMatch) {

                if (userData.is_verified === 0) {
                    res.render('login', { message: "Please verify your mail." })
                } else {
                    req.session.user_id = userData._id
                    req.session.role = userData.role
                    res.redirect('/home')
                }

            } else {
                res.render('login', { message: "Incorrect Email/Password." })
            }

        } else {
            res.render('login', { message: "Incorrect Email/Password." })
        }

    } catch (error) {
        console.log(error.message)
    }

}

const loadHome = async (req, res) => {

    try {

        const userData = await User.findById({ _id: req.session.user_id })
        const hostelData = await Hostel.findOne({ name: userData.hostel_allocated.hostel_name });
        const leaves = await Leave.find({ reg_no: userData.reg_no})
        const complaints = await Complaint.find({ userId: userData._id })
        

        let warden = "None";
        let leaveData = "None";
        if (hostelData) {
            messData = hostelData.mess ? hostelData.mess : "None";
            warden = (await Warden.findOne({ hostel_name: userData.hostel_allocated.hostel_name })) ? (await Warden.findOne({ hostel_name: userData.hostel_allocated.hostel_name })) : "None";
            leaveData = (await Leave.find({ reg_no: userData.reg_no })) ? leaveData = await Leave.find({ reg_no: userData.reg_no }) : "None";
        } 

        res.render('home', { user: userData, warden: warden, hostel: hostelData, leaves: leaves, complaints: complaints })
    } catch (error) {
        console.log(error.message)
    }
}

const userLogout = async (req, res) => {

    try {

        req.session.destroy()
        res.redirect('/login')


    } catch (error) {
        console.log(error.message)
    }
}

const editLoad = async (req, res) => {

    try {
        const id = req.query.id

        const userData = await User.findById({ _id: req.session.user_id })

        if (userData) {
            res.render('edit', { user: userData })
        } else {
            res.redirect('/home')
        }

    } catch (error) {
        console.log(error.message)
    }
}

const updateProfile = async (req, res) => {

    try {

        if (req.file) {
            const userData = await User.findByIdAndUpdate({ _id: req.body.user_id }, { $set: { name: req.body.name, email: req.body.email, phone: req.body.mno } })
        } else {
            const userData = await User.findByIdAndUpdate({ _id: req.body.user_id }, { $set: { name: req.body.name, email: req.body.email, phone: req.body.mno } })
        }

        res.redirect('/home')

    } catch (error) {
        console.log(error.message)
    }
}

const submitComplaint = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate({ _id: req.session.user_id })
        if (user.hostel_allocated.hostel_name === 'NA') {
            res.send('<script>alert("You have not been assigned to any hostel. Please click ok to proceed"); window.location.href = "/apply-hostel";</script>');
            return;
        }
        res.render('complaints')
    } catch (error) {
        console.log(error.message)
    }

}

const saveComplaint = async (req, res) => {
    try {
        // Create a new complaint object with data from the request body
        const newComplaint = new Complaint({
            title: req.body.title,
            description: req.body.description,
            hostelName: (await User.findOne({ _id: req.session.user_id })).hostel_allocated.hostel_name,
            date: Date.now(),
            submittedBy: req.body.submittedBy,
            regNo: req.body.regNo,
            userId: req.session.user_id
        });

        // Save the complaint to the database
        newComplaint.save(err => {
            if (err) {
                console.log(err);
                res.send('An error occurred while submitting your complaint.');
            } else {
                res.redirect('/home');
            }
        });
    } catch (error) {
        console.log(error.message);
    }
};

const loadVacate = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate({ _id: req.session.user_id })
        if (user.hostel_allocated.hostel_name === 'NA') {
            res.send('<script>alert("You have not been assigned to any hostel. Please click ok to proceed"); window.location.href = "/apply-hostel";</script>');
            return;
        }
        res.render('vacate')
    } catch (error) {
        console.log(error.message)
    }

}


const vacate = async (req, res) => {
    try {

        const userHostel = (await User.findById({ _id: req.session.user_id })).hostel_allocated.hostel_name
        const userRoom = (await User.findById({ _id: req.session.user_id })).hostel_allocated.room_no
        const userDept = (await User.findById({ _id: req.session.user_id })).dept

        console.log("USER HOSTEL: ", userHostel, "USER ROOM: ", userRoom, "USER DEPT: ", userDept)

        const hostel = await Hostel.findOne({ name: userHostel });
        console.log("Hostel: ", hostel)
        const vacancy = hostel.vacancy;

        var deptPath = `dept.${userDept}.vacancy`;
        console.log("Dept Path: ", deptPath)
        var dept_vacancy = parseInt(hostel.dept.get(userDept).vacancy)
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

        await User.findByIdAndUpdate({ _id: req.session.user_id }, { $set: { "hostel_allocated.hostel_name": "NA", "hostel_allocated.room_no": 0, "hostel_allocated.status": "NA" } });

        res.send('<script>alert("Vacate Applied Successfully"); window.location.href = "/home";</script>');

    } catch (error) {
        console.log(error)
    }
}


const calculateOrderAmount = (items) => {

    return 1400;
};



const loadPayment = async (req, res) => {
    try {Payment
        var isPaymentSuccess
        const userData = await User.findOne({ _id: req.session.user_id})

        if (userData.payment_status_id){
            isPaymentSuccess = await validateSession(userData.payment_status_id)
        }

        
        if (userData.hostel_allocated.hostel_name == "NA") {
            res.send('<script>alert("You have not been assigned to any hostel. Please click ok to proceed"); window.location.href = "/apply-hostel";</script>');
        } else if (userData.payment_status == "paid") {
            res.send('<script>alert("You have already made your payment."); window.location.href = "/home";</script>');
        } else {
            res.render('payment', { user: userData })
        }
        

    } catch (error) {
        throw new Error(error)
    }
}

const getTimestamp = () => {
    return moment(new Date()).format('YYYY-MM-DD');
}

const makePayment = async (req, res) => {
    try {

        const hostelName = (await User.findOne({ _id: req.session.user_id })).hostel_allocated.hostel_name

        const payment = new Payment({
            name: req.body.name,
            reg_no: req.body.reg_no,
            image: req.file.key,
            hostel_name: hostelName,
            date: getTimestamp()
        })

        const paymentData = await payment.save()

        if (paymentData) {

            res.send("Payment receipt uploaded successfully.")
        }
        else {
            res.send('Failed to upload file!')
        }

    } catch (error) {

    }
}


const loadPaymentSuccess = async (req, res) => {
    try {

        if (req.session.allow){
            updatePayment(req.session.user_id, 'success');
            delete req.session.allow;
            res.send('<script>alert("Success"); window.location.href = "/home";</script>');

        } else {
            res.send('<script>alert("An unexpected errror occurred"); window.location.href = "/home";</script>');
        }


    } catch (error) {
        console.log(error.message)
    }
}

const loadPaymentFail = async (req, res) => {
    try {

        if (req.session.allow){
            updatePayment(req.session.user_id, 'fail');
            delete req.session.allow;
            res.send('<script>alert("Failed"); window.location.href = "/home";</script>');

        } else {
            res.send('<script>alert("An unexpected errror occurred"); window.location.href = "/home";</script>');
        }


    } catch (error) {
        console.log(error.message)
    }
}


const createPaymentIntent = async (req, res) => {
    try {
        console.log("Hello")
        const paymentIntent = await stripe.paymentIntents.create({
            amount: calculateOrderAmount(items),
            currency: "usd",
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
        });

        console.log(paymentIntent.client_secret)
    } catch (error) {
        res.send("error")
    }
}

const loadApplyLeave = async (req, res) => {
    try {

        const hostel_name = ((await User.findOne({ _id: req.session.user_id })).hostel_allocated).hostel_name
        if (hostel_name === 'NA') {
            res.send('<script>alert("You have not been assigned to any hostel. Please click ok to proceed"); window.location.href = "/apply-hostel";</script>');
        }
        else {
            res.render('apply-leave')
        }

    } catch (error) {
        console.log(error.message)
    }
}

const applyLeave = async (req, res) => {
    try {

        const userData = await User.findOne({ _id: req.session.user_id })

        const leaveData = new Leave({
            reg_no: userData.reg_no,
            stud_name:  userData.name,
            leave_id: new ObjectId(),
            reason: req.body.reason,
            from: req.body.from,
            to: req.body.to,
            hostel_name: userData.hostel_allocated.hostel_name
        })


        await leaveData.save()
        res.redirect('/home')


    } catch (error) {
        console.log(error.message)
    }
}

const loadLeave = async (req, res) => {
    try {
        const userData = await User.findOne({ _id: req.session.user_id})

        
        Leave.find({ reg_no: userData.reg_no }, (err, leavesList) => {
            if (userData.hostel_allocated.hostel_name == "NA") {
                res.send('<script>alert("You have not been assigned to any hostel. Please click ok to proceed"); window.location.href = "/apply-hostel";</script>');
            } else {
                res.render('leaves', { leavesList: leavesList });
               
            }
        });
    } catch (error) {
        console.log(error.message);
    }
};

const loadHostelsList = async (req, res) => {
    try {

        const hostels = await Hostel.find({});
        res.render('hostels-list', { hostels: hostels })
        // console.log(stripe.create)

    } catch (error) {
        console.log(error.message)
    }
};


const loadHostelDetails = async (req, res) => {
    try {
        const hostel = await (Hostel.findById(req.params.id))
        const hostelName = (await Hostel.findById(req.params.id)).name
        const warden = await Warden.findOne({hostel_name: hostelName})

        res.render('hostel-details.ejs', { hostel: hostel, hostelName: hostelName, warden : warden })

    } catch (error) {
        console.log(error.message);
    }
};

const loadMessDetails = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.session.user_id });
        const hostelName = user.hostel_allocated.hostel_name;



        if (hostelName === 'NA') {
            res.send('<script>alert("You have not been assigned to any hostel. Please click ok to proceed"); window.location.href = "/apply-hostel";</script>');
            return;
        }

        const hostel = await Hostel.findOne({ name: hostelName })
        const mess = hostel.mess;

        const messDetails = [...hostel.mess.entries()];

        res.render('mess-details', { hostelName: hostelName, messDetails: messDetails })

    } catch (error) {
        console.log(error.message);
    }
}

const loadComplaints = async (req, res) => {
    try {
        const userData = await User.findOne({ _id: req.session.user_id})
        
        Complaint.find({ userId: req.session.user_id }, (err, complaintList) => {
            
            if (userData.hostel_allocated.hostel_name == "NA") {
                res.send('<script>alert("You have not been assigned to any hostel. Please click ok to proceed"); window.location.href = "/apply-hostel";</script>');
            } else {
                complaintList.reverse();
                res.render('my-complaints', { complaintList: complaintList });
            }
            
        });
    } catch (error) {
        console.log(error.message);
    }
};

const wardenDetails = async (req, res) => {
    try {

        const wardenName = req.params.name
        // const wardenData = await Warden.findOne({name: wardenName}) 

        Warden.findOne({ name: wardenName }, function (err, warden) {
            if (err) {
                console.log(err);
                res.send('Error occurred while retrieving warden details');
            } else {
                res.render('warden-details.ejs', { warden: warden });
            }
        });

    } catch (error) {
        console.log(error.message);
    }

}

const startPayment = async (req, res) => {
    try {

        const userData = await User.findOne({ _id: req.session.user_id})
        const price_id = (await Hostel.findOne({ name: userData.hostel_allocated.hostel_name })).single_seater_id
        const checkoutSession = await createSession(userData.user_customer_id, price_id)

        await User.findOneAndUpdate({ _id: req.session.user_id },
            {
                $set: {
                    payment_status_id: checkoutSession.id
                }
            });


        const paymentData = new Payment({
            payment_id: checkoutSession.id,
            date: new Date(),
            hostel_name: userData.hostel_allocated.hostel_name,
            user_name: userData.name,
            reg_no: userData.reg_no
        });

        await paymentData.save(); 
        
        req.session.allow = true

        res.redirect(checkoutSession.url);

    } catch (error) {
        console.log(error)
    }
}


const updatePayment = async (id, status) => {
    try {
        var isPaymentSuccess
        const userData = await User.findOne({ _id: id})
        const paymentData = await Payment.findOne({ reg_no: userData.reg_no })


        if (userData.payment_status_id){
            isPaymentSuccess = await validateSession(userData.payment_status_id)
        }

        if (isPaymentSuccess == 'paid' && status == 'success'){
            await User.findOneAndUpdate({ _id: id },
                {
                    $set: {
                        payment_status: 'paid'
                    }
                })
            
            await Payment.findOneAndUpdate({ reg_no: userData.reg_no }, 
                {
                    $set: {
                        status: 'paid'
                    }
                })
            
        } else if (status == 'fail') {
            await User.findOneAndUpdate({ _id: id },
                {
                    $set: {
                        payment_status: 'due'
                    }
                })
            
            await paidPayment.findOneAndUpdate({ reg_no: userData.reg_no }, 
                {
                    $set: {
                        status: 'due'
                    }
                })
        }


    } catch (error) {
        throw new Error(error)
    }
}

const loadProfile = async(req, res) => {

    try {
        const user_data = await User.findOne({_id: req.session.user_id})
        const img = await getImage(user_data.user_profile_image);

        const data = await encode(img.Body);
        const file = `data:image/jpg;base64,${data}`;

        res.render('profile', { file: file, userData : user_data});
    } 
    catch (error) {
        console.log(error)
    }

}

const loadVacateHostel = async (req, res) => {
    try {

        const hostel_name = ((await User.findOne({ _id: req.session.user_id })).hostel_allocated).hostel_name
        if (hostel_name === 'NA') {
            res.send('<script>alert("You have not been assigned to any hostel. Please click ok to proceed"); window.location.href = "/apply-hostel";</script>');
        }
        else {
            res.render('vacate')
        }

    } catch (error) {
        console.log(error.message)
    }
}

const applyVacate = async(req, res) => {

    try{
        const vacateData = new Vacate({
            reg_no: ((await User.findOne({ _id: req.session.user_id })).reg_no),
            vacate_id: new ObjectId(),
            reason: req.body.reason,
            hostel_name: ((await User.findOne({ _id: req.session.user_id })).hostel_allocated).hostel_name
        })


        await vacateData.save()
        res.redirect('/home')
        console.log('success')
    }
    catch (error) {
        console.log(error)
    }
}




module.exports = {
    loadRegister,
    applyHostel,
    loadApplyHostel,
    insertUser,
    loginLoad,
    loadHome,
    verifyLogin,
    userLogout,
    editLoad,
    updateProfile,
    submitComplaint,
    saveComplaint,
    loadVacate,
    loadPayment,
    loadApplyLeave,
    applyLeave,
    loadLeave,
    loadHostelsList,
    loadHostelDetails,
    vacate,
    loadMessDetails,
    loadComplaints,
    createPaymentIntent,
    loadPaymentSuccess,
    wardenDetails,
    makePayment,
    startPayment,
    loadProfile,
    loadPaymentFail,
    loadVacateHostel,
    applyVacate
}
