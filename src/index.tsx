import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import FundraiserLogin from './(routes)/fundraiserLogin/FundraiserLogin';
import MerchantLogin from './(routes)/merchantLogin/MerchantLogin';
import Merchant from './(routes)/merchant/Merchant';
import Fundraiser from './(routes)/fundraiser/Fundraiser';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
const router = createBrowserRouter([
  {
    path: '/',
    element: <App/>
  },
  {
    path: '/fundraiserLogin',
    element: <FundraiserLogin/>
  },
  {
    path: '/merchantLogin',
    element: <MerchantLogin/>
  },
  {
    path: '/merchantLogin/:merchantWallet',
    element: <Merchant/>
  },
  {
    path: '/fundraiser',
    element: <Fundraiser/>
  }
])
root.render(
  <React.StrictMode>
     <RouterProvider router = {router}/>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
