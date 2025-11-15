const crypto = require('crypto');

module.exports = {
  generateRandomEmail: generateRandomEmail,
  generateRandomPassword: generateRandomPassword,
  captureToken: captureToken
};

function generateRandomEmail(context, ee, next) {
  const randomString = crypto.randomBytes(8).toString('hex');
  context.vars.randomEmail = `user_${randomString}@loadtest.local`;
  console.log(`Generated email: ${context.vars.randomEmail}`);
  return next();
}

function generateRandomPassword(context, ee, next) {
  context.vars.randomPassword = crypto.randomBytes(16).toString('hex');
  console.log(`Generated password hash`);
  return next();
}

function captureToken(context, ee, next) {
  if (context.vars.jwtToken) {
    console.log(`Captured JWT token: ${context.vars.jwtToken.substring(0, 20)}...`);
  }
  return next();
}
