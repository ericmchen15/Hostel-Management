const User = require('../models/userModel')
const Hostel = require('../models/hostelModel')
const Complaint = require('../models/complaintModel');
const Leave = require('../models/leaveModel')
const Department = require('../models/departmentModel')
const bcrypt = require('bcrypt')

const nodemailer = require('nodemailer');
const { ObjectId } = require('mongodb');
const PUBLISHABLE_KEY = 'pk_test_51MjI0OSCU5yTsDL8ehrVZDYo4tD5KSzqTzXZPmJQZelawlGfuew2feSCaQeux7ZXHxEruu3w8vpHr4ylq5GK64tV00WUb8yvNy'
const SECRET_KEY = 'sk_test_51MjI0OSCU5yTsDL8qWYTbuqQQsQM4lXU6ru7VPNGjnCD7ILJGyec9AtB3rk31t5dzM3lcSxIowy35BkTcANdUsdQ00EOPWUxzv'


const stripe = require('stripe')(SECRET_KEY)

const allocateHostel = async(req, res) =>{
    try {
        


    } catch (error) {
        console.log(error.message)
    }
}

const randomHostel = async (reg_no, gender, name, session_key) => {
    try {

        var boys_hos = []
        var girls_hos = []
        var rooms = []
        var vacan = 0

        const userData = await User.findOne({_id: session_key})
        const hostelsData = await Hostel.find({})
        hostelsData.forEach(function (hostel) {
            vacan = hostel.vacancy //existing vacancy
            console.log(vacan)
            if(hostel.vacancy){
                if(hostel.type=="male")
                { 
                    boys_hos.push(hostel.name)
                }else{
                    girls_hos.push(hostel.name)
                }
            }
            
        })
        var allocatedHostel = ""


        console.log(`data ************** ${userData} ************* \n`)

        if (userData.hostel_allocated.hostel_name == 'None'){
            if(gender=="male"){
                allocatedHostel = boys_hos[Math.floor(Math.random() * boys_hos.length)];
            }
            else{
                allocatedHostel = girls_hos[Math.floor(Math.random() * girls_hos.length)];
            }
    
            await Hostel.findOne({ name: allocatedHostel }).then((hostel) => {
                hostel.rooms.forEach(function (room) {
                    if(room.vacant){
                        rooms.push(room.room_no)
                    }
                })
            })
    
            var allocatedRoom = rooms[Math.floor(Math.random() * rooms.length)];
    
        //     //updating hostel vacancies and student allocated
           let vacancyy = (await Hostel.findOne({name: allocatedHostel})).vacancy
           console.log(vacancyy)

            await Hostel.updateOne(
                { name: allocatedHostel, "rooms.room_no": allocatedRoom },
                { $set: { 
                    "rooms.$.vacant":  false,
                    "rooms.$.student_reg_no": reg_no,
                    "rooms.$.student_allocated": name,
                    vacancy: vacancyy - 1
             } }
              )
    
            allocatedData = ({
                'hostel_name': allocatedHostel,
                'room_no': allocatedRoom
            })

            return allocatedData
        } 
        else {
            return false
        }

    } catch (error) {
        console.log(error.message)
    }
}

