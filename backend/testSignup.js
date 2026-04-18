const fetch = require('node-fetch');

// Test signup functionality
async function testSignup() {
  try {
    console.log('Testing signup API...');
    
    const userData = {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123'
    };
    
    console.log('Sending signup request with data:', userData);
    
    const response = await fetch('http://localhost:3000/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    console.log('Signup response:', data);
    
    return data;
  } catch (error) {
    console.error('Error testing signup:', error);
  }
}

// Execute the test
testSignup();
