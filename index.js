const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const session = require('express-session');
const app = express();
const User = require('./models/user'); // Assuming your model is in a 'models' directory
const Product = require('./models/product');
const Cart = require('./models/cart');
const passport = require('passport');


const PORT = process.env.PORT || 5000;

const corsOptions = {
    origin:  'https://quiet-sunburst-4667c2.netlify.app/',
    credentials: true,
};

app.options('*', cors(corsOptions));
app.use(cors(corsOptions)); // Use cors middleware


// Express session middleware
app.use(session({
    secret: 'your-secret-key', // Replace with a secret key for session management
    resave: false,
    saveUninitialized: true,
}));

app.use(bodyParser.json({ limit: '500mb' })); // Set the limit to match your client-side limit
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));

// ... (rest of your code remains the same)


app.use(bodyParser.json());

app.use(express.static('uploads'));

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://sanket:%23iitbombaycseho@cluster0.nol82qn.mongodb.net/Ecommerce', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Connected to MongoDB Atlas');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB Atlas:', error.message);
    });






// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 50, // Set the limit to 50MB (adjust as needed)
    },
});



const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Permission denied. Only administrators can access this resource.' });
    }
    next();
};


// Route handling for product creation
app.post('/api/products', upload.single('image'), async (req, res) => {
    try {
        const { name, type, price, description, discount, quantity, image, rating } = req.body;
        const imageUrl = req.file ? req.file.path : null;

        const newProduct = new Product({
            name,
            type,
            price,
            discount,
            quantity,
            imageUrl: image,
            description,
            rating,
        })

        await newProduct.save();
        res.status(201).json(newProduct);
        console.log('Product added successfully');
    }

    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.use(express.static('uploads'));

console.log('Server connected and running.');


// Route handling for fetching all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// ... (existing imports)

// Route handling for user registration
app.post('/signup', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        // Create a new user
        const newUser = new User({ username, email, password, role });
        console.log(role)
        // Save user to the database
        await newUser.save();
        // Log in the user (create a session or issue a token)
        req.session.userId = newUser._id; // Assuming your User model has an "_id" field
        console.log(req.session.userId)
        res.status(201).json({ message: 'User registered successfully', userId: newUser._id, username: newUser.username, role: newUser.role, email: newUser.email });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Express route for user login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        //   const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!password == user.password) {
            return res.status(401).json({ message: 'Invalid password or role' });
        }

        // You can customize the response based on your needs
        return res.status(201).json({ message: 'Login successfully', userId: user._id, username: user.username, role: user.role, email: user.email });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.post('/add-to-cart', async (req, res) => {
    try {
        const { quantity, product, usersName } = req.body;
        const extractedUserName = usersName.username;
        const productName = product.name;
        const productQuantity = product.quantity;
        const productID = product._id;

        console.log('Product Quantity:', productQuantity);
        console.log('Selected Quantity:', quantity);

        // Check if the product is already in the cart
        const existingCartItem = await Cart.findOne({
            productId: productID,
            usersName: extractedUserName,
        });

        if (existingCartItem) {
            // If the product is in the cart, update the quantity
            if (productQuantity >= existingCartItem.quantitySelected + quantity) {
                existingCartItem.quantitySelected += quantity;
                await existingCartItem.save();
                res.status(201).json({ message: 'Item quantity updated in the cart successfully' });
            } else {
                res.status(400).json({ error: 'Not enough quantity available' });
            }
        } else {
            // If the product is not in the cart, add it to the cart
            if (productQuantity >= quantity) {
                const newCart = new Cart({
                    quantitySelected: quantity,
                    name: productName,
                    imageUrl: product.imageUrl,
                    type: product.type,
                    price: product.price,
                    usersName: extractedUserName,
                    productId: productID,
                });

                await newCart.save();
                res.status(201).json({ message: 'Item added to the cart successfully' });
            } else {
                res.status(400).json({ error: 'Not enough quantity available' });
            }
        }
    } catch (error) {
        console.error('Error-cart:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});






// Endpoint to update product quantity
app.patch('/api/products/:productId', async (req, res) => {
    try {
        const productId = req.params.productId;
        const { quantity } = req.body;

        // Find the product by ID
        const product = await Product.findById(productId);

        // Update the product quantity
        product.quantity = quantity;

        // Save the updated product
        await product.save();

        res.status(200).json({ message: 'Product quantity updated successfully' });
    } catch (error) {
        console.error('Error updating product quantity:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to get cart data
app.get('/get-cart-data', async (req, res) => {
    try {
        const cartData = await Cart.find();
        res.status(200).json(cartData);
    } catch (error) {
        console.error('Error fetching cart data:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// Update the route handling for removing an item from the cart
app.delete('/remove-from-cart/:cartItemId', async (req, res) => {
    try {
        const cartItemId = req.params.cartItemId;

        // Find the cart item to get product details
        const cartItem = await Cart.findById(cartItemId);

        if (!cartItem) {
            return res.status(404).json({ error: 'Item not found in the cart' });
        }

        // Update the product quantity in the products collection
        const productId = cartItem.productId; // Assuming you store the product ID in the cartItem

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Increment the product quantity by the quantitySelected in the cartItem
        product.quantity += cartItem.quantitySelected;

        // Save the updated product
        await product.save();

        // Remove the item from the cart
        await Cart.deleteOne({ _id: cartItemId });

        res.status(200).json({ message: 'Item removed from the cart successfully' });
    } catch (error) {
        console.error('Error removing item from cart:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});



















