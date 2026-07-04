const Product = require('../models/Product');
const { deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Create a new product listing
// @route   POST /api/products
// @access  Private (Authenticated)
const createProduct = async (req, res) => {
  const { title, description, price, category, images, hostel, roomNumber } = req.body;

  // 1. Validation
  if (!title || !price || !category) {
    return res.status(400).json({
      status: 'error',
      message: 'Title, price, and category are required fields'
    });
  }

  if (Number(price) <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Price must be greater than 0'
    });
  }

  if (!images || !Array.isArray(images) || images.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide at least one product image'
    });
  }

  try {
    // 2. Autofill hostel and roomNumber from owner profile if not overridden
    const finalHostel = hostel || req.user.hostel;
    const finalRoomNumber = roomNumber || req.user.roomNumber;

    if (!finalHostel || !finalRoomNumber) {
      return res.status(400).json({
        status: 'error',
        message: 'Hostel and room number are required. Please complete onboarding first.'
      });
    }

    const product = await Product.create({
      title,
      description: description || '',
      price: Number(price),
      category,
      images,
      seller: req.user.id,
      hostel: finalHostel,
      roomNumber: finalRoomNumber,
      status: 'Available'
    });

    return res.status(201).json({
      status: 'success',
      message: 'Product listing created successfully',
      product
    });
  } catch (error) {
    console.error('Create Product Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create product listing'
    });
  }
};

// @desc    Get all product listings with pagination, filters and searches
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { category, hostel, search, status, page = 1, limit = 10 } = req.query;

    const query = {};

    // Filter status (default to Available only)
    if (status) {
      query.status = status;
    } else {
      query.status = 'Available';
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by hostel
    if (hostel) {
      query.hostel = hostel;
    }

    // Search by title and description (case-insensitive)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination calculations
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skipNum = (pageNum - 1) * limitNum;

    // Fetch pagination metrics
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limitNum);

    const products = await Product.find(query)
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skipNum)
      .limit(limitNum)
      .populate('seller', 'name profilePic');

    return res.status(200).json({
      status: 'success',
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages,
        totalProducts
      }
    });
  } catch (error) {
    console.error('Get Products Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve product listings'
    });
  }
};

// @desc    Get details of a single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    // Populate seller profile (name, phone/phoneNumber, hostel, roomNumber)
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name phoneNumber hostel roomNumber profilePic');

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    return res.status(200).json({
      status: 'success',
      product
    });
  } catch (error) {
    console.error('Get Product Detail Error:', error);
    // Handle invalid ObjectId formats
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve product details'
    });
  }
};

// @desc    Get all listings created by the logged-in user
// @route   GET /api/products/my-listings
// @access  Private (Authenticated)
const getMyListings = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.id })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      products
    });
  } catch (error) {
    console.error('Get My Listings Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch your product listings'
    });
  }
};

// @desc    Update a product listing
// @route   PUT /api/products/:id
// @access  Private (Owner Only)
const updateProduct = async (req, res) => {
  const { title, description, price, category, images, hostel, roomNumber } = req.body;

  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    // Verify ownership
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized: You are not the owner of this product listing'
      });
    }

    // Validate pricing bounds if provided
    if (price !== undefined && Number(price) <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Price must be greater than 0'
      });
    }

    // Validate images if provided
    if (images !== undefined && (!Array.isArray(images) || images.length === 0)) {
      return res.status(400).json({
        status: 'error',
        message: 'At least one image is required for the product listing'
      });
    }

    // Clean up deleted images from Cloudinary
    if (images && Array.isArray(images)) {
      const oldImages = product.images || [];
      const newImages = images;
      
      // Find URLs in old list that are NOT in the new list
      const removedImages = oldImages.filter(imgUrl => !newImages.includes(imgUrl));
      
      for (const imgUrl of removedImages) {
        try {
          await deleteFromCloudinary(imgUrl);
        } catch (err) {
          console.error(`Failed to delete unreferenced asset ${imgUrl}:`, err.message);
        }
      }
    }

    // Apply updates
    product.title = title || product.title;
    product.description = description !== undefined ? description : product.description;
    product.price = price !== undefined ? Number(price) : product.price;
    product.category = category || product.category;
    product.images = images || product.images;
    product.hostel = hostel || product.hostel;
    product.roomNumber = roomNumber || product.roomNumber;

    const updatedProduct = await product.save();

    return res.status(200).json({
      status: 'success',
      message: 'Product listing updated successfully',
      product: updatedProduct
    });

  } catch (error) {
    console.error('Update Product Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update product listing'
    });
  }
};

// @desc    Delete a product listing
// @route   DELETE /api/products/:id
// @access  Private (Owner Only)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    // Verify ownership
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized: You are not the owner of this product listing'
      });
    }

    // Delete all associated images from Cloudinary
    const images = product.images || [];
    for (const imgUrl of images) {
      try {
        await deleteFromCloudinary(imgUrl);
      } catch (err) {
        console.error(`Failed to delete asset ${imgUrl} on product deletion:`, err.message);
      }
    }

    // Remove product from MongoDB
    await Product.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      status: 'success',
      message: 'Product listing and associated media deleted successfully'
    });
  } catch (error) {
    console.error('Delete Product Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to delete product listing'
    });
  }
};

// @desc    Toggle product status (Available/Sold)
// @route   PATCH /api/products/:id/status
// @access  Private (Owner Only)
const toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    // Verify ownership
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized: You are not the owner of this product listing'
      });
    }

    // Toggle status values
    product.status = product.status === 'Available' ? 'Sold' : 'Available';
    const updatedProduct = await product.save();

    return res.status(200).json({
      status: 'success',
      message: `Product status changed to ${product.status}`,
      product: updatedProduct
    });
  } catch (error) {
    console.error('Toggle Product Status Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to modify listing status'
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  getMyListings,
  updateProduct,
  deleteProduct,
  toggleProductStatus
};
