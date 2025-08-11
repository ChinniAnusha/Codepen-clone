import React from 'react';
import ReactDOM from 'react-dom/client'; // ✅ use 'react-dom/client' in React 18+
import App from './components/App';
import './index.css'; // Optional styling

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


