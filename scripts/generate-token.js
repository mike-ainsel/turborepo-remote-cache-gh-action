import crypto from 'crypto';

// Generate a random token
const token = crypto.randomBytes(32).toString('hex');

console.log('Generated test token:');
console.log(token); 