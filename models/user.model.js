const mongoose = require("mongoose");
const validator = require("validator");
const config = require("../config/config");
const bcrypt = require('bcryptjs')
// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Complete userSchema, a Mongoose schema for "users" collection
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      validate(value) {
        if (!validator.isEmail(value) || value.toLowerCase() !== value) {
          return false;
        }
      }
    },
    password: {
      type: String,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error(
            "Password must contain at least one letter and one number"
          );
        }
      },
      required: true,
      trim: true,
      minLength: 8
    },
    walletMoney: {
      type: Number,
      required: true,
      default: config.default_wallet_money
    },
    address: {
      type: String,
      default: config.default_address,
      required: false,
      trim: false
    },
  },
  // Create createdAt and updatedAt fields automatically
  {
    timestamps: true,
  }
);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email) {
  const result = await this.findOne({ "email": email });
  return result !== null
};


userSchema.pre('save', async function (next){ 
  try {
   const user = this;
   if(user.isModified('password')){
     const salt = await bcrypt.genSalt(10);
     const hashedPassword = await bcrypt.hash(user.password,salt);
     user.password = hashedPassword;
     next();
   }
   else{
     next()
   }
  } catch (error) {
    next(error);
  }
})


/**
 * 
 * @param {string} password 
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
   return bcrypt.compare(password,this.password);
};

userSchema.methods.hasSetNonDefaultAddress = function () {
  if (this.address === config.default_address) {
    return false;
  }
  return true;
}
// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS
/*
 * Create a Mongoose model out of userSchema and export the model as "User"
 * Note: The model should be accessible in a different module when imported like below
 * const User = require("<user.model file path>").User;
 */
/**
 * @typedef User
 */

const User = mongoose.model("users", userSchema)

module.exports = { User }