const randHostel = async (reg_no, gender, name, session_key) => {
    try {
  
      var boys_hos = []
      var girls_hos = []
      var rooms = []
      var vacan = 0
  
      const userData = await User.find({ "hostel_allocated.status": { $eq: "pending" } }).sort({ percentage: -1 });
  
      // const userData = await User.findOne({_id: session_key})
      const hostelsData = await Hostel.find({})
      hostelsData.forEach(function (hostel) {
        vacan = hostel.vacancy //existing vacancy
        console.log(vacan)
        if (hostel.vacancy) {
          if (hostel.type == "male") {
            boys_hos.push(hostel.name)
          } else {
            girls_hos.push(hostel.name)
          }
        }
  
      })
  
      var allocatedHostel = ""
  
  
      console.log(`data ************** ${userData} ************* \n`)
  
      var random_boys_hos = []
      var random_girls_hos = []
  
      await userData.forEach(async user => {
        if (user.gender == "male") {
          const department = user.dept
          boys_hos.forEach(hostel => {
  
            if (hostel.dept[user.dept].vacancy > 0) {
              random_boys_hos.push(hostel.name);
            }
          })
  
          allocatedHostel = random_boys_hos[Math.floor(Math.random() * random_boys_hos.length)];
  
          // allocatedHostel.dept[user.department].vacancy--;
  
          await Hostel.findOne({ name: allocatedHostel }).then((hostel) => {
            hostel.rooms.forEach(function (room) {
              if (room.vacant) {
                rooms.push(room.room_no)
              }
            })
          })
  
          var allocatedRoom = rooms[Math.floor(Math.random() * rooms.length)];
  
          let hostelVacancy = (await Hostel.findOne({ name: allocatedHostel })).vacancy
          let deptVacancy = (await Hostel.findOne({name: allocatedHostel } ,{dept: 1, _id: 0})).dept.department.vacancy
          console.log(hostelVacancy)
  
          await Hostel.updateOne(
            { name: allocatedHostel, "rooms.room_no": allocatedRoom },
            {
              $set: {
                "rooms.$.vacant": false,
                "rooms.$.student_reg_no": reg_no,
                "rooms.$.student_allocated": name,
                vacancy: hostelVacancy - 1,
              }
            }
          )

          await Hostel.updateOne(
            { name: allocatedHostel }, 
            { $set: { "dept.$[dept].vacancy": deptVacancy - 1 } },
            { arrayFilters: [{ "dept._id": "user" }] }
          )
  
          allocatedData = ({
            'hostel_name': allocatedHostel,
            'room_no': allocatedRoom
          })
  
        } else {
          girls_hos.forEach(hostel => {
  
            if (hostel.dept[user.dept].vacancy > 0) {
              random_girls_hos.push(hostel.name);
            }
          })
  
          allocatedHostel = random_girls_hos[Math.floor(Math.random() * random_girls_hos.length)];
  
          // allocatedHostel.dept[user.department].vacancy--;
  
          await Hostel.findOne({ name: allocatedHostel }).then((hostel) => {
            hostel.rooms.forEach(function (room) {
              if (room.vacant) {
                rooms.push(room.room_no)
              }
            })
          })
  
          var allocatedRoom = rooms[Math.floor(Math.random() * rooms.length)];
  
          let vacancyy = (await Hostel.findOne({ name: allocatedHostel })).vacancy
          console.log(vacancyy)
  
          await Hostel.updateOne(
            { name: allocatedHostel, "rooms.room_no": allocatedRoom },
            {
              $set: {
                "rooms.$.vacant": false,
                "rooms.$.student_reg_no": reg_no,
                "rooms.$.student_allocated": name,
                vacancy: vacancyy - 1
              }
            }
          )
  
          allocatedData = ({
            'hostel_name': allocatedHostel,
            'room_no': allocatedRoom
          })
  
  
        }
      }
      )
  
    } catch (error) {
      console.log(error.message)
    }
  }

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
            role: 0
        })

        if(await User.findOne({reg_no : req.body.reg_no}) || await User.findOne({email: req.body.email})){
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
        res.render('apply-hostel', { departmentsData: departmentsData })

    } catch (error) {
        console.log(error.message)
    }
}

//got it working
const applyHostel = async (req, res) => {
    try {
        if (await User.findOne({ reg_no: req.body.reg_no })) {
            console.log(User.reg_no)

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
                            hostel_name: "None",
                            room_no: 0,
                            status: "pending"
                        }

                    }
                }, function (err, result) {
                    if (err) {
                        console.log(`error ${err}`);
                    } else {
                        console.log(result);
                        res.send("SUcceess")
                        // res.send(`You have been allocated at ${randHostel.hostel_name} room no ${randHostel.room_no}`)
                    }
                });

        } else {
            res.send("Invalid Reg no.")
        }


    } catch (error) {
        console.log(`errrrro ${error.message}`)
    }

}

// const applyHostel = async (req, res) => {
//     try {

//         const randHostel = await randomHostel(req.body.reg_no, req.body.gender, req.body.name, req.session.user_id)

//         if(await User.findOne({reg_no : req.body.reg_no})){
//             console.log(User.reg_no)
//             if (!randHostel){
//                 res.send("You have already been allocated") 
//             } else {
//                 User.updateOne({ _id: req.session.user_id },
//                     {
//                         $set: {
//                             dept: req.body.dept,
//                             semester: req.body.semester,
//                             address: req.body.address,
//                             guardian_name: req.body.guardian_name,
//                             guardian_phone: req.body.guardian_phone,
//                             percentage: req.body.percentage,
//                             hostel_allocated: randHostel
        
        
//                         }
//                     }, function (err, result) {
//                         if (err) {
//                             console.log(`error ${err}`);
//                         } else {
//                             console.log(result);
//                             res.send(`You have been allocated at ${randHostel.hostel_name} room no ${randHostel.room_no}`)
//                         }
//                     });
//             }
//         }else{
//             res.send("Invalid Reg no.")
//         }
        

//     } catch (error) {
//         console.log(`errrrro ${error.message}`)
//     }

// }


//login user method started

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
        res.render('home', { user: userData })
    } catch (error) {
        console.log(error.message)
    }
}

const userLogout = async (req, res) => {

    try {

        req.session.destroy()
        res.redirect('/')

    } catch (error) {
        console.log(error.message)
    }
}

