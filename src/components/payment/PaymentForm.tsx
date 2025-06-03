import React, { useState } from 'react'
import { useStripe, useElements, CardElement } from '@stripe/stripe-react-js'
import { PayPalButtons } from '@paypal/react-paypal-js'
import { useAuth } from '../../contexts/AuthContext'
import paymentService from '../../services/paymentService'
import { Alert, Button, Card, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import { styled } from '@mui/material/styles'

interface PaymentFormProps {
  amount: number
  currency: string
  campaignId: string
  description: string
  onSuccess: () => void
  onError: (error: Error) => void
}

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2)
}))

const PaymentMethodSelect = styled(FormControl)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  minWidth: 200
}))

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  currency,
  campaignId,
  description,
  onSuccess,
  onError
}) => {
  const { user } = useAuth()
  const stripe = useStripe()
  const elements = useElements()
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'netopia'>('stripe')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePaymentMethodChange = (event: any) => {
    setPaymentMethod(event.target.value)
    setError(null)
  }

  const handleStripeSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!stripe || !elements || !user) {
      return
    }

    setProcessing(true)
    setError(null)

    try {
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) throw new Error('Card element not found')

      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement
      })

      if (stripeError) {
        throw new Error(stripeError.message)
      }

      const result = await paymentService.processPayment('stripe', {
        amount,
        currency,
        description,
        campaignId,
        donorId: user.uid,
        donorEmail: user.email || '',
        donorName: user.displayName || user.email || '',
        metadata: {
          paymentMethodId: paymentMethod.id
        }
      }, paymentMethod)

      if (result.success) {
        onSuccess()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Payment failed')
      onError(error instanceof Error ? error : new Error('Payment failed'))
    } finally {
      setProcessing(false)
    }
  }

  const handlePayPalApprove = async (data: any) => {
    setProcessing(true)
    setError(null)

    try {
      if (!user) throw new Error('User not authenticated')

      const result = await paymentService.processPayment('paypal', {
        amount,
        currency,
        description,
        campaignId,
        donorId: user.uid,
        donorEmail: user.email || '',
        donorName: user.displayName || user.email || '',
        metadata: {
          paypalOrderId: data.orderID
        }
      })

      if (result.success) {
        onSuccess()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'PayPal payment failed')
      onError(error instanceof Error ? error : new Error('PayPal payment failed'))
    } finally {
      setProcessing(false)
    }
  }

  const handleNetopiaPayment = async () => {
    setProcessing(true)
    setError(null)

    try {
      if (!user) throw new Error('User not authenticated')

      const result = await paymentService.processPayment('netopia', {
        amount,
        currency,
        description,
        campaignId,
        donorId: user.uid,
        donorEmail: user.email || '',
        donorName: user.displayName || user.email || '',
        metadata: {
          orderId: `${Date.now()}-${campaignId}`
        }
      })

      if (result.success) {
        // Redirect to Netopia payment page
        window.location.href = result.gatewayResponse.paymentUrl
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Netopia payment failed')
      onError(error instanceof Error ? error : new Error('Netopia payment failed'))
    } finally {
      setProcessing(false)
    }
  }

  return (
    <StyledCard>
      <PaymentMethodSelect>
        <InputLabel>Payment Method</InputLabel>
        <Select
          value={paymentMethod}
          onChange={handlePaymentMethodChange}
          label="Payment Method"
        >
          <MenuItem value="stripe">Credit Card (Stripe)</MenuItem>
          <MenuItem value="paypal">PayPal</MenuItem>
          <MenuItem value="netopia">Netopia</MenuItem>
        </Select>
      </PaymentMethodSelect>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {paymentMethod === 'stripe' && (
        <form onSubmit={handleStripeSubmit}>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4'
                  }
                },
                invalid: {
                  color: '#9e2146'
                }
              }
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!stripe || processing}
            sx={{ mt: 2 }}
          >
            {processing ? 'Processing...' : `Pay ${amount} ${currency}`}
          </Button>
        </form>
      )}

      {paymentMethod === 'paypal' && (
        <PayPalButtons
          createOrder={(data, actions) => {
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: amount.toString(),
                  currency_code: currency
                },
                description
              }]
            })
          }}
          onApprove={(data, actions) => handlePayPalApprove(data)}
          onError={(err) => {
            setError('PayPal payment failed')
            onError(err instanceof Error ? err : new Error('PayPal payment failed'))
          }}
          disabled={processing}
        />
      )}

      {paymentMethod === 'netopia' && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleNetopiaPayment}
          disabled={processing}
        >
          {processing ? 'Processing...' : `Pay with Netopia`}
        </Button>
      )}
    </StyledCard>
  )
}

export default PaymentForm 