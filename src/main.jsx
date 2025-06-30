import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './Router';
import './index.css';
import { appname } from '../src/api/config'; // adjust path as needed
import { ProfileProvider } from './scenes/provider/profile_context';

// Set document title
document.title = appname;

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ProfileProvider>
              <AppRouter />
        </ProfileProvider>
      
    </React.StrictMode>
);