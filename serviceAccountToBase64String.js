var fs = require('fs');
fs.readFile( __dirname + '/bazok-dev-service-account.json', function (err, data) {
  if (err) {
    throw err; 
  }
  
  console.log(Buffer.from(data.toString()).toString('base64'));
});