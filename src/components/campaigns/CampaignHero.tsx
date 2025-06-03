import React from 'react'
import { Link } from 'react-router-dom'

interface Category {
  title: string
  icon: string
  image: string
  description: string
  position: 'left' | 'left-center' | 'center' | 'center-right' | 'right'
}

const categories: Category[] = [
  {
    title: 'Animal',
    icon: '🐾',
    image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=300&h=300',
    description: 'Help animals in need',
    position: 'left'
  },
  {
    title: 'Education',
    icon: '📚',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=300&h=300',
    description: 'Support educational causes',
    position: 'left-center'
  },
  {
    title: 'Your cause',
    icon: '💝',
    image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=300&h=300',
    description: 'Start your fundraiser',
    position: 'center'
  },
  {
    title: 'Medical',
    icon: '🏥',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=300&h=300',
    description: 'Help with medical expenses',
    position: 'center-right'
  },
  {
    title: 'Emergency',
    icon: '🆘',
    image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=300&h=300',
    description: 'Urgent relief needed',
    position: 'right'
  },
  {
    title: 'Business',
    icon: '💼',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=300&h=300',
    description: 'Support small businesses',
    position: 'center-right'
  }
]

export default function CampaignHero() {
  const leftCategories = categories.filter(c => ['left', 'left-center'].includes(c.position))
  const centerCategories = categories.filter(c => c.position === 'center')
  const rightCategories = categories.filter(c => ['right', 'center-right'].includes(c.position))

  return (
    <div className="relative bg-white">
      {/* Background with overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=2000"
          alt="People helping each other"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/50" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Make someone's life better today
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your kindness can transform lives. Start a fundraiser or donate to causes that matter.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/fundraise"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Start Fundraising
            </Link>
            <Link
              to="/search"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Search Fundraisers
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <p className="text-4xl font-bold text-green-600">$25B+</p>
            <p className="mt-2 text-gray-600">Raised</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-green-600">100M+</p>
            <p className="mt-2 text-gray-600">Donations</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-green-600">150+</p>
            <p className="mt-2 text-gray-600">Countries</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-green-600">5M+</p>
            <p className="mt-2 text-gray-600">Fundraisers</p>
          </div>
        </div>
      </div>
    </div>
  )
}

interface CategoryCircleProps {
  category: Category
}

function CategoryCircle({ category }: CategoryCircleProps) {
  return (
    <Link
      to={`/campaigns?category=${category.title.toLowerCase()}`}
      className="group block w-40 h-40 relative"
    >
      <div className="absolute inset-0">
        <div className="absolute inset-0 rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-200">
          <img
            src={category.image}
            alt={category.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60" />
          <div className="absolute inset-x-0 bottom-6 text-center">
            <div className="text-white font-medium text-lg drop-shadow-lg mb-1">
              {category.title}
            </div>
            <div className="text-white/80 text-sm px-4 line-clamp-2">
              {category.description}
            </div>
          </div>
        </div>
        <div className="absolute -inset-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/5" />
      </div>
    </Link>
  )
}