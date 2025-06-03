import React from 'react'
import { Link } from 'react-router-dom'
import { Property } from '../../types/property'

interface PropertyCardProps {
  property: Property
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const progress = (property.amountRaised / property.targetAmount) * 100

  return (
    <Link 
      to={`/property/${property.id}`}
      className="block bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden group"
    >
      {/* Image */}
      <div className="relative aspect-[16/9]">
        <img
          src={property.imageUrl}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
        {property.featured && (
          <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            Featured
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {property.title}
        </h3>
        <p className="text-gray-500 mb-4 line-clamp-2">
          {property.description}
        </p>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-900">
              ${property.amountRaised.toLocaleString()}
            </span>
            <span className="text-gray-500">
              ${property.targetAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={property.owner.avatarUrl}
              alt={property.owner.name}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <div className="text-sm font-medium text-gray-900">
                {property.owner.name}
              </div>
              <div className="text-xs text-gray-500">
                {property.location}
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {property.daysLeft} days left
          </div>
        </div>
      </div>
    </Link>
  )
} 