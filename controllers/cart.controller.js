const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { cartService } = require("../services");
const ApiError = require("../utils/ApiError");

/**
 * Fetch the cart details
 *
 * Example response:
 * HTTP 200 OK
 * {
 *  "_id": "5f82eebd2b11f6979231653f",
 *  "email": "crio-user@gmail.com",
 *  "cartItems": [
 *      {
 *          "_id": "5f8feede75b0cc037b1bce9d",
 *          "product": {
 *              "_id": "5f71c1ca04c69a5874e9fd45",
 *              "name": "ball",
 *              "category": "Sports",
 *              "rating": 5,
 *              "cost": 20,
 *              "image": "google.com",
 *              "__v": 0
 *          },
 *          "quantity": 2
 *      }
 *  ],
 *  "paymentOption": "PAYMENT_OPTION_DEFAULT",
 *  "__v": 33
 * }
 * 
 *
 */
const getCart = catchAsync(async (req, res) => {
  try {
    const cart = await cartService.getCartByUser(req.user);
    res.json(cart);
  } catch (error) {
    if (error.statusCode === 404) {
      throw new ApiError(error.statusCode, error.message);
    }
    else{
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR,"Internal Server Error");
    }
  }

});

/**
 * Add a product to cart
 *
 *
 */
const addProductToCart = catchAsync(async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await cartService.addProductToCart(req.user,productId,quantity);
    // console.log(cart);
    res.status(httpStatus.CREATED).json(cart);
  } catch (error) {
    if (error.statusCode === 400) {
      throw new ApiError(error.statusCode, error.message);
    }
    else{
      console.log(error);
      throw new ApiError(error.statusCode,error.message);
    }
  }
});

// TODO: CRIO_TASK_MODULE_CART - Implement updateProductInCart()
/**
 * Update product quantity in cart
 * - If updated quantity > 0, 
 * --- update product quantity in user's cart
 * --- return "200 OK" and the updated cart object
 * - If updated quantity == 0, 
 * --- delete the product from user's cart
 * --- return "204 NO CONTENT"
 * 
 * Example responses:
 * HTTP 200 - on successful update
 * HTTP 204 - on successful product deletion
 * 
 *
 */
const updateProductInCart = catchAsync(async (req, res) => {

  try {
    const { productId, quantity } = req.body;
    if(quantity===0){
       await cartService.deleteProductFromCart(req.user,productId);
      return res.sendStatus(httpStatus.NO_CONTENT);
    }
    else{
      const result = await cartService.updateProductInCart(req.user, productId, quantity);
      return res.status(httpStatus.OK).json(result);
    }
  } catch (error) {
    if(error.statusCode===400){
      throw new ApiError(error.statusCode, error.message)
    }
    else{
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR,"Internal Server Error");
    }
  }
});

const checkout = catchAsync(async (req, res) => {
  try {
    const result = await cartService.checkout(req.user);
    res.status(204).json(result);
  } catch (error) {
    if (error.statusCode === 404) {
      throw new ApiError(error.statusCode, error.message);
    }
    else if (error.statusCode === 400) {
      throw new ApiError(error.statusCode, error.message);
    }
    else {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR);
    }
  }
})

module.exports = {
  getCart,
  addProductToCart,
  updateProductInCart,
  checkout,
};
