import React from 'react';
import { useParams } from 'react-router-dom';

const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // This is placeholder data. In a real app, you would fetch this from your backend/Firebase
  const property = {
    id,
    title: 'Modern Apartment',
    location: 'New York, NY',
    price: 450000,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1200,
    description: 'Beautiful modern apartment in the heart of New York City. Features include hardwood floors, stainless steel appliances, and a spacious balcony with city views.',
    amenities: [
      'Central Air',
      'In-unit Laundry',
      'Dishwasher',
      'Hardwood Floors',
      'Balcony',
      'Elevator'
    ],
    images: [
      'https://placehold.co/800x600',
      'https://placehold.co/800x600',
      'https://placehold.co/800x600'
    ]
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Image Gallery */}
        <div className="grid grid-cols-2 gap-4 p-4">
          <div className="col-span-2">
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
          {property.images.slice(1).map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${property.title} ${index + 2}`}
              className="w-full h-48 object-cover rounded-lg"
            />
          ))}
        </div>

        {/* Property Details */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
              <p className="text-gray-600 text-lg">{property.location}</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              ${property.price.toLocaleString()}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Bedrooms</p>
              <p className="text-xl font-semibold">{property.bedrooms}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Bathrooms</p>
              <p className="text-xl font-semibold">{property.bathrooms}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Square Feet</p>
              <p className="text-xl font-semibold">{property.sqft}</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Description</h2>
            <p className="text-gray-600 leading-relaxed">{property.description}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {property.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <button className="btn-primary w-full md:w-auto">
              Contact Agent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails; 