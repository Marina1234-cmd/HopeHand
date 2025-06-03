import React from 'react'
import { Link } from 'react-router-dom'

const categories = [
  {
    id: 'medical',
    title: 'Medical',
    description: 'Support medical treatments, surgeries, and healthcare needs',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop',
    count: 2453
  },
  {
    id: 'emergency',
    title: 'Emergency',
    description: 'Help those facing unexpected crises and urgent needs',
    image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop',
    count: 1876
  },
  {
    id: 'education',
    title: 'Education',
    description: 'Support students and educational initiatives',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop',
    count: 3241
  },
  {
    id: 'memorial',
    title: 'Memorial',
    description: 'Honor loved ones and support memorial services',
    image: 'https://images.unsplash.com/photo-1486825586573-7131f7991bdd?auto=format&fit=crop',
    count: 892
  },
  {
    id: 'animals',
    title: 'Animals',
    description: 'Help animals in need and support animal welfare',
    image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop',
    count: 1654
  },
  {
    id: 'nonprofit',
    title: 'Nonprofit',
    description: 'Support charitable organizations and causes',
    image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop',
    count: 987
  },
  {
    id: 'business',
    title: 'Business',
    description: 'Help small businesses and entrepreneurs',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop',
    count: 765
  },
  {
    id: 'community',
    title: 'Community',
    description: 'Support local community projects and initiatives',
    image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop',
    count: 2341
  }
]

export default function Categories() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Browse by Category
          </h1>
          <p className="text-lg text-gray-600">
            Discover causes you care about and make a difference
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/categories/${category.id}`}
              className="group block"
            >
              <div className="relative aspect-[16/9] rounded-t-2xl overflow-hidden">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-xl font-semibold text-white">
                    {category.title}
                  </h3>
                  <p className="text-white/80 text-sm">
                    {category.count.toLocaleString()} fundraisers
                  </p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-b-2xl border border-gray-100">
                <p className="text-gray-600 line-clamp-2">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Start Fundraiser CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col items-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Don't see your category?
            </h2>
            <p className="text-gray-600 mb-6">
              You can start a fundraiser for any cause you care about
            </p>
            <Link
              to="/fundraise/create"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Start a Fundraiser
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 