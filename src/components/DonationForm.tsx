import React, { useState } from 'react'

interface DonationFormProps {
  campaignTitle: string;
  onDonate: (amount: number, message: string) => void;
}

const DonationForm: React.FC<DonationFormProps> = ({ campaignTitle, onDonate }) => {
  const [amount, setAmount] = useState<string>('')
  const [message, setMessage] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('card')

  const predefinedAmounts = [10, 25, 50, 100]

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const numericAmount = parseFloat(amount)
    if (numericAmount > 0) {
      onDonate(numericAmount, message)
      // Reset form
      setAmount('')
      setMessage('')
      setIsAnonymous(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-2xl font-semibold mb-6">Support {campaignTitle}</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Predefined amounts */}
        <div className="grid grid-cols-4 gap-3">
          {predefinedAmounts.map((preset) => (
            <button
              key={preset}
              type="button"
              className={`py-2 px-4 rounded-lg border ${
                amount === preset.toString()
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-primary-600'
              }`}
              onClick={() => setAmount(preset.toString())}
            >
              ${preset}
            </button>
          ))}
        </div>

        {/* Custom amount input */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Custom Amount ($)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
              className="input-field pl-8"
              min="1"
              step="0.01"
              required
              placeholder="Enter amount"
            />
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message (Optional)
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
            className="input-field"
            rows={3}
            placeholder="Leave a message of support"
          />
        </div>

        {/* Anonymous donation */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="anonymous"
            checked={isAnonymous}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsAnonymous(e.target.checked)}
            className="h-4 w-4 text-primary-600 rounded border-gray-300"
          />
          <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
            Make this donation anonymous
          </label>
        </div>

        {/* Payment method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className={`p-3 border rounded-lg flex items-center justify-center ${
                paymentMethod === 'card'
                  ? 'bg-primary-50 border-primary-600'
                  : 'border-gray-300'
              }`}
              onClick={() => setPaymentMethod('card')}
            >
              <span className="font-medium">Credit Card</span>
            </button>
            <button
              type="button"
              className={`p-3 border rounded-lg flex items-center justify-center ${
                paymentMethod === 'paypal'
                  ? 'bg-primary-50 border-primary-600'
                  : 'border-gray-300'
              }`}
              onClick={() => setPaymentMethod('paypal')}
            >
              <span className="font-medium">PayPal</span>
            </button>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full btn-primary py-3 text-lg font-semibold"
        >
          Donate ${amount || '0'}
        </button>

        <p className="text-sm text-gray-500 text-center">
          Your donation will help make this campaign a success.
          All payments are secure and encrypted.
        </p>
      </form>
    </div>
  )
}

export default DonationForm 