import React from 'react';
import RoomComponent from './RoomComponent';

const App = () => {
  const roomOptions = [
    { id: '1', label: 'Deluxe Room', price: 5000 },
    { id: '2', label: 'Suite', price: 10000 },
  ];

  const handlePaymentComplete = (response) => {
    console.log('Payment successful:', response);
  };

  return (
    <div>
      <h1>Welcome to the Hotel</h1>
      <RoomComponent roomOptions={roomOptions} onPaymentComplete={handlePaymentComplete} />
    </div>
  );
};

export default App;
