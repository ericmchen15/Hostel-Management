

require('dotenv').config();
const process = require('process');
const stripe_key = process.env.STRIPE_KEY
const stripe = require('stripe')(stripe_key)

const createNewCustomer = async(req, res, next) => {
    try{
        const customer = await stripe.customers.create({
            name: req.body.name,
            email: req.body.email
        })
        res.status(200).send(customer.id)
    }
    catch (error) {
        throw new Error(error)
    }
}

const createPriceForProduct = async (req, res, next) => {

    try {
        const product = await stripe.products.create({
            name: 'Single Seater',
          });

        const price = await stripe.prices.create({
            unit_amount: 400000,
            currency: 'inr',
            product: product.id,
          });

        res.send(price);

    } catch (error){
        throw new Error(error)
    }
}


const createSession = async (req, res, next) => {    
    try {   
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            customer: req.body.customer_id,
            success_url: 'http://127.0.0.1:3000/success',
            cancel_url: 'http://127.0.0.1:3000/cancel',
            line_items: [
                {price: req.body.price_id , quantity: 1},
              ]
          })
        res.send(session)
    } catch (error) {
        throw new Error(error)
    }
    
}


const validateSession = async (req, res, next) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(
            req.body.session_id
          );

        res.send(session);
            

    } catch (error) {
        
    }
}



module.exports = {
    createPriceForProduct,
    createNewCustomer,
    getSucess,
    createSession,
    getCancel,
    createPrice,
    validateSession
}

