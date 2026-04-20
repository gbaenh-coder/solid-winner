// ═══════════════════════════════════════════
//  models/User.js
// ═══════════════════════════════════════════
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName:  { type: String, required: true, trim: true },
  lastName:   { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:      { type: String, trim: true },
  password:   { type: String, required: true, minlength: 6 },
  role:       { type: String, enum: ['freelancer', 'client', 'both'], default: 'both' },
  location:   { type: String },
  primarySkill: { type: String },
  bio:        { type: String },
  bookmarks:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  isVerified: { type: Boolean, default: false },
  avatar:     { type: String, default: '' },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Don't return password in responses
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
