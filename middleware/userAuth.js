const isLogin = async(req, res, next) =>{

    try {

        if(req.session.user_id && (req.session.role === 0 || req.session.role === 1)){

        }
        else{
            return res.redirect('/login')
        }

        next()
        
    } catch (error) {
        console.log(error.message)
    }

}

const isLogout = async(req, res, next) =>{

    try {

        if(req.session.user_id && (req.session.role === 0 || req.session.role === 1)){
            return res.redirect('/home')
        }
        next()
    } catch (error) {
        console.log(error.message)
    }

}

module.exports = {
    isLogin,
    isLogout
}
