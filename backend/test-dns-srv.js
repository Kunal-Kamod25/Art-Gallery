const dns = require('dns').promises;

dns.resolveSrv('_mongodb._tcp.artgallery.5rloohg.mongodb.net')
  .then(records => {
    console.log('✅ SRV records:');
    console.log(records);
  })
  .catch(err => {
    console.error('❌ SRV lookup failed');
    console.error(err);
  });
