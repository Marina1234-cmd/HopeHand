import React from 'react'

const partnerTypes = [
  {
    title: "Corporate Partners",
    description: "Join our network of companies making a difference through employee giving and matching programs.",
    icon: "🏢",
    benefits: [
      "Employee giving platform",
      "Donation matching",
      "Impact reporting",
      "CSR initiatives"
    ]
  },
  {
    title: "Technology Partners",
    description: "Integrate with our platform to provide innovative solutions for fundraising and donor management.",
    icon: "💻",
    benefits: [
      "API access",
      "Technical support",
      "Co-marketing",
      "Integration guides"
    ]
  },
  {
    title: "Nonprofit Partners",
    description: "Access special rates and features designed specifically for nonprofit organizations.",
    icon: "🤝",
    benefits: [
      "Reduced fees",
      "Priority support",
      "Custom branding",
      "Advanced analytics"
    ]
  }
]

const testimonials = [
  {
    quote: "HopeHand's partnership program has helped us streamline our corporate giving initiatives.",
    author: "John Smith",
    role: "CSR Director",
    company: "Tech Corp"
  },
  {
    quote: "The integration process was smooth, and their team was incredibly supportive.",
    author: "Sarah Lee",
    role: "Product Manager",
    company: "Payment Solutions Inc."
  }
]

export default function Partnerships() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Partner with HopeHand
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join our ecosystem of partners working together to make fundraising more effective and accessible.
          </p>
        </div>

        {/* Partnership Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {partnerTypes.map((type) => (
            <div key={type.title} className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-4xl mb-4">
                {type.icon}
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {type.title}
              </h2>
              <p className="text-gray-600 mb-4">
                {type.description}
              </p>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Key Benefits:
              </h3>
              <ul className="space-y-2">
                {type.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Partner Success Stories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.author} className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-600 italic mb-4">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">
                    {testimonial.author}
                  </p>
                  <p className="text-gray-600">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-green-600 rounded-lg shadow-lg p-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Become a Partner
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Let's discuss how we can work together to make a bigger impact.
            </p>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-2 rounded-md border-gray-300 focus:ring-green-500 focus:border-green-500"
                />
                <input
                  type="email"
                  placeholder="Work Email"
                  className="w-full px-4 py-2 rounded-md border-gray-300 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <input
                type="text"
                placeholder="Company"
                className="w-full px-4 py-2 rounded-md border-gray-300 focus:ring-green-500 focus:border-green-500"
              />
              <select className="w-full px-4 py-2 rounded-md border-gray-300 focus:ring-green-500 focus:border-green-500">
                <option value="">Select Partnership Type</option>
                <option value="corporate">Corporate Partner</option>
                <option value="technology">Technology Partner</option>
                <option value="nonprofit">Nonprofit Partner</option>
              </select>
              <textarea
                placeholder="Tell us about your organization and partnership goals"
                rows={4}
                className="w-full px-4 py-2 rounded-md border-gray-300 focus:ring-green-500 focus:border-green-500"
              />
              <button
                type="submit"
                className="w-full md:w-auto px-8 py-3 bg-white text-green-600 rounded-full font-semibold hover:bg-green-50 transition-colors"
              >
                Submit Inquiry
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 