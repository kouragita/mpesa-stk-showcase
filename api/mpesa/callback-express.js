// M-Pesa callback handler
async function callbackHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    console.log('📞 M-Pesa Callback received:', JSON.stringify(req.body, null, 2));

    const { Body } = req.body;
    
    if (Body && Body.stkCallback) {
      const { ResultCode, ResultDesc, CheckoutRequestID, CallbackMetadata } = Body.stkCallback;
      
      console.log(`📋 Callback for: ${CheckoutRequestID}`);
      console.log(`📋 Result Code: ${ResultCode}`);
      console.log(`📋 Result: ${ResultDesc}`);
      
      if (ResultCode === 0) {
        // Payment successful
        console.log('✅ Payment successful for CheckoutRequestID:', CheckoutRequestID);
        
        let paymentDetails = {};
        
        // Extract payment details from CallbackMetadata
        if (CallbackMetadata && CallbackMetadata.Item) {
          CallbackMetadata.Item.forEach(item => {
            paymentDetails[item.Name] = item.Value;
          });
          
          console.log('💰 Payment Details:', paymentDetails);
        }

        // Here you would update your database
        // await updateTransaction(CheckoutRequestID, { status: 'completed', ...paymentDetails });

        console.log('✅ Transaction processed successfully');
        
      } else {
        // Payment failed or cancelled
        console.log('❌ Payment failed:', ResultDesc);
        
        // Here you would update your database
        // await updateTransaction(CheckoutRequestID, { status: 'failed', reason: ResultDesc });
      }
    } else {
      console.log('📞 Callback received but no stkCallback data');
    }

    // Always respond with success to M-Pesa
    res.json({ ResultCode: 0, ResultDesc: 'Success' });

  } catch (error) {
    console.error('❌ Callback Error:', error);
    // Still respond with success to avoid M-Pesa retries
    res.json({ ResultCode: 0, ResultDesc: 'Success' });
  }
}

export { callbackHandler };
export default callbackHandler;
