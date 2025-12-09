const crypto = require('crypto');

function generateSignature(payload, passphrase) {
  const keys = Object.keys(payload).filter(k => payload[k] !== undefined && payload[k] !== null && payload[k] !== '');
  keys.sort();
  const arr = keys.map(k => `${k}=${payload[k]}`);
  let str = arr.join('&');
  if (passphrase) str += `&passphrase=${passphrase}`;
  return crypto.createHash('md5').update(str).digest('hex');
}

function payfastBase() {
  if ((process.env.PAYFAST_ENV || 'sandbox') === 'production') {
    return 'https://www.payfast.co.za/eng/process';
  }
  return 'https://sandbox.payfast.co.za/eng/process';
}

module.exports = { generateSignature, payfastBase };
