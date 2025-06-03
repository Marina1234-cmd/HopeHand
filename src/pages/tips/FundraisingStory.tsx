import React from 'react'

const tips = [
  {
    title: 'Start with a compelling headline',
    description: 'Your headline should be clear, specific, and emotionally engaging. Include the name of the beneficiary and the purpose.',
    icon: '📝'
  },
  {
    title: 'Share your personal connection',
    description: 'Explain your relationship to the cause or beneficiary. Authenticity helps build trust with potential donors.',
    icon: '❤️'
  },
  {
    title: 'Be specific about the need',
    description: 'Clearly explain what the funds will be used for. Break down costs if possible to show transparency.',
    icon: '📊'
  },
  {
    title: 'Include powerful visuals',
    description: 'Add high-quality photos or videos that help tell your story. Visual content can significantly increase donations.',
    icon: '📸'
  },
  {
    title: 'Create urgency',
    description: 'Explain why the help is needed now and what impact immediate support can have.',
    icon: '⏰'
  },
  {
    title: 'Show the impact',
    description: 'Describe how donations will make a difference. Help donors envision the positive change they can create.',
    icon: '✨'
  }
]

export default function FundraisingStory() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            How to Tell Your Story
          </h1>
          <p className="text-lg text-gray-600">
            A compelling story can make all the difference in reaching your fundraising goal
          </p>
        </div>

        {/* Tips Grid */}
        <div className="space-y-8">
          {tips.map((tip, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 transition-all hover:shadow-md"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl" role="img" aria-label={tip.title}>
                    {tip.icon}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {tip.title}
                  </h3>
                  <p className="text-gray-600">
                    {tip.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Example Section */}
        <div className="mt-12 bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Story Example
          </h2>
          <div className="prose prose-green">
            <blockquote className="text-gray-600 italic border-l-4 border-green-500 pl-4">
              "Hi, I'm Sarah, and I'm raising funds for my brother Mike's cancer treatment. 
              Three weeks ago, Mike was diagnosed with Stage 3 lymphoma. As a single father 
              of two young children, he's facing not only a difficult medical journey but 
              also mounting hospital bills. The required treatment will cost $50,000, which 
              includes chemotherapy, medications, and supportive care. Every donation, no 
              matter the size, will help keep Mike focused on what matters most - fighting 
              cancer and being there for his kids. Thank you for your support in this 
              critical time."
            </blockquote>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <a
            href="/fundraise/create"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Start Your Fundraiser
          </a>
        </div>
      </div>
    </div>
  )
} 