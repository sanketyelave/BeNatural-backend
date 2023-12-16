
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');


const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Username is required'],
            unique: true,
            // trim: true,
            // minlength: [3, 'Username should be at least 3 characters'],
            // maxlength: [30, 'Username should not exceed 30 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            // trim: true,
            // lowercase: true,
            // match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            // trim: true,
            // minlength: [6, 'Password should be at least 6 characters'],
            // // Include additional password constraints if needed
        },
        cart: {
            type: mongoose.Schema.Types.ObjectId, ref: 'Cart'
        },
        role: {
            type: String,
            required: [true, 'roll is required'],
            unique: true,
        }
    },
    {
        timestamps: true,
    }, { collection: 'User-signup' }
);

// // Hash and salt password before saving to the database
// userSchema.pre('save', async function (next) {
//     const user = this;
//     if (!user.isModified('password')) return next();
//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(user.password, salt);
//     next();
// });

userSchema.plugin(passportLocalMongoose);


const User = mongoose.model('User', userSchema);

module.exports = User;
