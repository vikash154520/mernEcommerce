const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const ApiFeatures = require("../utils/apiFeatures");
const cloudinary = require("cloudinary");

// Create product --Admin
exports.createProduct = catchAsyncError(async (req, res, next) => {
  let images = [];

  if (typeof req.body.images === "string") {
    // single image
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  const imageLinks = [];

  for (let i = 0; i < images.length; i++) {
    const myCloud = await cloudinary.v2.uploader.upload(images[i], {
      folder: "products",
    });

    imageLinks.push({
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    });
  }

  req.body.user = req.user._id;
  req.body.images = imageLinks;

  const product = await Product.create(req.body);

  res.status(200).json({
    success: true,
    product,
  });
});

// get all products
exports.getAllProducts = catchAsyncError(async (req, res, next) => {
  const resultPerPage = 8;
  const productsCount = await Product.countDocuments();

  const apiFeature1 = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter();

  const filteredProducts = await apiFeature1.quary;
  let filteredProductsCount = filteredProducts.length;

  const apiFeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);

  const products = await apiFeature.quary;

  res.status(200).json({
    success: true,
    products,
    productsCount,
    resultPerPage,
    filteredProductsCount,
  });
});

// get all products   -----For admin without filters
exports.getAdminProducts = catchAsyncError(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
});

// Update Product --Admin
exports.updateProduct = catchAsyncError(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  

  if (!product) {
    return next(new ErrorHandler("Product Not Found", 404));
  }

  let images = [];

  if (typeof req.body.images === "string") {
    // single image
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  if (images !== undefined) {
    //Deleting Old Images from cloudinary
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    // Upload New Images in Cloudinary
    const imageLinks = [];

    for (let i = 0; i < images.length; i++) {
      const myCloud = await cloudinary.v2.uploader.upload(images[i], {
        folder: "products",
      });

      imageLinks.push({
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      });
    }
    req.body.images = imageLinks;
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    product,
  });
});

// Delete Product --Admin
exports.deleteProduct = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    if (!product) {
      return next(new ErrorHandler("Product Not Found", 404));
    }
  }

  //Deleting Images from cloudinary
  for (let i = 0; i < product.images.length; i++) {
    await cloudinary.v2.uploader.destroy(product.images[i].public_id);
  }

  product.remove();

  res.status(200).json({
    success: true,
    message: "Product Deleted successfully",
  });
});

// Get Product Details
exports.getProductDetails = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product Not Found", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

// Create New Review or update the review
exports.createProductReview = catchAsyncError(async (req, res, next) => {
  const { rating, comment, productId } = req.body;
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  // Is user reviewed previously or not
  let isReviewed = false;
  product.reviews.forEach((rev) => {
    if (rev.user.toString() === req.user._id.toString()) {
      isReviewed = true;
    }
  });

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString()) {
        rev.rating = Number(rating);
        rev.comment = comment;
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  // set rating
  let sum = 0;
  product.reviews.forEach((rev) => {
    sum = sum + rev.rating;
  });
  product.ratings = sum / product.reviews.length;

  await product.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
});

// Get all reviews of a product
exports.getAllReviews = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHandler("Product Not Found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// Delete review
exports.deleteReview = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHandler("Product Not Found", 404));
  }

  let reviews = [];
  let ratings = 0;
  let numOfReviews = 0;
  product.reviews.forEach((rev) => {
    if (rev._id.toString() !== req.query.reviewId.toString()) {
      reviews.push(rev);
    }
  });

  if (reviews.length !== 0) {
    let sum = 0;
    reviews.forEach((rev) => {
      sum = sum + Number(rev.rating);
    });
    ratings = sum / reviews.length;

    numOfReviews = reviews.length;
  }

  await Product.findByIdAndUpdate(
    req.query.productId,
    { reviews, ratings, numOfReviews },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});