const editLoad = async (req, res) => {

    try {
        const id = req.query.id

        const userData = await User.findById({ _id: id })

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

const submitComplaint = async( req, res) => {
    try {
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
        hostelName: (await User.findOne({ _id: req.session.user_id})).hostel_allocated.hostel_name,
        submittedBy: req.body.submittedBy
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

const loadVacate = async( req, res) => {
    try {
        const user = await User.findByIdAndUpdate({ _id: req.session.user_id })
        if(user.hostel_allocated.hostel_name === 'None'){
           res.send('Sorry! You have not been allocated any room!')
           return;
        }
        res.render('vacate')
    } catch (error) {
        console.log(error.message)
    }

}

  
const vacateUser = async (req, res) => {
    try {
    
      // Find the user and update in the database
      await User.findByIdAndUpdate({ _id: req.session.user_id }, { $set: { "hostel_allocated.hostel_name": "None", "hostel_allocated.room_no": 0 } });

      //const user = await User.findOne({ reg_no: req.body.regNo });
  
      // Find the hostel documents
      const hostels = await Hostel.find({});

      console.log(req.body.regNo)
  
      // Loop through each hostel document
      for (let i = 0; i < hostels.length; i++) {
        const hostel = hostels[i];
  
        // Loop through the rooms array and update the vacant and student_allocated fields
        for (let j = 0; j < hostel.rooms.length; j++) {
          const room = hostel.rooms[j];
          if (room.student_reg_no === req.body.regNo) {
            hostel.vacancy++;
            room.vacant = true;
            room.student_allocated = "";
            room.student_reg_no = "";
          }
        }
  
        // Save the updated hostel document back to the database
        await hostel.save();
        
      }
  
      res.send("User vacated successfully");
    } catch (error) {
      console.log(error.message);
    }
  };
  
  
  
const loadPayment = async (req, res) => {
    try {

        res.render('payment', {key: PUBLISHABLE_KEY})
        // console.log(stripe.create)

    } catch (error) {
        console.log(error.message)
    }
}

const makePayment = async (req, res) => {
    try {

        stripe.customers.create({
            email: req.body.stripeEmail,
            source: req.body.stripeToken,
            name: "XYZ",
            address: {
                line1 : 'Lyon Estates, Hill Valley',
                postal_code: '110092',
                city: 'Guwahati',
                state: 'Assam',
                country: 'India'
            }
        }).then((customer)=>{
                return stripe.paymentIntents.create({
                amount: 5000,
                description: 'Applying Hostel Room',
                currency: 'USD',
                customer: customer.id,
                payment_method: 'pm_card_visa',
                confirm: true
            })
        }).then((charge)=>{
            console.log(charge)
            res.send("Success")
        })
        .catch((error)=>{
            res.send(error.message)
            console.log(error.message)
        })


    } catch (error) {
        console.log(error.message)
    }
}

const loadApplyLeave = async (req, res) => {
    try {     
       
        const hostel_name = ((await User.findOne({ _id: req.session.user_id})).hostel_allocated).hostel_name
        if(hostel_name === 'None'){
            res.send("<h2>Sorry!!!</h2> \n You can't apply for leave since you've not been allocated a room in any Hostel yet.")
        }
        else{
            res.render('apply-leave')
        }
        
    } catch (error) {
        console.log(error.message)
    }
}

const applyLeave = async (req, res) => {
    try {  
        const leaveData = new Leave({
            reg_no:  ((await User.findOne({ _id: req.session.user_id})).reg_no),
            leave_id: new ObjectId(),
            reason: req.body.reason,
            from: req.body.from,
            to: req.body.to,
            hostel_name: ((await User.findOne({ _id: req.session.user_id})).hostel_allocated).hostel_name
        })

            
            await leaveData.save()
            res.redirect('/')
            console.log('success')      

    } catch (error) {
        console.log(error.message)
    }
}

const loadLeave = async (req, res) => {
    try {
        const reg_no =  ((await User.findOne({ _id: req.session.user_id})).reg_no)
        console.log(reg_no)
        Leave.find({reg_no: reg_no}, (err, leavesList) => {
        if (err) {
          console.log(err);
          res.send('An error occurred while retrieving leaves.');
        } else {
            console.log(leavesList)
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
        res.render('hostels-list', {hostels: hostels})
        // console.log(stripe.create)

    } catch (error) {
        console.log(error.message)
    }
};


const loadHostelDetails = async (req, res) => {
    try {
        Hostel.findById(req.params.id, function(err, hostel) {
            if (err) {
              console.log(err);
              res.send('Error occurred while retrieving hostel details');
            } else {
              res.render('hostel-details.ejs', { hostel: hostel });
            }
          });
    
    } catch (error) {
      console.log(error.message);
    }
};
  

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
    vacateUser,
    loadVacate,
    loadPayment,
    makePayment,
    loadApplyLeave,
    applyLeave,
    loadLeave,
    loadHostelsList,
    loadHostelDetails
}