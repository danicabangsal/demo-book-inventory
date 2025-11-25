const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;

// middlewear
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// mongodb confiq here
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  "mongodb+srv://mern-bookstore:d0YDqpMxXNJ7xXKC@mern-bookstore-db.ktrosgj.mongodb.net/?appName=mern-bookstore-db";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Connect to MongoDB
let bookCollections;
let isConnected = false;

async function connectDB() {
  if (isConnected && bookCollections) {
    return bookCollections;
  }

  try {
    await client.connect();
    bookCollections = client.db("bookInventory").collection("Books");
    isConnected = true;
    console.log("Connected to MongoDB!");
    return bookCollections;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

// insert a book to db: Post Method
app.post("/upload-book", async (req, res) => {
  try {
    await connectDB();
    const data = req.body;
    const result = await bookCollections.insertOne(data);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// get all books & find by a category from db
app.get("/all-books", async (req, res) => {
  try {
    await connectDB();
    let query = {};
    if (req.query?.category) {
      query = { category: req.query.category };
    }
    const result = await bookCollections.find(query).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// update a books method
app.patch("/book/:id", async (req, res) => {
  try {
    await connectDB();
    const id = req.params.id;
    const updateBookData = req.body;
    const filter = { _id: new ObjectId(id) };
    const updatedDoc = {
      $set: {
        ...updateBookData,
      },
    };
    const options = { upsert: true };

    // update now
    const result = await bookCollections.updateOne(filter, updatedDoc, options);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// delete a item from db
app.delete("/book/:id", async (req, res) => {
  try {
    await connectDB();
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const result = await bookCollections.deleteOne(filter);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// get a single book data
app.get("/book/:id", async (req, res) => {
  try {
    await connectDB();
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const result = await bookCollections.findOne(filter);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Only start server if not in serverless environment
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}

// Export for Vercel
module.exports = app;
