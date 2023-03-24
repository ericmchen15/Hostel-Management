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
        var results = {}
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


        var cap = req.body.capacity

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


// const randHostel = async (req,res) => {
//     try {
//         const hostelsData = await Hostel.find({ vacancy: { $gt: 0 } });
//         hostelsData.forEach(hostel => {

//             console.log(hostel.dept.get("CSE").vacancy)
//         })
//         res.send(hostelsData)

//     } catch (error) {
//         console.log(error)
//     }
// }

const randHostel = async (req, res) => {
    try {
        let allocatedStudents = []
        let nonAllocatedStudents = []

        const userData = await User.find({ "hostel_allocated.status": "pending" }).sort({ percentage: -1 });
        const hostelsData = await Hostel.find({ vacancy: { $gt: 0 } });

        const boys_hos = hostelsData.filter(hostel => hostel.type === "male");
        //console.log(boys_hos)
        const girls_hos = hostelsData.filter(hostel => hostel.type === "female");

        for (let i = 0; i < userData.length; i++) {
            var allocatedData 
            var allocatedHostel = ''
            var allocatedRoom = ''
            var vacantRooms = []
            const userDept = userData[i].dept
            // console.log("user dept: ", userDept)


            if (userData[i].gender == "male") {
                var dept_boys_hos = []
                var dept_vacancy
                var hos_vacancy

                boys_hos.forEach(hos => {
                    if (hos.dept.has(userDept) && hos.dept.get(userDept).vacancy > 0) {
                        dept_vacancy = hos.dept.get(userDept).vacancy
                        dept_boys_hos.push(hos);
                    }
                });

                
                //const dept_boys_hos = boys_hos.filter(hostel => hostel.dept.userDept?.vacancy > 0);
                if (dept_boys_hos.length === 0) {
                    // No hostel with vacancy in the user's department for their gender
                    nonAllocatedStudents.push(userData[i].reg_no)
                    continue;
                }

                allocatedHostel = dept_boys_hos[Math.floor(Math.random() * dept_boys_hos.length)];
                hos_vacancy = allocatedHostel.vacancy

                vacantRooms = allocatedHostel.rooms.filter(room => room.vacant );

                allocatedRoom = vacantRooms[Math.floor(Math.random() * vacantRooms.length)].room_no;
                console.log("\nallocated room ", allocatedRoom, "allocated hostel", allocatedHostel.name, userData[i].name, "vacancy", hos_vacancy-1, "Dept:", userData[i].dept, "\n")

                var deptPath = `dept.${userData[i].dept}.vacancy`;

                allocatedData = ({
                    'hostel_name': allocatedHostel.name,
                    'room_no': allocatedRoom,
                    'status': "approved"
                })

                // console.log(allocatedData)
                
                await Hostel.updateOne(
                    { name: allocatedHostel.name, "rooms.room_no": allocatedRoom },
                    {
                        $set: {
                            "vacancy": hos_vacancy-1,
                            "rooms.$.vacant": false,
                            "rooms.$.student_reg_no": userData[i].reg_no,
                            "rooms.$.student_allocated": userData[i].name,
                            [deptPath]: dept_vacancy - 1
                        }
                    }
                );

                await User.updateOne(
                    { _id: userData[i]._id },
                    { $set: { 
                        hostel_allocated: allocatedData
                    } }
                );

                // console.log("Vacancy: ",allocatedHostel.vacancy)
                // console.log("Department vacancy: ", allocatedHostel.dept.get(userDept).vacancy)

                allocatedHostel.vacancy = allocatedHostel.vacancy - 1;
                allocatedHostel.dept.get(userDept).vacancy = allocatedHostel.dept.get(userDept).vacancy-1;
                // console.log("Boy's Allocated hostel vac: ",  allocatedHostel.vacancy)
                // console.log("Boy's Dept vac: ", allocatedHostel.dept.get(userDept).vacancy)
                // dept_vacancy = dept_vacancy - 1;
        
            }


            else {
                var dept_girls_hos = []
                dept_vacancy
                hos_vacancy

                girls_hos.forEach(hos => {
                    if (hos.dept.has(userDept) && hos.dept.get(userDept).vacancy > 0) {
                        dept_vacancy = hos.dept.get(userDept).vacancy
                        dept_girls_hos.push(hos);
                    }
                });





                //const dept_girls_hos = boys_hos.filter(hostel => hostel.dept.userDept?.vacancy > 0);
                if (dept_girls_hos.length === 0) {
                    // No hostel with vacancy in the user's department for their gender
                    nonAllocatedStudents.push(userData[i].reg_no)
                    continue;
                }

                allocatedHostel = dept_girls_hos[Math.floor(Math.random() * dept_girls_hos.length)];
                hos_vacancy = allocatedHostel.vacancy

                vacantRooms = allocatedHostel.rooms.filter(room => room.vacant );
                allocatedRoom = vacantRooms[Math.floor(Math.random() * vacantRooms.length)].room_no;
                console.log("\n\nallocated room ", allocatedRoom, "allocated hostel", allocatedHostel.name, userData[i].name, "vacancy", hos_vacancy-1, "Dept:", userData[i].dept, "\n")

                deptPath = `dept.${userData[i].dept}.vacancy`;

                allocatedData = ({
                    'hostel_name': allocatedHostel.name,
                    'room_no': allocatedRoom,
                    'status': "approved"
                })

                // console.log(allocatedData)

                await Hostel.updateOne(
                    { name: allocatedHostel.name, "rooms.room_no": allocatedRoom },
                    {
                        $set: {
                            "vacancy": hos_vacancy-1,
                            "rooms.$.vacant": false,
                            "rooms.$.student_reg_no": userData[i].reg_no,
                            "rooms.$.student_allocated": userData[i].name,
                            [deptPath]: dept_vacancy - 1
                        }
                    }
                );

                await User.updateOne(
                    { _id: userData[i]._id },
                    { $set: { 
                        hostel_allocated: allocatedData
                    } }
                );

                allocatedHostel.vacancy = allocatedHostel.vacancy - 1;
                allocatedHostel.dept.get(userDept).vacancy = allocatedHostel.dept.get(userDept).vacancy-1;
                // console.log("Girl's Allocated hostel vac: ",  allocatedHostel.vacancy)
                // console.log("Girl's Dept vac: ", allocatedHostel.dept.get(userDept).vacancy)

            }

            allocatedStudents.push(userData[i].reg_no)

        }

        console.log("allocated", allocatedStudents)
        console.log("non allocated", nonAllocatedStudents)

        res.send('Seucces')
    } catch (error) {
        console.log(error.message);
        throw error;
    }
};

