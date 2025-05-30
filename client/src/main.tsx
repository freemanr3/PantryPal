import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Amplify } from 'aws-amplify';
import awsconfig from './config/aws-exports';

// Initialize AWS Amplify
Amplify.configure(awsconfig);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);