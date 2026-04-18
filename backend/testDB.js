const mongoose = require('mongoose');

// Connect directly to MongoDB for testing
mongoose.connect('mongodb://localhost:27017/speech')
  .then(() => {
    console.log('Connected to MongoDB for testing');
    testDatabaseAccess();
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Function to test if we can access the database
async function testDatabaseAccess() {
  try {
    // Try to list collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:');
    collections.forEach(collection => {
      console.log('- ' + collection.name);
    });

    // Check if the users collection exists
    const userCollectionExists = collections.some(collection => collection.name === 'users');
    console.log('Users collection exists:', userCollectionExists);

    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error testing database access:', error);
  }
}
