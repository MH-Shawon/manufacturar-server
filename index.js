const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET)

const {
    MongoClient,
    ServerApiVersion,
    ObjectId
} = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middle ware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dq5st.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
});
// console.log(uri);

async function run() {
    try {
        await client.connect();
        const productsCollection = client.db('powerTools').collection('products');
        const ordersCollection = client.db('powerTools').collection('orders');

        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = productsCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });

        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)
            };
            const product = await productsCollection.findOne(query);
            res.send(product);
        });

        app.post('/orders', async (req, res) => {
            const product = await ordersCollection.insertOne(req.body);
            res.send(product);
        });

        app.get('/payment/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const product = await ordersCollection.findOne(query);
            res.json(product);
        });  
        
        // update order after payment successfull
        app.put('/payment/:id', async (req, res) => {
            const id = req.params.id;
            const payment = req.body;
            const filter = { _id: ObjectId(id) }
            const updateDoc = {
                $set: {
                    payment: payment
                }
            }
            const result = await orderCollection.updateOne(filter, updateDoc)
            res.json(result)
        })
       
         // payment method setup
         app.post('/create-payment-intent', async (req, res) => {
            const paymentInfo = req.body
            const amount = paymentInfo.price * 100
            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                payment_method_types: ['card']
            })
            res.json({ clientSecret: paymentIntent.client_secret })
        })



    } finally {


    }
}

run().catch(console.dir);


app.get('/', async (req, res) => {
    res.send('Running power tools server');
});

app.listen(port, () => {
    console.log('listing to port', port);
});

