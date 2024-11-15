import Register from "../models/registerModel.js";
import { getSession } from './sessionService.js'; // Make sure you have a method to get the session

export const RegisterController = async (req, res) => {
  const shop = req.query.shop; // Get shop parameter from query

  // Validate session
  const session = await getSession(shop); // Retrieve the session using your session management
  if (!session || !session.accessToken) {
    return res.redirect(`/api/auth?shop=${shop}`); // Redirect to auth if session is invalid
  }

  const {
    storename,
    ownername,
    email,
    phone,
    category,
    street,
    pincode,
    state,
    country,
    website,
    city,
    additional,
    agreeToPrivacyPolicy
  } = req.body;

  try {
    const existingUser = await Register.findOne({ email }); 
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const newRegister = new Register({ 
      storename,
      ownername,
      email,
      phone,
      category,
      street,
      pincode,
      state,
      country,
      website,
      city,
      additional,
      agreeToPrivacyPolicy
    });

    await newRegister.save();
    res.status(201).json({ message: 'Registration saved successfully!' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export default RegisterController;
