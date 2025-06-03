import React from 'react'
import { Link } from 'react-router-dom'

interface Category {
  id: string
  title: string
  description: string
  image: string
  position: 'left' | 'center' | 'right'
}

const categories: Category[] = [
  {
    id: 'animal',
    title: 'Animal',
    description: 'Help animals in need',
    image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=300&h=300',
    position: 'left'
  },
  {
    id: 'education',
    title: 'Education',
    description: 'Support educational causes',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=300&h=300',
    position: 'left'
  },
  {
    id: 'your-cause',
    title: 'Your cause',
    description: 'Start your fundraiser',
    image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=300&h=300',
    position: 'center'
  },
  {
    id: 'medical',
    title: 'Medical',
    description: 'Help with medical expenses',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=300&h=300',
    position: 'center'
  },
  {
    id: 'emergency',
    title: 'Emergency',
    description: 'Urgent relief needed',
    image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=300&h=300',
    position: 'right'
  },
  {
    id: 'business',
    title: 'Business',
    description: 'Support small businesses',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=300&h=300',
    position: 'right'
  }
]

export function CategoryCircles() {
  const leftCategories = categories.filter(c => c.position === 'left')
  const centerCategories = categories.filter(c => c.position === 'center')
  const rightCategories = categories.filter(c => c.position === 'right')

  return (
    <div className="relative h-[600px]">
      {/* Left Column */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 space-y-12">
        {leftCategories.map((category, index) => (
          <CategoryCircle
            key={category.id}
            category={category}
            className={`transform ${index === 0 ? '-translate-x-8' : 'translate-x-8'}`}
          />
        ))}
      </div>

      {/* Center Column */}
      <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 space-y-12">
        {centerCategories.map(category => (
          <CategoryCircle
            key={category.id}
            category={category}
          />
        ))}
      </div>

      {/* Right Column */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 space-y-12">
        {rightCategories.map((category, index) => (
          <CategoryCircle
            key={category.id}
            category={category}
            className={`transform ${index === 0 ? 'translate-x-8' : '-translate-x-8'}`}
          />
        ))}
      </div>
    </div>
  )
}

interface CategoryCircleProps {
  category: Category
  className?: string
}

function CategoryCircle({ category, className = '' }: CategoryCircleProps) {
  return (
    <Link
      to={`/campaigns/category/${category.id}`}
      className={`block w-40 h-40 relative ${className}`}
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