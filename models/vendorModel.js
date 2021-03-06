const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name!"],
  },
  role: {
    type: String,
    enum: ["vendor"],
    default: "vendor",
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same!",
    },
  },
  subscription: {
    type: mongoose.Schema.ObjectId,
    ref: "subscription",
  },
  validSubscription: {
    type: Boolean,
    default: undefined,
  },
});

vendorSchema.pre(/^find/, function (next) {
  this.populate({
    path: "subscription",
  });
  next();
});

vendorSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  if (process.env.NODE_ENV !== "development") {
    this.passwordConfirm = undefined;
  }
  next();
});

vendorSchema.methods.correctPassword = async function (
  candidatePassword,
  vendorPassword
) {
  return await bcrypt.compare(candidatePassword, vendorPassword);
};

const vendor = mongoose.model("vendor", vendorSchema);

module.exports = vendor;
