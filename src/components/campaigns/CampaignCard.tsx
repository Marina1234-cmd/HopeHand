import React from 'react'
import { Link } from 'react-router-dom'

interface Property {
  id: string
  title: string
  description: string
  price: number
  type: 'house' | 'apartment' | 'commercial' | 'land'
  location: string
  bedrooms?: number
  bathrooms?: number
  area: number
  imageUrl: string
  features: string[]
  listedDate: Date
  agent: {
    name: string
    phone: string
  }
}

interface PropertyCardProps {
  property: Property
}

export default function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link
      to={`/property/${property.id}`}
      className="group block bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={property.imageUrl}
          alt={property.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute top-3 right-3">
          <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full capitalize">
            {property.type}
          </span>
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="inline-block px-4 py-2 bg-white/90 backdrop-blur-sm text-blue-600 text-lg font-bold rounded-lg">
            ${property.price.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
          {property.title}
        </h3>
        
        <p className="text-gray-500 mb-4">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {property.location}
          </span>
        </p>

        <div className="grid grid-cols-3 gap-4 mb-4">
          {property.bedrooms && (
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-gray-500">Beds</div>
              <div className="font-semibold text-gray-900">{property.bedrooms}</div>
            </div>
          )}
          {property.bathrooms && (
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-gray-500">Baths</div>
              <div className="font-semibold text-gray-900">{property.bathrooms}</div>
            </div>
          )}
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="text-gray-500">Area</div>
            <div className="font-semibold text-gray-900">{property.area} m²</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm border-t pt-4">
          <div className="flex items-center text-gray-500">
            <span className="font-medium text-blue-600">{property.agent.name}</span>
          </div>
          <div className="flex items-center text-gray-500">
            <span>
              {new Date(property.listedDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
} 