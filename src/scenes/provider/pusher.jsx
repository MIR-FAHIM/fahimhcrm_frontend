// provider/pusher.jsx
import Pusher from 'pusher-js';

// ✅ Set your actual credentials
const pusher = new Pusher('0aa411a89bab9964a823', {
  cluster: 'ap2',
  encrypted: true,
});

export default pusher;
