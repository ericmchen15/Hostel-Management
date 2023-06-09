const User = require('../models/userModel')
const Hostel = require('../models/hostelModel')
const Complaint = require('../models/complaintModel')
const Warden = require('../models/wardenModel')
const Department = require('../models/departmentModel')
const bcrypt = require('bcrypt')
const Leave = require('../models/leaveModel')
const map_rooms = require('../helpers/room_bed_map')
const { createPriceForProduct } = require('../helpers/payment')


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
        const allocatedUsers = await User.find({'hostel_allocated.status' : 'approved'})
        const wardens = await Warden.find({})
        const hostels = await Hostel.find({})
        const leaveData = await Leave.find({})
        const complaintData = await Complaint.find({})
        const appliedUsers = await User.find({'hostel_allocated.status' : 'pending'})
        const userData = await User.findById({ _id: req.session.user_id })
        const allocatedStudentData = await User.find({ "user_allocation_batch" : "present" }) 
        
        complaintData.reverse()
        leaveData.reverse()
        
        res.render('home', { user: userData, leave: leaveData, complaints: complaintData, allocated: allocatedUsers.length , totalWardens: wardens.length, totalHostels: hostels.length, appliedStudents: appliedUsers.length, present: allocatedStudentData })
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
        const limit = 10
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        var results = {}
        const usersData = await User.find({ role: 0, 'hostel_allocated.hostel_name': { $ne: 'NA' } })
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