const vacateAll = async (req, res) => {
  try {
      const userData = await User.find({ "hostel_allocated.status": "approved" }).sort({ percentage: -1 });
      const hostelsData = await Hostel.find({ vacancy: { $gt: 0 } });


      allocatedData = ({
          'hostel_name': "NA",
          'room_no': 0,
          'status': "pending"
      })

      for (let i = 0; i < userData.length; i++) {
          await User.updateOne(
              { _id: userData[i]._id },
              { $set: { 
                  hostel_allocated: allocatedData
              } }
          );
      }
      
      for (let i = 0; i < hostelsData.length; i++) {
          var rooms = []
          var cap = hostelsData[i].capacity

          for (let i = 0; i < cap; i++) {
              rooms.push({
                  room_no: i + 1
              })
          }
          //console.log(rooms)
          var dept = ({
              CSE: { quota: '10', vacancy: '10' },
              IT: { quota: '10', vacancy: '10' },
              ECE: { quota: '10', vacancy: '10' }
            })

          await Hostel.updateOne(
              { _id: hostelsData[i]._id},
              {
                  $set: {
                      vacancy: 30 ,
                      rooms: rooms,
                      dept: dept
                  }
              }
          );
      }

      res.send("Success")
      
  } catch (error) {
      console.log(error)
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
    randHostel,
    vacateAll
}

