import React from 'react';
import { Link } from 'react-router-dom';

const Properties: React.FC = () => {
  // This is a placeholder data. In a real app, this would come from your backend/Firebase
  const properties = [
    {
      id: '1',
      title: 'Modern Apartment',
      location: 'New York, NY',
      price: 450000,
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1200,
      imageUrl: 'https://placehold.co/600x400'
    },
    {
      id: '2',
      title: 'Luxury Villa',
      location: 'Los Angeles, CA',
      price: 1200000,
      bedrooms: 4,
      bathrooms: 3,
      sqft: 3000,
      imageUrl: 'https://placehold.co/600x400'
    },
    {
      id: '3',
      title: 'Cozy Townhouse',
      location: 'Chicago, IL',
      price: 350000,
      bedrooms: 3,
      bathrooms: 2.5,
      sqft: 1800,
      imageUrl: 'https://placehold.co/600x400'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Available Properties</h1>
      
      {/* Filters Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search location..."
            className="input"
          />
          <select className="input">
            <option value="">Price Range</option>
            <option value="0-300000">$0 - $300,000</option>
            <option value="300000-600000">$300,000 - $600,000</option>
            <option value="600000-1000000">$600,000 - $1,000,000</option>
            <option value="1000000+">$1,000,000+</option>
          </select>
          <select className="input">
            <option value="">Bedrooms</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
          <button className="btn-primary">
            Apply Filters
          </button>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {properties.map((property) => (
          <Link
            key={property.id}
            to={`/properties/${property.id}`}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div
              className="h-48 bg-gray-200 bg-cover bg-center"
              style={{ backgroundImage: `url(${property.imageUrl})` }}
            />
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
              <p className="text-gray-600 mb-4">{property.location}</p>
              <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <span>{property.bedrooms} beds</span>
                <span>{property.bathrooms} baths</span>
                <span>{property.sqft} sqft</span>
              </div>
              <p className="text-blue-600 font-bold">${property.price.toLocaleString()}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Properties; 