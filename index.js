const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster05.y936vo3.mongodb.net/?appName=Cluster05`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    await client.connect();
    const db = client.db("pawmartDB");
    const listingsCollection = db.collection("listings");
    const ordersCollection = db.collection("orders");
    const userCollection = db.collection("users");

    app.get("/", (req, res) => {
      res.send("Hello World!");
    });

    // ========== LISTINGS ENDPOINTS ==========

    // Get all listings
    app.get("/api/listings", async (req, res) => {
      const category = req.query.category;
      const query = category ? { category: category } : {};
      const listings = await listingsCollection.find(query).toArray();
      res.send(listings);
    });
    /*  app.get("/listings", async (req, res) => {
      const result = await listingsCollection.find().toArray();
      res.send(result);
    }); */

    // Get recent 6 listings for home page
    app.get("/api/listings/recent", async (req, res) => {
      const result = await listingsCollection
        .find()
        .sort({ date: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });

    // Get listings by category for category page
    app.get("/api/listings/category/:categoryName", async (req, res) => {
      const categoryName = req.params.categoryName;
      const query = { category: categoryName };
      const result = await listingsCollection.find(query).toArray();
      res.send(result);
    });

    // Get single listing by ID
    app.get("/api/listings/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const listing = await listingsCollection.findOne(query);
        if (listing) {
          res.send(listing);
        } else {
          res.status(404).send({ message: "Listing not found" });
        }
      } catch (error) {
        res.status(500).send({ message: "Error fetching listing", error });
      }
    });

    // Get listings by user email
    app.get("/api/my-listings/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await listingsCollection.find(query).toArray();
      res.send(result);
    });

    // Add new listing
    app.post("/api/listings", async (req, res) => {
      const newListings = req.body;
      const result = await listingsCollection.insertOne(newListings);
      res.send(result);
    });

    // Update listing
    app.put("/api/listings/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedListing = req.body;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: updatedListing,
        };
        const result = await listingsCollection.updateOne(filter, updateDoc);
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Error updating listing", error });
      }
    });

    // Delete listing
    app.delete("/api/listings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await listingsCollection.deleteOne(query);
      res.send(result);
    });


    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
