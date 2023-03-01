const express = require("express");
const validate = require("../../middlewares/validate");
const authValidationSchema = require("../../validations/auth.validation");
const authController = require("../../controllers/auth.controller");



const router = express.Router();

// TODO: CRIO_TASK_MODULE_AUTH - Implement "/v1/auth/register" and "/v1/auth/login" routes with request validation
router.post("/register",validate(authValidationSchema.register), authController.register);
router.post("/login", validate(authValidationSchema.login), authController.login);
module.exports = router;
