import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const featuredPosts = [
  {
    id: 1,
    title: "10 Creative Fundraising Ideas That Actually Work",
    excerpt: "Discover unique ways to make your fundraising campaign stand out and reach your goals faster.",
    imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop",
    category: "Tips & Strategies",
    readTime: "8 min read",
    date: "Mar 15, 2024"
  },
  {
    id: 2,
    title: "How to Tell Your Story and Connect with Donors",
    excerpt: "Learn the art of storytelling to create emotional connections and inspire more donations.",
    imageUrl: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop",
    category: "Storytelling",
    readTime: "6 min read",
    date: "Mar 12, 2024"
  }
]

const blogCategories = [
  {
    name: "Getting Started",
    count: 12,
    icon: "🚀"
  },
  {
    name: "Success Stories",
    count: 28,
    icon: "⭐"
  },
  {
    name: "Tips & Strategies",
    count: 35,
    icon: "💡"
  },
  {
    name: "Social Media",
    count: 20,
    icon: "📱"
  },
  {
    name: "Event Planning",
    count: 15,
    icon: "📅"
  },
  {
    name: "Donor Relations",
    count: 18,
    icon: "🤝"
  }
]

const recentPosts = [
  {
    id: 3,
    title: "5 Ways to Engage Your Community in Your Cause",
    category: "Community",
    date: "Mar 10, 2024"
  },
  {
    id: 4,
    title: "Making the Most of Social Media for Fundraising",
    category: "Social Media",
    date: "Mar 8, 2024"
  },
  {
    id: 5,
    title: "How to Thank Your Donors and Keep Them Engaged",
    category: "Donor Relations",
    date: "Mar 5, 2024"
  },
  {
    id: 6,
    title: "Setting Realistic Fundraising Goals",
    category: "Getting Started",
    date: "Mar 3, 2024"
  }
]

export default function FundraisingBlog() {
  const [searchQuery, setSearchQuery] = useState('')
  const [email, setEmail] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [subscribeError, setSubscribeError] = useState('')
  const [subscribeSuccess, setSubscribeSuccess] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery)
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubscribing(true)
    setSubscribeError('')
    setSubscribeSuccess(false)

    try {
      // TODO: Implement newsletter subscription
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulated API call
      setSubscribeSuccess(true)
      setEmail('')
    } catch (error) {
      setSubscribeError('Failed to subscribe. Please try again.')
    } finally {
      setIsSubscribing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Fundraising Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Expert tips, success stories, and strategies to help you reach your fundraising goals.
          </p>
        </div>

        {/* Featured Posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {featuredPosts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/post/${post.id}`}
              className="group"
            >
              <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = 'https://via.placeholder.com/800x450?text=Image+Not+Found'
                    }}
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {post.category}
                    </span>
                    <span className="text-sm text-gray-500">
                      {post.readTime}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-600">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {post.excerpt}
                  </p>
                  <div className="text-sm text-gray-500">
                    {post.date}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Categories Grid */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {blogCategories.map((category) => (
              <Link
                key={category.name}
                to={`/blog/category/${category.name.toLowerCase().replace(/ /g, '-')}`}
                className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center group"
              >
                <div className="text-4xl mb-2">{category.icon}</div>
                <h3 className="font-medium text-gray-900 group-hover:text-green-600">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {category.count} articles
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Posts and Search */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Posts List */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Recent Posts
            </h2>
            <div className="space-y-6">
              {recentPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/post/${post.id}`}
                  className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 hover:text-green-600">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {post.category} • {post.date}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Search and Subscribe */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Search Articles
              </h3>
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search blog posts..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-2"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
            </div>

            <div className="bg-green-50 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Get Fundraising Tips
              </h3>
              <p className="text-gray-600 mb-4">
                Subscribe to our newsletter for the latest fundraising strategies and success stories.
              </p>
              <form onSubmit={handleSubscribe}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
                >
                  {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                </button>
                {subscribeError && (
                  <p className="mt-2 text-sm text-red-600">{subscribeError}</p>
                )}
                {subscribeSuccess && (
                  <p className="mt-2 text-sm text-green-600">Successfully subscribed!</p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 