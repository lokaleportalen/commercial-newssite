// Test Mailgun connection
require('dotenv').config();
const FormData = require('form-data');
const Mailgun = require('mailgun.js');

const mailgun = new Mailgun(FormData);

// Test with EU endpoint
const mgEU = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
  url: 'https://api.eu.mailgun.net'
});

// Test with US endpoint
const mgUS = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
  url: 'https://api.mailgun.net'
});

const domain = process.env.MAILGUN_DOMAIN;

console.log('Testing Mailgun configuration...\n');
console.log('Domain:', domain);
console.log('API Key (first 20 chars):', process.env.MAILGUN_API_KEY?.substring(0, 20) + '...');
console.log('From Email:', process.env.FROM_EMAIL);
console.log('\n---\n');

// Test EU endpoint
console.log('Testing EU endpoint (https://api.eu.mailgun.net)...');
mgEU.domains.get(domain)
  .then(data => {
    console.log('✅ EU endpoint works!');
    console.log('Domain state:', data.state);
    console.log('Sending DNS:', data.sending_dns_records?.length || 0, 'records');
  })
  .catch(error => {
    console.log('❌ EU endpoint failed:', error.message);
    if (error.status === 401) {
      console.log('   Reason: Unauthorized - wrong API key or region');
    }
  })
  .finally(() => {
    console.log('\n---\n');

    // Test US endpoint
    console.log('Testing US endpoint (https://api.mailgun.net)...');
    mgUS.domains.get(domain)
      .then(data => {
        console.log('✅ US endpoint works!');
        console.log('Domain state:', data.state);
        console.log('Sending DNS:', data.sending_dns_records?.length || 0, 'records');
      })
      .catch(error => {
        console.log('❌ US endpoint failed:', error.message);
        if (error.status === 401) {
          console.log('   Reason: Unauthorized - wrong API key or region');
        }
      });
  });
