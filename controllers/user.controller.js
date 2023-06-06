const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { userService } = require("../services");

/**
 * Get user details
 *  - Use service layer to get User data
 * 
 *  - If query param, "q" equals "address", return only the address field of the user
 *  - Else,
 *  - Return the whole user object fetched from Mongo

 *  - If data exists for the provided "userId", return 200 status code and the object
 *  - If data doesn't exist, throw an error using `ApiError` class
 *    - Status code should be "404 NOT FOUND"
 *    - Error message, "User not found"
 *  - If the user whose token is provided and user whose data to be fetched don't match, throw `ApiError`
 *    - Status code should be "403 FORBIDDEN"
 *    - Error message, "User not found"
 *
 * 
 * Request url - <workspace-ip>:8082/v1/users/6010008e6c3477697e8eaba3
 * Response - 
 * {
 *     "walletMoney": 500,
 *     "address": "ADDRESS_NOT_SET",
 *     "_id": "6010008e6c3477697e8eaba3",
 *     "name": "crio-users",
 *     "email": "crio-user@gmail.com",
 *     "password": "criouser123",
 *     "createdAt": "2021-01-26T11:44:14.544Z",
 *     "updatedAt": "2021-01-26T11:44:14.544Z",
 *     "__v": 0
 * }
 * 
 * Request url - <workspace-ip>:8082/v1/users/6010008e6c3477697e8eaba3?q=address
 * Response - 
 * {
 *   "address": "ADDRESS_NOT_SET"
 * }
 * 
 *
 * Example response status codes:
 * HTTP 200 - If request successfully completes
 * HTTP 403 - If request data doesn't match that of authenticated user
 * HTTP 404 - If user entity not found in DB
 * 
 * @returns {User | {address: String}}
 *
 */
const getUser = catchAsync(async (request, response) => {
  try {
    const { q } = request.query;
    const { userId } = request.params;
    if (q) {
      const { email } = request.user;
      const user = await userService.getUserById(userId);
      const result = await userService.getUserAddressById(userId);
      const { address } = result;
      if (email !== user.email) {
        response.sendStatus(403)
      }
      response.json({ "address": address });
    }
    else {
      const { userId } = request.params;
      const { email } = request.user;
      const result = await userService.getUserById(userId);
      if (email !== result.email) {
        response.sendStatus(403)
      }
      else {
        response.json(result);
      }
    }


  } catch (error) {
    if (error.statusCode === 400) {
      throw new ApiError(error.statusCode, error.message)
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR)
  }
});

const setAddress = async (req, res) => {
  try {
    const { userId } = req.params;
    const { address } = req.body;
    const result = await userService.setAddress(userId, address);
    res.status(httpStatus.OK).json(result);
  }
  catch (error) {
    if (error.statusCode === 400) {
      throw new ApiError(error.statusCode, error.message);
    }
    else {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error");
    }
  }

}

const getUserAddress = async (req, res) => {
  try {
    res.json({ "address": req.user.address })
  }
  catch (error) {
  }
}

const addAddress = async (req, res) => {
  try {
    const { newAddress } = req.body;
    await userService.addAddress(req.user._id, newAddress);
    res.end();
  }
  catch (error) {
  }
}

const deleteAddress = async (req, res) => {
  try {
    const { index } = req.params;
    await userService.deleteAddress(req.user._id, index);
    res.end();
  }
  catch (error) {
  }
}

module.exports = {
  getUser,
  setAddress,
  getUserAddress,
  addAddress,
  deleteAddress
};
