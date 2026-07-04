const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a product title'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    enum: {
      values: [
        'Grocery',
        'Maggi & Snacks',
        'Stationery',
        'Books',
        'Electronics',
        'Furniture',
        'Kitchen Items',
        'Sports',
        'Rent',
        'Others'
      ],
      message: '{VALUE} is not a supported category'
    },
    required: [true, 'Please specify a category']
  },
  images: {
    type: [String],
    default: []
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please specify the seller']
  },
  hostel: {
    type: String,
    required: [true, 'Please specify the hostel for the item location'],
    trim: true
  },
  roomNumber: {
    type: String,
    required: [true, 'Please specify the seller room number'],
    trim: true
  },
  status: {
    type: String,
    enum: ['Available', 'Sold'],
    default: 'Available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index on hostel and category for fast filtering
ProductSchema.index({ hostel: 1, category: 1 });

module.exports = mongoose.model('Product', ProductSchema);
