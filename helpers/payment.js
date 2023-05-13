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
        return(customer.id)
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
            unit_amount: amount*100,
            currency: 'inr',
            product: product.id,
          });

        return price

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
            success_url: 'http://127.0.0.1:3000/payment-success',
            cancel_url: 'https://www.yahoo.com',
            line_items: [
                {price: price_id , quantity: 1},
              ]
          })
        return session
    } catch (error) {
        throw new Error(error)
    }
    
}


const validateSession = async (session_id) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(
            session_id
          );

          console.log(session)
        return(session.payment_status);
    } catch (error) {
        throw new Error(error)
    }
}



module.exports = {
    createPriceForProduct,
    createNewCustomer,
    createSession,
    validateSession
}

