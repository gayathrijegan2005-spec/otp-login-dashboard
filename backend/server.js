require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();

app.use(cors());
app.use(bodyParser.json());

let generatedOTP = '';

// MAIL CONFIG
const transporter = nodemailer.createTransport({

  service: 'gmail',

  auth: {

    user: process.env.EMAIL_USER,

    pass: process.env.EMAIL_PASS
  }
});

// SEND OTP
app.post('/send-otp', async (req, res) => {

  const email = req.body.email;

  generatedOTP =
    Math.floor(1000 + Math.random() * 9000).toString();

  const mailOptions = {

    from: process.env.EMAIL_USER,

    to: email,

    subject: 'OTP Verification',

    text:
      `Your OTP is ${generatedOTP}`
  };

  try {

    await transporter.sendMail(mailOptions);

    res.json({

      success: true,

      message:
        'OTP sent successfully'
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message:
        'Failed to send OTP'
    });
  }
});

// VERIFY OTP
app.post('/verify-otp', (req, res) => {

  const enteredOTP = req.body.otp;

  if (enteredOTP === generatedOTP) {

    res.json({
      success: true
    });

  } else {

    res.json({
      success: false
    });
  }
});

// SERVER
app.listen(5000, () => {

  console.log(
    'Server running on port 5000'
  );
});