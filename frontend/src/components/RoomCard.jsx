import { CreditCard, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import {initializePayment} from '../utils/payment.js';

const roomOptions = [
  { id: 'single', label: 'Single person', price: 599 },
  { id: 'couple', label: 'Couple friendly', price: 499 },
  { id: 'family', label: 'Family', price: 899 },
];

export default function RoomCard() {
  const [selectedAmount, setSelectedAmount] = useState('');

  const handlePayNow = async () => {
    if (!selectedAmount) {
      alert('Please choose a room.');
      return;
    }
    await initializePayment(parseInt(selectedAmount))
  };

  return (
    <div className="w-[300px] overflow-hidden rounded-lg bg-white shadow-lg">
      <img
        src="https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80"
        alt="Luxury Hotel Room"
        className="h-48 w-full object-cover"
      />

      <div className="p-5">
        <h2 className="mb-2 text-2xl font-bold text-gray-800">Luxury Rooms</h2>
        <p className="mb-4 text-gray-600">
          Experience ultimate comfort in our meticulously designed luxury rooms, featuring premium amenities and stunning views.
        </p>
      </div>

      <div className="border-t border-gray-100 p-4">
        <label htmlFor="room-select" className="mb-2 block text-sm font-medium text-gray-700">
          Select Room Type
        </label>
        <select
          id="room-select"
          value={selectedAmount}
          onChange={(e) => setSelectedAmount(e.target.value)}
          className="mb-4 w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Choose Room</option>
          {roomOptions.map((option) => (
            <option key={option.id} value={option.price}>
              {option.label} - ₹{option.price}
            </option>
          ))}
        </select>

        <div className="flex gap-3">
          <button
            onClick={() => alert('Added to cart')}
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-white transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            <ShoppingCart size={20} />
            <span>Add to Cart</span>
          </button>
          <button
            onClick={handlePayNow}
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <CreditCard size={20} />
            <span>Pay Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
