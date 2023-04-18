const loadHome = async (req, res) => {
    
    try {
        res.setHeader('Content-Type', 'text/html');
        res.render('index')

    } catch (error) {
        console.log(error.message)
    }
}


module.exports = {
    loadHome
}