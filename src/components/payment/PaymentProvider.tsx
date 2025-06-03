import React from 'react'
import { Elements } from '@stripe/stripe-react-js'
import { loadStripe } from '@stripe/stripe-js'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'

interface PaymentProviderProps {
  children: React.ReactNode
}

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY!)

const paypalInitialOptions = {
  'client-id': process.env.REACT_APP_PAYPAL_CLIENT_ID!,
  currency: 'USD',
  intent: 'capture'
}

const PaymentProvider: React.FC<PaymentProviderProps> = ({ children }) => {
  return (
    <PayPalScriptProvider options={paypalInitialOptions}>
      <Elements stripe={stripePromise}>
        {children}
      </Elements>
    </PayPalScriptProvider>
  )
}

export default PaymentProvider 