const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://Voya_admin:Jesus9770012@voya-cluster.4hkivwe.mongodb.net/voya?appName=Voya-cluster";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  family: 4
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB! ✅");
  } catch(err) {
    console.log("Error:", err.message);
  } finally {
    await client.close();
  }
}

run();