const httpStatus = require("http-status");
const { Cart, Product } = require("../models");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");
const {User} = require('../models/user.model');

// TODO: CRIO_TASK_MODULE_CART - Implement the Cart service methods

/**
 * Fetches cart for a user
 * - Fetch user's cart from Mongo
 * - If cart doesn't exist, throw ApiError
 * --- status code  - 404 NOT FOUND
 * --- message - "User does not have a cart"
 *
 * @param {User} user
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const getCartByUser = async (user) => {
  try {
    const { email } = user;
    const cart = await Cart.findOne({ "email": email });
    if (!cart) {
      throw new ApiError(httpStatus.NOT_FOUND, "User does not have a cart");
    }
    return cart;
    } catch (error) {
    throw error;
    }
};

/**
 * Adds a new product to cart
 * - Get user's cart object using "Cart" model's findOne() method
 * --- If it doesn't exist, create one
 * --- If cart creation fails, throw ApiError with "500 Internal Server Error" status code
 *
 * - If product to add already in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product already in cart. Use the cart sidebar to update or remove product from cart"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - Otherwise, add product to user's cart
 *
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const addProductToCart = async (user, productId, quantity) => {
     const userCart = await Cart.findOne({"email":user.email});
     if(!userCart){
       await Cart.create(
              {
                "email": user.email,
                "cartItems": [],
                "paymentOption": config.default_payment_option
              })
     }
    const product = await Product.findById(productId);

    if(!product){
      throw new ApiError(httpStatus.BAD_REQUEST, "Product doesn't exist in database");
    }
    const newUserCart = await Cart.findOne({"email":user.email});
    if(!newUserCart){
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR);
    }
    let alreadyExists = false;
     if(newUserCart.cartItems.length>0){
       for(let i =0; i<newUserCart.cartItems.length;i++){
         if(newUserCart.cartItems[i].product._id==productId) {
            alreadyExists=true;
         }
       }
     }
     if(alreadyExists){
          throw new ApiError(httpStatus.BAD_REQUEST, "Product already in cart. Use the cart sidebar to update or remove product from cart");
        }
        newUserCart.cartItems.push( { "product": { ...product }, "quantity": quantity } );
        newUserCart.save();
        return newUserCart;
  }


/**
 * Updates the quantity of an already existing product in cart
 * - Get user's cart object using "Cart" model's findOne() method
 * - If cart doesn't exist, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart. Use POST to create cart and add a product"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * - Otherwise, update the product's quantity in user's cart to the new quantity provided and return the cart object
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const updateProductInCart = async (user, productId, quantity) => {
  try {
    const cartUser = await Cart.findOne({ "email": user.email });
    const product = await Product.findOne({ "_id": productId })
    if (!cartUser) {
      throw new ApiError(httpStatus.BAD_REQUEST, "User does not have a cart");
    }  
    if (!product) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Product doesn't exist in database");
    }
    let productInCart = false;
    for(let i =0; i<cartUser.cartItems.length;i++){
      if(cartUser.cartItems[i].product._id.toString()===productId.toString()){
        productInCart=true;
      }
    }
    if (!productInCart) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Product not in cart");
    }
      cartUser.cartItems.forEach((item,index)=>{
        if(cartUser.cartItems[index].product._id.toString() === productId.toString()){
           cartUser.cartItems[index].quantity=quantity;
        }
      })
      await cartUser.save(); 
      return cartUser;
  } catch (error) {
    throw error;
  }
  
};

/**
 * Deletes an already existing product in cart
 * - If cart doesn't exist for user, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * Otherwise, remove the product from user's cart
 *
 *
 * @param {User} user
 * @param {string} productId
 * @throws {ApiError}
 */
const deleteProductFromCart = async (user, productId) => {
    const cartUser = await Cart.findOne({"email":user.email});
    if(!cartUser){
      throw new ApiError(httpStatus.BAD_REQUEST,"User does not have a cart")
    }
    let productInCart = false;
    for(let i =0; i<cartUser.cartItems.length;i++){
      if(cartUser.cartItems[i].product._id.toString()===productId.toString()){
        productInCart = true;
      }
    }
    if(!productInCart){
      throw new ApiError(httpStatus.BAD_REQUEST,"Product not in cart");
    }
      cartUser.cartItems.forEach((item,index)=>{
        if(cartUser.cartItems[index].product._id.toString() === productId.toString()){
           cartUser.cartItems.splice(index,1);
        }
      })
      return cartUser.save();
};

const checkout = async (user) => {
  const userCart = await Cart.findOne({ "email": user.email });
  const walletMoney = user.walletMoney;
    if (!userCart) {
    throw new ApiError(httpStatus.NOT_FOUND, "User does not have a cart");
  }
  const cartItemsLength = userCart.cartItems.length;
    if (cartItemsLength === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST,"No products found in user cart");
  }
  const nonDefaultAddress = user.hasSetNonDefaultAddress();
  if (!nonDefaultAddress) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No address found");
  }
  let totalAmount = 0;
  userCart.cartItems.forEach((item) => {
    const price = item.product.cost;
    const quantity = item.quantity;
    const productPrice = price * quantity;
    totalAmount = totalAmount + productPrice;
  })
  const updatedWalletMoney = walletMoney - totalAmount;
  if (updatedWalletMoney < 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Insufficient funds");
  }
  user.walletMoney = updatedWalletMoney;
  userCart.cartItems = [];
  await user.save();
  await userCart.save();
}

module.exports = {
  getCartByUser,
  addProductToCart,
  updateProductInCart,
  deleteProductFromCart,
  checkout,
};
