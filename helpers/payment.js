require('dotenv').config();
const process = require('process');
const stripe_key = process.env.STRIPE_KEY
const stripe = require('stripe')(stripe_key)

const createNewCustomer = async(name, email) => {
    try{
        const customer = await stripe.customers.create({
            name: name,
            email: email
        })
        res.status(200).send(customer.id)
    }
    catch (error) {
        throw new Error(error)
    }
}

const createPriceForProduct = async (name, description, amount) => {

    try {
        const product = await stripe.products.create({
            name: name,
            description: description
          });

        const price = await stripe.prices.create({
            unit_amount: amount,
            currency: 'inr',
            product: product.id,
          });

        res.send(price);

    } catch (error){
        throw new Error(error)
    }
}


const createSession = async (customer_id, price_id) => {    
    try {   
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            customer: customer_id,
            success_url: 'google.com',
            cancel_url: 'yahoo.com',
            line_items: [
                {price: price_id , quantity: 1},
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
    createSession,
    validateSession
}

