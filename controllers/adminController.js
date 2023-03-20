const User = require('../models/userModel')
const Hostel = require('../models/hostelModel')
const Complaint = require('../models/complaintModel')
const Warden = require('../models/wardenModel')
const Department = require('../models/departmentModel')
const bcrypt = require('bcrypt')
const Leave = require('../models/leaveModel')


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

        const userData = await User.findOne({ email: email })
        if (userData) {

            const passwordMatch = await bcrypt.compare(password, userData.password)
            if (passwordMatch) {

                if (userData.role === 0) {
                    res.render('login', { message: "Not an admin" })
                }
                else {
                    req.session.user_id = userData._id
                    req.session.role = userData.role
                    res.redirect('/admin/home')
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


const loadHome = async (req, res) => {

    try {
        const complaintData = await Complaint.find({})
        const leaveData = await Leave.find({})
        const userData = await User.findById({ _id: req.session.user_id })
        res.render('home', { user: userData, leave: leaveData, complaint: complaintData })
    } catch (error) {
        console.log(error.message)
    }
}

const logout = async (req, res) => {

    try {
        req.session.destroy()
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message)
    }
}

const loadDashboard = async (req, res) => {

    try {

        const usersData = await User.find({ role: 0 })
        const hostelsData = await Hostel.find({})
        res.render('dashboard', { users: usersData, hostels: hostelsData })
    } catch (error) {
        console.log(error.message)
    }
}

const loadUsersList = async (req, res) => {

    try {
        const page = req.query.page
        const limit = 20
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        results = {}
        const usersData = await User.find({ role: 0 })
        results.results = (usersData).slice(startIndex, endIndex);
        results.currentPage = page
        res.render('users-list', { userData: results })
    } catch (error) {
        console.log(error.message)
    }
}

const loadHostelsList = async (req, res) => {

    try {

        const hostelsData = await Hostel.find({})
        res.render('hostels-list', { hostels: hostelsData })
    } catch (error) {
        console.log(error.message)
    }
}



const loadAddHostel = async (req, res) => {

    try {
        const departmentsData = await Department.find({})
        res.render('addHostel', { departmentsData: departmentsData })

    } catch (error) {
        console.log(error.message)
    }
}

const loadHostelDetails = async (req, res) => {

    try {
        const hostelName = req.query.id
        const page = req.query.page
        const limit = 20
        const hostelData = await Hostel.findOne({ name: hostelName })

        const results = {

        };
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        results.results = (hostelData.rooms).slice(startIndex, endIndex);
        results.currentPage = page

        res.render('hostel-details', { hostelData: hostelData, roomData: results })

    } catch (error) {
        console.log(error.message)
    }
}



const loadUserDetails = async (req, res) => {

    try {
        const regNo = req.query.id
        const users = await User.find({ reg_no: regNo }).exec()
        res.render('user-details', { userData: users })
    } catch (error) {
        console.log(error.message)
    }
}



const insertHostel = async (req, res) => {


    try {


        cap = req.body.capacity

        var rooms = []

        for (let i = 0; i < cap; i++) {
            rooms.push({
                room_no: i + 1
            })
        }

        console.log(rooms)

        const hostel = new Hostel({
            name: req.body.name,
            address: req.body.address,
            capacity: req.body.capacity,
            vacancy: req.body.capacity,
            type: req.body.type,
            contact: req.body.contact,
            dept: req.body.dept,
            rooms: rooms

        });

        console.log(req.body)

        const hostelData = await hostel.save()

        if (hostelData) {

            res.redirect('/admin/home')
        }
        else {
            res.render('addHostel', { message: "Process failed!" })
        }

    } catch (error) {
        console.log(error.message)
    }
}

const loadComplaints = async (req, res) => {
    try {
        Complaint.find({}, (err, complaintList) => {
            if (err) {
                console.log(err);
                res.send('An error occurred while retrieving complaints.');
            } else {
                res.render('complaints', { complaintList: complaintList });
            }
        });
    } catch (error) {
        console.log(error.message);
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

const loadAddWarden = async (req, res) => {

    try {

        const hostelsData = await Hostel.find({})
        res.render('addWarden', { hostelsData: hostelsData })
    } catch (error) {
        console.log(error.message);
    }
}

const addWarden = async (req, res) => {

    try {

        const spassword = await securePassword(req.body.password)

        const warden = new Warden({
            name: req.body.name,
            address: req.body.address,
            email: req.body.email,
            phone: req.body.phone,
            password: spassword,
            hostel_name: req.body.hostel_name,
            role: 2

        });

        const wardenData = await warden.save()

        if (wardenData) {
            res.send(`
            <h1>Warden has been added
            <h3>Redirecting 
            <script>
            window.setTimeout(function(){
                window.location.href = "/admin/addWarden";
        
            }, 3000);
    </script>`);
        }
        else {
            res.send(`
            <h1>An error occured
            <h3>Redirecting 
            <script>
            window.setTimeout(function(){
                window.location.href = "/admin/addWarden";
        
            }, 3000);
    </script>`);

        }

    } catch (error) {
        console.log(error.message)
    }
}

const returnSearch = async (req, res) => {
    try {
        const payload = (req.body.payload.trim())
        let searchData = await User.find(
            { name: { $regex: new RegExp('^' + payload + '.*', 'i') } },
            { name: 1, _id: 0 }
        ).exec()
        searchData = searchData.slice(0, 5)
        console.log(searchData)
        res.send({ payload: searchData })

    } catch (error) {
        console.log(error)
    }
}

const allocateStudents = async(req, res)=> {
    try {
      // Find all students in the database, sorted by marks in descending order
      const students = await User.find({"hostel_allocated.status": {$eq: "pending"}}).sort({ marks: -1 });
  
      // Find all hostels in the database
      const hostels = await Hostel.find({});
  
      // Loop through each student
      for (let i = 0; i < students.length; i++) {
        let allocated = false;
  
        // Loop through each hostel
        for (let j = 0; j < hostels.length; j++) {
          // Check if the hostel has a quota for the student's department
          if (hostels[j].dept[students[i].department].quota > 0) {
            // Allocate the student to the hostel and update the quota
            hostels[j].dept[students[i].department].quota--;
            students[i].hostel_allocated.hostel_name = hostels[j].name;

            var rooms = []
            var vacan = 0


            await Hostel.findOne({ name: hostels[j].name }).then((hostel) => {
                hostel.rooms.forEach(function (room) {
                    if(room.vacant){
                        rooms.push(room.room_no)
                    }
                })
            })
    
            var rand_room = rooms[Math.floor(Math.random() * rooms.length)];

            students[i].hostel_allocated.room_no = rand_room
            students[i].save();
            allocated = true;
            break;
          }
        }
  
        // If the student was not allocated to any hostel, assign them to a default hostel
        if (!allocated) {
          students[i].hostel = 'Default Hostel';
          students[i].save();
        }
      }
  
      console.log('Allocation complete!');
    } catch (err) {
      console.error(err);
    }
  }
  
  // Call the function to allocate the students to hostels

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

          await User.updateOne(
            {name: user.name},
            {$set: {
                "hostel_allocated.$.status": "approved"
            }}
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
      if(allocatedData)
           return allocatedData
     else
         return false;
  
    } catch (error) {
      console.log(error.message)
    }
  }






module.exports = {
    loadLogin,
    verifyLogin,
    loadHome,
    logout,
    loadDashboard,
    insertHostel,
    loadAddHostel,
    loadHostelDetails,
    loadUserDetails,
    loadHostelsList,
    loadUsersList,
    loadComplaints,
    addWarden,
    loadAddWarden,
    returnSearch,
    allocateStudents,
    randHostel
}
