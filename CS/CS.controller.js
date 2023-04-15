const csModel = require('./CS.model');
const Appointment = require('./CS.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const razorpay = require('razorpay');
const CS = require('./models');

const razorpayInstance = new razorpay({
  key_id: 'YOUR_RAZORPAY_KEY_ID',
  key_secret: 'YOUR_RAZORPAY_KEY_SECRET',
});

const Booking = require('./CSmodels');

const bookAppointment = async (req, res) => 
{
  try
  {
    const { name, email, phone, amount, order_id } = req.body;
    const booking = new Booking
    ({
      name,
      email,
      phone,
      amount,
      orderId:order_id,
    });

    const savedBooking = await booking.save();
    res.status(201).json({
      message: 'Booking created successfully',
      booking: savedBooking,
    });
  }
  catch (error) 
  {
    console.log(error);
    res.status(500).json({
      message: 'Error creating booking',
    });
  }
};

const confirmPayment = async (req, res) => {
  const { order_id, payment_id, signature } = req.body;

  if (digest !== signature) 
  {
    return res.status(400).json({
      message: 'Invalid signature',
    });
  }
  try 
  {
    const booking = await Booking.findOne({ orderId: order_id });
    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found',
      });
    }
    if (booking.paymentId) {
      return res.status(400).json({
        message: 'Payment already confirmed', 
      });
    }
    booking.paymentId = payment_id;
    const savedBooking = await booking.save();
    res.status(200).json({
      message: 'Payment confirmed successfully',
      booking: savedBooking,
    });
  } catch (error) 
  {
    console.log(error);
    res.status(500).json({
      message: 'Error confirming payment',
    });
  }
};

const createAppointment = async (req , res) => {
  const {clientName, date, time } = req.body;
  const appointment = new Appointment({ clientName, date, time });
  try {
    await appointment.save();
    res.status(201).json({message: 'Appointment created successfully', appointment });
  } catch (error) {
    res.status(400).json({message: 'Error creating appointment', error });
  }
};








exports.bookAppointment = async (req, res) => {
  try {
    // Validate input
    const { clientName, appointmentDate, appointmentTime, amount } = req.body;
    if (!clientName || !appointmentDate || !appointmentTime || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create Razorpay order
    const order = await razorpayInstance.orders.create({
      amount,
      currency: 'INR',
      payment_capture: 1,
    });
    const { id: orderId } = order;

    // Collect payment
    const paymentLink = `https://example.com/pay/${orderId}`; // Replace with your payment page URL
    // Redirect client to payment page

    // Save appointment details to the database
    const cs = new CS({
      name: clientName,
      appointmentDate,
      appointmentTime,
      amount,
    });
    await cs.save();

    // Send confirmation email or SMS to client

    // Notify CS executive
    // Send notification to CS executive

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await csModel.findOne({ email });
  if (!user) {
    return res.status(401).send({ error: 'Invalid credentials' });
  }

  // Validate password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(401).send({ error: 'Invalid credentials' });
  }

  // Generate JWT token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

  // Set token as a cookie and send user info
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'strict',
  });
  res.send({ user });
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.send({ message: 'Logged out successfully' });
};






module.exports = 
{
  bookAppointment,
  confirmPayment,
  createAppointment
};
