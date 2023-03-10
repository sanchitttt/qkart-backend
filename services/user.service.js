const  {User} = require("../models");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const bcrypt = require("bcryptjs");

/**
 * Get User by id
 * - Fetch user object from Mongo using the "_id" field and return user object
 * @param {String} id
 * @returns {Promise<User>}
 */

const getUserById = async (id) => {
    try {
        const user = await User.findById(id);
        if (!user) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Bad request - Invalid user id");
        }
        return user;
    } catch (error) {
        throw error;
    }
}

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement getUserByEmail(email)
/**
 * Get user by email
 * - Fetch user object from Mongo using the "email" field and return user object
 * @param {string} email
 * @returns {Promise<User>}
 */

const getUserByEmail = async (email) => {
        const result = await User.findOne({ "email": email });
        return result;
}

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement createUser(user)
/**
 * Create a user
 *  - check if the user with the email already exists using `User.isEmailTaken()` method
 *  - If so throw an error using the `ApiError` class. Pass two arguments to the constructor,
 *    1. “200 OK status code using `http-status` library
 *    2. An error message, “Email already taken”
 *  - Otherwise, create and return a new User object
 *
 * @param {Object} userBody
 * @returns {Promise<User>}
 * @throws {ApiError}
 *
 * userBody example:
 * {
 *  "name": "crio-users",
 *  "email": "crio-user@gmail.com",
 *  "password": "usersPasswordHashed"
 * }
 *
 * 200 status code on duplicate email - https://stackoverflow.com/a/53144807
 */

    const createUser = async (userBody) => {
        try {
            const isEmailTaken = await User.isEmailTaken(userBody.email)
            if(isEmailTaken){
                throw new ApiError(httpStatus.OK, "Email already taken");
            }
            else{
                const newUser = await User.create(userBody);
                return newUser;
            }
        } catch (error) {
            throw error;
        }
    }

    const getUserAddressById = async (id) => {
        try {
            const addressResult = await User.findOne({"_id":id}, {address:1,email:1})
            return addressResult;
        } catch (error) {
            throw error;
        }

    }

    const setAddress = async (id,address) => {
        try {
            const user = await User.findOne({"_id":id});
            if(!user){
                throw new ApiError(httpStatus.BAD_REQUEST, "Bad request - Invalid user id");
            }
             await User.updateOne({"_id":id}, {address:address});
            return User.findOne({"_id":id}, {address:1, email:1});
        } 
        catch (error) {
           throw error;
    }
}



module.exports = {getUserById,getUserByEmail,createUser,getUserAddressById,setAddress};

