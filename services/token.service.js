const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { tokenTypes } = require("../config/tokens");

/**
 * Generate jwt token
 * - Payload must contain fields
 * --- "sub": `userId` parameter
 * --- "type": `type` parameter
 *
 * - Token expiration must be set to the value of `expires` parameter
 *
 * @param {ObjectId} userId - Mongo user id
 * @param {Number} expires - Token expiration time in seconds since unix epoch
 * @param {string} type - Access token type eg: Access, Refresh
 * @param {string} [secret] - Secret key to sign the token, defaults to config.jwt.secret
 * @returns {string}
 */
const generateToken = (userId, expires, type, secret = config.jwt.secret) => {
    try {
      const payLoad = { "userId": userId, "type": type, "exp": expires };
      const token = jwt.sign(payLoad,secret);
      return token;
    } catch (error) {
      throw error;
    }
};

/**
 * Generate auth token
 * - Generate jwt token
 * - Token type should be "ACCESS"
 * - Return token and expiry date in required format
 *
 * @param {User} user
 * @returns {Promise<Object>}
 *
 * Example response:
 * "access": {
 *          "token": "eyJhbGciOiJIUzI1NiIs...",
 *          "expires": "2021-01-30T13:51:19.036Z"
 * }
 */
const generateAuthTokens =  (userId) => {
  const payLoad = userId;
  const expires= config.jwt.accessExpirationMinutes;
  const type= tokenTypes.ACCESS;
  const token = generateToken(payLoad,Math.floor(Date.now() / 1000) + config.jwt.accessExpirationMinutes * 60,type);
  let currentDate = new Date();
  currentDate.setSeconds(currentDate.getSeconds() + expires);
  let currentDateISO = currentDate.toISOString();
  const resultDate = new Date(currentDateISO);
  const result = 
  { "access":
   {
    "token":token,
    "expires":resultDate
   }
 }
  return result;
};

module.exports = {
  generateToken,
  generateAuthTokens,
};
