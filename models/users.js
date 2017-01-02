var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

// user data model
var userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        unique: true,
        required: true
    },
    userImage: {type: String},
    active: {type: Boolean, default: false},
    verifyToken: {type: String},
    todoid: {type: mongoose.Schema.Types.ObjectId, ref: 'To-Do'},
    community: {type: mongoose.Schema.Types.ObjectId, ref: 'Community'}, // _id of community that user is part of
    prevCommunity: {type: mongoose.Schema.Types.ObjectId, ref: 'Community'}, // we need to store previous community when switching between test -> real community
    recovery: {type: String},
    registeredOn: {type: Date, default: Date.now},
    hash: String,
    salt: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    stripeCustomer: {type: String},
    stripeSubscription: {type: String}
});

userSchema.methods.setPassword = function(password) {
    // create a random string for salt
    this.salt = crypto.randomBytes(16).toString('hex');
    // create encrypted hash

    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha1').toString('hex');
};

userSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha1').toString('hex');
    return this.hash === hash;
};

userSchema.methods.generateJwt = function() {
    var expiry = new Date();
    // will have the locally saved JWT expire after 7 days
    expiry.setDate(expiry.getDate() + 7);

    // call jwt.sign method and return what it returns
    return jwt.sign({
        // pass payload to method
        _id: this._id,
        email: this.email,
        name: this.name,
        todoid: this.todoid,
        // include expiration as unix time in seconds
        exp: parseInt(expiry.getTime() / 1000),
        // send secret for hashing algorithim to use
        // JWT_SECRET is defined in .env file in root (included in .gitignore)
    }, process.env.JWT_SECRET); // DO NOT KEEP YOUR SECRET IN THE CODE!
};

// export mongoose model
mongoose.model('User', userSchema);