const allocatedRooms = async (req, res) => {
    try {
      const hostelName = req.query.id;
  
      // Find the hostel by name
      const hostel = await Hostel.findOne({ name: hostelName });
  
      // Filter the rooms array to get all the rooms that have vacant=false
      const beds = hostel.beds.filter((bed) => !bed.vacant);

      const users = await User.find({ "hostel_allocated.hostel_name" : hostelName })

      console.log(users)
      // Send the list of rooms to the client
      res.render('allocated-rooms', { beds, users, hostelName });
    } catch (error) {
      console.log(error.message);
    }
  };
  


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

        var beds = []

        for (let i = 0; i < cap; i++) {
            beds.push({
                bed_no: i + 1
            })
        }

       // console.log(rooms)

        const hostel = new Hostel({
            id : req.body.id,
            name: req.body.name,
            address: req.body.address,
            capacity: req.body.capacity,
            vacancy: req.body.capacity,
            type: req.body.gender,
            contact: req.body.contact,
            dept: req.body.dept,
            beds: beds

        });


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
        const hostelsData = await Hostel.find({ warden: false })
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

        await Hostel.findOneAndUpdate({ name: req.body.hostel_name },
            {
                $set: {
                    warden: true
                }
            })

        const wardenData = await warden.save()

        if (wardenData) {
            
            res.send(`
            <h1>Warden has been added
            <h3>Redirecting 
            <script>
            window.setTimeout(function(){
                window.location.href = "/admin/addWarden";
        
            }, 500);
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


const loadApplications = async(req, res) => {
    try {
        var userData = await User.find({ "hostel_allocated.status": "pending",
        user_allocation_batch: {$eq: "applied"}
    }).sort({ percentage: -1 });
     
        res.render('applied-users', {userData: userData})
        
    } catch (error) {
        console.log(error.message)
    }
}


const randomHostel = async (req, res) => {
    try {

        let allocatedStudents = []
        let nonAllocatedStudents = []

        await User.updateMany(
            { user_allocation_batch: 'present' },
            { $set: { 
                user_allocation_batch: 'past'
            } }
        );

        const userData = await User.find({ "hostel_allocated.status": "pending" }).sort({ percentage: -1 });
        const hostelsData = await Hostel.find({ vacancy: { $gt: 0 } });

        const boys_hos = hostelsData.filter(hostel => hostel.type === "male");
        //console.log(boys_hos)
        const girls_hos = hostelsData.filter(hostel => hostel.type === "female");

        for (let i = 0; i < userData.length; i++) {
            var allocatedData 
            var allocatedHostel = ''
            var allocatedBed = ''
            var vacantBeds = []
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

                vacantBeds = allocatedHostel.beds.filter(bed => bed.vacant );

                allocatedBed = vacantBeds[Math.floor(Math.random() * vacantBeds.length)].bed_no;
                console.log("allocatedBed : ", allocatedBed)
                // console.log("\nallocated room ", allocatedRoom, "allocated hostel", allocatedHostel.name, userData[i].name, "vacancy", hos_vacancy-1, "Dept:", userData[i].dept, "\n")

                var deptPath = `dept.${userData[i].dept}.vacancy`;
                dept_vacancy = allocatedHostel.dept.get(userDept).vacancy
                // console.log('Dept vacancy:', dept_vacancy)

                const room_no = map_rooms(allocatedHostel, allocatedBed)

                allocatedData = ({
                    'hostel_name': allocatedHostel.name,
                    'bed_no': allocatedBed,
                    'room_no' : room_no,
                    'status': "approved"
                })

                // console.log(allocatedData)
                
                await Hostel.updateOne(
                    { name: allocatedHostel.name, "beds.bed_no": allocatedBed },
                    {
                        $set: {
                            "vacancy": hos_vacancy-1,
                            "beds.$.vacant": false,
                            "beds.$.student_reg_no": userData[i].reg_no,
                            "beds.$.student_allocated": userData[i].name,
                            [deptPath]: dept_vacancy - 1
                        }
                    }
                );


                await User.updateOne(
                    { _id: userData[i]._id },
                    { $set: { 
                        hostel_allocated: allocatedData,
                        user_allocation_batch: 'present',
                        payment_status: 'NA'
                    } }
                );

                // console.log("Vacancy: ",allocatedHostel.vacancy)
                // console.log("Department vacancy: ", allocatedHostel.dept.get(userDept).vacancy)

                allocatedHostel.vacancy = allocatedHostel.vacancy - 1;
                allocatedHostel.dept.get(userDept).vacancy = allocatedHostel.dept.get(userDept).vacancy-1;
                console.log("Boy's Allocated hostel vac: ",  allocatedHostel.vacancy)
                console.log("Boy's Dept vac: ", allocatedHostel.dept.get(userDept).vacancy)
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

                vacantBeds = allocatedHostel.beds.filter(bed => bed.vacant );
                allocatedBed = vacantBeds[Math.floor(Math.random() * vacantBeds.length)].bed_no;
                // console.log("\n\nallocated room ", allocatedRoom, "allocated hostel", allocatedHostel.name, userData[i].name, "vacancy", hos_vacancy-1, "Dept:", userData[i].dept, "\n")

                deptPath = `dept.${userData[i].dept}.vacancy`;
                dept_vacancy = allocatedHostel.dept.get(userDept).vacancy
                // console.log('Dept vacancy:', dept_vacancy)

                const room_no = map_rooms(allocatedHostel, allocatedBed)

                allocatedData = ({
                    'hostel_name': allocatedHostel.name,
                    'room_no' : room_no,
                    'bed_no': allocatedBed,
                    'status': "approved"
                })

                // console.log(allocatedData)

                await Hostel.updateOne(
                    { name: allocatedHostel.name, "beds.bed_no": allocatedBed },
                    {
                        $set: {
                            "vacancy": hos_vacancy-1,
                            "beds.$.vacant": false,
                            "beds.$.student_reg_no": userData[i].reg_no,
                            "beds.$.student_allocated": userData[i].name,
                            [deptPath]: dept_vacancy - 1
                        }
                    }
                );

                await User.updateOne(
                    { _id: userData[i]._id },
                    { $set: { 
                        hostel_allocated: allocatedData,
                        user_allocation_batch: 'present',
                        payment_status: 'NA'
                    } }
                );

                allocatedHostel.vacancy = allocatedHostel.vacancy - 1;
                allocatedHostel.dept.get(userDept).vacancy = allocatedHostel.dept.get(userDept).vacancy-1;
                // console.log("Girl's Allocated hostel vac: ",  allocatedHostel.vacancy)
                // console.log("Girl's Dept vac: ", allocatedHostel.dept.get(userDept).vacancy)

            }

            allocatedStudents.push(userData[i].reg_no)

        }

        const allocatedStudentData = await User.find({ "user_allocation_batch" : "present" }) 
        const previouslyAllocatedData = await User.find({ "user_allocation_batch" : "past" }) 
        const nonAllocatedStudentData = await User.find({ "hostel_allocated.status" : "rejected" }) 
        res.render('allocated', { present: allocatedStudentData, past: previouslyAllocatedData, rejected: nonAllocatedStudentData, studentData: allocatedStudentData, nonAllocatedStudentData: nonAllocatedStudentData})

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

const allocatedList = async(req, res) => {
    try {
        const allocatedStudentData = await User.find({ "user_allocation_batch" : "present" }) 
        const previouslyAllocatedData = await User.find({ "user_allocation_batch" : "past" }) 
        const nonAllocatedStudentData = await User.find({ "hostel_allocated.status" : "rejected" }) 
       // console.log(nonAllocatedStudentData)
        res.render('allocated', { present: allocatedStudentData, past: previouslyAllocatedData, rejected: nonAllocatedStudentData })
    } catch (error) {
     console.log(error)   
    }
}

const viewRecords = async(req,res) => {
    try {
        const records = await User.find({
            user_created_timestamp: { $ne: null },
            user_vacated_timestamp: { $ne: null }
          });

          res.render('student-records', { data: records });
        
    } catch(error){
        console.log(error)
    }
}

const loadCreateHostelProduct = async(req, res) => {
    try {
        const hostelData = await Hostel.find({"single_seater_id": {$exists:false}})
        res.render('create-hostel-product', {hostels: hostelData})
    } catch (error) {   
        throw new Error(error)
    }
}

const createHostelProduct = async(req,res) => {
    try {
        const product_id = await createPriceForProduct(req.body.name, req.body.description, req.body.amount)
        await Hostel.findOneAndUpdate({ name: req.body.hostel_name },
            {
                $set: {
                    single_seater_id: product_id.id
                }
            })

        res.redirect('/admin/add-hostel-product')
    } catch (error){
        throw new Error(error)
    }
}

const loadLeaves = async(req, res) => {
    try {

        Leave.find({ }, (err, leavesList) => {
            if (err) {
                console.log(err);
                res.send('An error occurred while retrieving leaves.');
            } else {
                leavesList.reverse();
                res.render('leaves', { leavesList: leavesList });
            }
        })
        
    } catch (error) {
        throw new Error(error)
    }
}

const loadWardenData = async (req, res) => {
    try {
        const wardenData = await Warden.find({});

        res.render('warden', {wardens: wardenData})
    } catch (error) {
        throw new Error(error)
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
    randomHostel,
    vacateAll,
    loadApplications,
    allocatedList,
    allocatedRooms,
    viewRecords,
    loadCreateHostelProduct,
    createHostelProduct,
    loadLeaves,
    loadWardenData
}



