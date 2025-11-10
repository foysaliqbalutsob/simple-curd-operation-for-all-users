const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();

const port = process.env.PORT || 3000;

// middlewares
app.use(cors());
app.use(express.json());

// SmartDB
// Dq1xWNGdHyL80mkj
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.um9bwdr.mongodb.net/${process.env.DB_NAME}?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const myDB = client.db("Smart_DB");
    const productsCollection = myDB.collection("products");
    const bidCollection = myDB.collection('bid_collection')




    // for products  collection 

    app.post("/products", async (req, res) => {
      const product = req.body;
      console.log("New Product:", product);
      const result = await productsCollection.insertOne(product);
      res.send(result);
    });

    app.get("/products", async (req, res) => {

      console.log(req.query);
      const email = req.query.email;
      const query = {};
      if(email){
        query.email= email
      }
      // const cursor = productsCollection.find().sort({ price_min: -1 });
      const cursor = productsCollection.find(query).sort({ price_min: -1 });
      



      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      // const query = { _id: new ObjectId(id) };
      const query = { _id: id };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });













    app.get('/latestProducts', async(req,res) =>{
      const cursor =productsCollection.find().sort({ created_at: -1 }).limit(6);
      const result = (await cursor.toArray());
      res.send(result);
    })

    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      console.log("Deleting Product ID:", id);
      // const query = { _id: new ObjectId(id) };
      const query = { _id: id };
      const result = await productsCollection.deleteOne(query);

      res.send(result);
    });

    app.patch("/products/:id", async (req, res) => {
      const id = req.params.id;
      const updatedProduct = req.body;
      console.log("updating product id: ", id);
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          name: updatedProduct.name,
          price: updatedProduct.price,
          brand: updatedProduct.brand,
        },
      };
      const result = await productsCollection.updateOne(query, update);
      res.send(result);
    });

// bid operation


app.get("/bids", async (req, res) => {
  const email = req.query.email;
  const query = {}
  if(email){
    query.buyer_email = email;

  }


  const cursor = bidCollection.find(query);
  const result = await cursor.toArray();
  res.send(result);
});





    // fo a particular product 

app.get('/products/bids/:productId',async(req, res) =>{
  const productId = req.params.productId;
  const query= {product: productId};
  const cursor = bidCollection.find(query).sort({bid_price: -1});
  const result = await cursor.toArray();
  res.send(result)
  
})





app.post('/bids', async (req, res)=>{
  const newBid = req.body;
  const result = await bidCollection.insertOne(newBid);
  res.send(result)
});

// DELETE a bid by ID
app.delete("/bids/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await bidCollection.deleteOne(query);
  res.send(result);
});

app.patch("/bids/:id", async (req, res) => {
  const id = req.params.id;
  const updatedBid = req.body; // { bid_price: 1200, status: "confirmed" } etc.
  const query = { _id: new ObjectId(id) };
  const update = { $set: updatedBid };
  const result = await bidCollection.updateOne(query, update);
  res.send(result);
});









    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello smart deal !!!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
