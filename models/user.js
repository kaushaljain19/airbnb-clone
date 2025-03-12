const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
}); // We did not add the username and password here because passportLocalMongoose provides with a username and password itself alongwith some methods, that can be added through plugin.

userSchema.plugin(passportLocalMongoose); // The plugin adds fields for username and password to the schema, as well as methods for password hashing, authentication, and other useful functionalities for handling user authentication.

module.exports = mongoose.model("User", userSchema);
