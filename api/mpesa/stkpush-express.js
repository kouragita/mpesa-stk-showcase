import axios from 'axios';

// M-Pesa Configuration
const MPESA_CONFIG = {
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  businessShortCode: process.env.MPESA_SHORTCODE,
  passkey: process.env.MPESA_PASSKEY,
  callbackURL: process.env.MPESA_CALLBACK_URL,
  baseURL: process.env.MPESA_ENV === 'sandbox' 
    ? 'https://sandbox.safaricom.co.ke' 
    : 'https://api.safaricom.co.ke'
};

// Helper functions
async function generateAccessToken() {
  const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString('base64');
  
  const response = await axios.get(
    `${MPESA_CONFIG.baseURL}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: { Authorization: `Basic ${auth}` }
    }
  );
  
  return response.data.access_token;
}

function generatePassword(shortCode, passkey, timestamp) {
  const data = shortCode + passkey + timestamp;
  return Buffer.from(data).toString('base64');
}

function generateTimestamp() {
  const date = new Date();
  return date.getFullYear() +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0') +
    String(date.getHours()).padStart(2, '0') +
    String(date.getMinutes()).padStart(2, '0') +
    String(date.getSeconds()).padStart(2, '0');
}

// STK Push handler
async function stkPushHandler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { phoneNumber, amount, packageName, description } = req.body;

    console.log('🚀 STK Push Request:', { phoneNumber, amount, packageName });

    // Validation
    if (!phoneNumber || !amount || amount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and valid amount are required'
      });
    }

    // Check M-Pesa configuration
    if (!MPESA_CONFIG.consumerKey || !MPESA_CONFIG.consumerSecret) {
      console.error('❌ M-Pesa credentials not configured');
      return res.status(500).json({
        success: false,
        message: 'M-Pesa integration not configured'
      });
    }

    // Format phone number
    let formattedPhone = phoneNumber.toString().replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }

    if (formattedPhone.length !== 12) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }

    console.log(`📱 Formatted phone: ${formattedPhone}`);

    // Generate access token and timestamps
    console.log('🔑 Generating access token...');
    const accessToken = await generateAccessToken();
    const timestamp = generateTimestamp();
    const password = generatePassword(MPESA_CONFIG.businessShortCode, MPESA_CONFIG.passkey, timestamp);

    // Create unique account reference
    const accountReference = `DON-${Date.now()}`;

    // STK Push payload
    const stkPushPayload = {
      BusinessShortCode: MPESA_CONFIG.businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: formattedPhone,
      PartyB: MPESA_CONFIG.businessShortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: MPESA_CONFIG.callbackURL,
      AccountReference: accountReference,
      TransactionDesc: description || `Donation - ${packageName}`
    };

    console.log('📦 STK Push payload created');
    console.log('📡 Sending to M-Pesa...');

    // Send STK Push request
    const response = await axios.post(
      `${MPESA_CONFIG.baseURL}/mpesa/stkpush/v1/processrequest`,
      stkPushPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    console.log('📡 M-Pesa response:', response.data);

    if (response.data.ResponseCode === '0') {
      // Store transaction in database (optional for now)
      const transactionData = {
        checkoutRequestId: response.data.CheckoutRequestID,
        merchantRequestId: response.data.MerchantRequestID,
        phoneNumber: formattedPhone,
        amount: parseInt(amount),
        packageName: packageName || 'Custom',
        description: description || `Donation - ${packageName}`,
        accountReference: accountReference,
        status: 'pending'
      };

      console.log('✅ STK Push successful!');

      res.json({
        success: true,
        message: 'STK push initiated successfully',
        checkoutRequestId: response.data.CheckoutRequestID,
        merchantRequestId: response.data.MerchantRequestID,
        customerMessage: response.data.CustomerMessage
      });
    } else {
      console.error('❌ STK Push failed:', response.data);
      res.status(400).json({
        success: false,
        message: response.data.ResponseDescription || 'STK push failed'
      });
    }

  } catch (error) {
    console.error('❌ STK Push Error:', error.response?.data || error.message);
    const upstream = error.response && error.response.status;
    res.status(upstream ? 502 : 500).json({
      success: false,
      message: upstream
        ? `M-Pesa rejected the request (HTTP ${upstream})`
        : 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export { stkPushHandler };
export default stkPushHandler;
