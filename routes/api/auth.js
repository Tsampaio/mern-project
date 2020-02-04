const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

//@route    GET api/auth
//@desc     Test Route
//@access   Public 
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }   
});

//@route    Post api/auth
//@desc     Authenticate user & get token
//@access   Public 
router.post('/', [
    check('email', 'Please include a valdid email').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
        //See if User Exists
        let user = await User.findOne({ email: email});

        if( !user ) {
            return res.status(400).json({ errors: [{msg: 'Invalid Credentials' }] });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) {
            return res.status(400).json({ errors: [{ msg: 'Invalid Credentials'}] });
        }

        //Return jsonwebstoken
        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(
            payload, 
            config.get('jwtSecret'),
            { expiresIn: 360000},
            (error, token) => {
                if(error) throw error;
                res.json({ token });
            }
        );

        //res.send('User Registered');
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;