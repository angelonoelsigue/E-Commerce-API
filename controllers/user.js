const bcrypt = require('bcrypt');
const User = require('../models/User');
const auth = require('../auth');
const { errorHandler } = require('../auth');

// User registration
module.exports.registerUser = (req, res) => {
  // Checks if the email is in the right format
  if (!req.body.email.includes("@")) {
    return res.status(400).send({ error: 'Invalid Email' });
  }
  // Checks if the mobile number has the correct number of characters
  if (req.body.mobileNo.length !== 11) {
    return res.status(400).send({ error: 'Mobile number invalid' });
  }
  // Checks if the password has at least 8 characters
  else if (req.body.password.length < 8) {
    return res.status(400).send({ error: 'Password must be at least 8 characters' });
  } else {
    // Check if user already exists
    User.findOne({ email: req.body.email })
    .then(existingUser => {
      if (existingUser) {
        return res.status(400).send({ error: 'User already exists' });
      }

        // Create new user
      let newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        mobileNo: req.body.mobileNo,
        password: bcrypt.hashSync(req.body.password, 10)
      });

      return newUser.save();
    })
    .then(() => {
      res.status(201).send({ message: 'Registered Successfully' });
    })
    .catch(error => {
      errorHandler(error, req, res);
    });
  }
};

// User login
module.exports.loginUser = (req, res) => {
  let { email, password } = req.body;

  if (!email.includes("@") || !email.includes(".")) {
    return res.status(400).send({message:'Invalid Email'});
  }

  User.findOne({ email })
  .then(user => {
    if (!user) {
      return res.status(404).send({message:'No Email found'});
    }

    const isPasswordCorrect = bcrypt.compareSync(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).send({message: 'Email and password do not match'});
    }

    return res.status(200).send({ access: auth.createAccessToken(user) });
  })
  .catch(error => errorHandler(error, req, res));
};

// Retrieve User Details
module.exports.getUserDetails = (req, res) => {
  User.findById(req.user.id)
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: 'User not found' });
      }
      user.password = "";
      res.status(200).send({user: user});
    })
    .catch(error => errorHandler(error, req, res));
};

// Update User as Admin
module.exports.setAsAdmin = (req, res) => {
  User.findByIdAndUpdate(req.params.id, { isAdmin: true }, { new: true })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: 'User not found' });
      }
      res.status(200).send({ updatedUser: user });
    })
    .catch(error => {
      if (error.name === 'CastError' && error.kind === 'ObjectId') {
        res.status(500).send({
          error: 'Failed in Find',
          details: {
            stringValue: error.stringValue,
            valueType: error.valueType,
            kind: error.kind,
            value: error.value,
            path: error.path,
            reason: error.reason,
            name: error.name,
            message: error.message
          }
        });
      } else {
        errorHandler(error, req, res);
      }
    });
};


// Update Password
module.exports.updatePassword = (req, res) => {
  const { newPassword } = req.body;

  if (newPassword.length < 8) {
    return res.status(400).send({ message: 'Password must be at least 8 characters long' });
  }

  const hashedPassword = bcrypt.hashSync(newPassword, 10);

  User.findByIdAndUpdate(req.user.id, { password: hashedPassword }, { new: true })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: 'User not found' });
      }
      res.status(201).send({ success: true, message: 'Password updated successfully' });
    })
    .catch(error => errorHandler(error, req, res));
};

module.exports.updateProfile = (req, res) => {
  const { firstName, lastName, email, mobileNo } = req.body;
  const userId = req.user.id; // Retrieve the user ID from the authenticated request

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email regex
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email format.' });
  }

  // Validate mobile number format (11 numeric characters)
  const mobileRegex = /^[0-9]{11}$/;
  if (!mobileRegex.test(mobileNo)) {
    return res.status(400).json({ success: false, message: 'Invalid mobile number format. It must be 11 digits.' });
  }

  // Find the user and compare current data
  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      // Check if data is already up-to-date
      if (
        user.firstName === firstName &&
        user.lastName === lastName &&
        user.email === email &&
        user.mobileNo === mobileNo
      ) {
        return res.status(400).json({ success: false, message: 'No changes detected. Profile is already up-to-date.' });
      }

      // Proceed with the update if validation passes and data has changed
      return User.findByIdAndUpdate(
        userId,
        { firstName, lastName, email, mobileNo },
        { new: true } // Return the updated user object
      )
        .then((updatedUser) => {
          res.status(200).json({
            success: true,
            message: 'Profile updated successfully.',
            user: updatedUser,
          });
        })
        .catch((error) => {
          console.error('Error updating profile:', error);
          res.status(500).json({ success: false, message: 'Internal server error.' });
        });
    })
    .catch((error) => {
      console.error('Error fetching user:', error);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    });
};