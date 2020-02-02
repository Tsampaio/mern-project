const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

//@route    Post api/users
//@desc     Register user
//@access   Public 
router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valdid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
        //See if User Exists
        let user = await User.findOne({ email: email});

        if( user ) {
            return res.status(400).json({ errors: [{msg: 'User Already Exists' }] });
        }

        //Get User Gravatar
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        });

        user = new User({
           name,
           email,
           avatar,
           password 
        });

        //Encrypt Password
        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);

        await user.save();

        //Return jsonwebstoken

        res.send('User Registered');
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
    


  
});

module.exports = router;