export async function initializePayment(amount) {
  try {
    const response = await fetch('http://localhost:8080/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'INR',
        receipt: 'receipt#1',
        notes: {},
      }),
    });

    const order = await response.json();
    if (order.error) {
      alert('Error: ' + order.error);
      return;
    }

    const options = {
      key: 'rzp_test_ocuXD6Q9Bhb4lq',
      amount: order.amount,
      currency: order.currency,
      name: 'Ratana International Hotel',
      description: 'Test Transaction',
      image: 'PHOTO.png',
      order_id: order.id,
      callback_url: 'http://localhost:8080/payment-success', 
      prefill: {
        name: 'Your Name',
        email: 'your.email@example.com',
        contact: 'Enter Your Phone',
      },
      theme: {
        color: '#3399cc',
      },
      handler: async function (response) {
        alert('Payment success');

        try {
          const verifyResponse = await fetch('http://localhost:8080/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const data = await verifyResponse.json();
          if (data.status === 'ok') {
            // Redirect to the payment success page
            window.location.href = '/payment.html?order_id=' + response.razorpay_order_id;
            console.log(response);
          } else {
            alert('Payment verification failed');
          }
        } catch (error) {
          console.error('Error:', error);
          alert('Error verifying payment');
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (error) {
    console.error('Error initializing payment:', error);
    alert('Error initializing payment');
  }
}
