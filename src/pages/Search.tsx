import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useState({
    location: '',
    priceRange: '',
    bedrooms: '',
    propertyType: '',
  });

  // This is placeholder data. In a real app, you would filter this based on search params
  const properties = [
    {
      id: '1',
      title: 'Modern Apartment',
      location: 'New York, NY',
      price: 450000,
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1200,
      type: 'Apartment',
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
      type: 'House',
      imageUrl: 'https://placehold.co/600x400'
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would make an API call here with searchParams
    console.log('Searching with params:', searchParams);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Search Properties</h1>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label htmlFor="location" className="label">
              Location
            </label>
            <input
              type="text"
              id="location"
              className="input"
              placeholder="Enter city, state"
              value={searchParams.location}
              onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="priceRange" className="label">
              Price Range
            </label>
            <select
              id="priceRange"
              className="input"
              value={searchParams.priceRange}
              onChange={(e) => setSearchParams({ ...searchParams, priceRange: e.target.value })}
            >
              <option value="">Any Price</option>
              <option value="0-300000">$0 - $300,000</option>
              <option value="300000-600000">$300,000 - $600,000</option>
              <option value="600000-1000000">$600,000 - $1,000,000</option>
              <option value="1000000+">$1,000,000+</option>
            </select>
          </div>

          <div>
            <label htmlFor="bedrooms" className="label">
              Bedrooms
            </label>
            <select
              id="bedrooms"
              className="input"
              value={searchParams.bedrooms}
              onChange={(e) => setSearchParams({ ...searchParams, bedrooms: e.target.value })}
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>

          <div>
            <label htmlFor="propertyType" className="label">
              Property Type
            </label>
            <select
              id="propertyType"
              className="input"
              value={searchParams.propertyType}
              onChange={(e) => setSearchParams({ ...searchParams, propertyType: e.target.value })}
            >
              <option value="">Any Type</option>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="condo">Condo</option>
              <option value="townhouse">Townhouse</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <button type="submit" className="btn-primary w-full">
            Search Properties
          </button>
        </div>
      </form>

      {/* Results */}
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

export default Search; 