const Joi = require("joi");
const { objectId } = require("./custom.validation");

/**
 * Example url: `/v1/users/:userId`
 * Validate the "userId" url *params* field. "userId" value should be a
 * - string
 * - valid Mongo id -> Use the helper function in src/validations/custom.validation.js
 */
const getUser = {
  params: Joi.object().keys({
    email: Joi.string().custom(objectId)
  }),
};

const putUser = {
  body: Joi.object().keys({
    address: Joi.string().min(20).required()
  })
}


module.exports = {
  getUser,
  putUser
};
