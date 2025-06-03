import React, { useState } from 'react';

const ListProperty: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    propertyType: '',
    amenities: [] as string[],
    images: [] as File[],
  });

  const amenitiesList = [
    'Central Air',
    'In-unit Laundry',
    'Dishwasher',
    'Hardwood Floors',
    'Balcony',
    'Elevator',
    'Parking',
    'Pool',
    'Gym',
    'Pet Friendly',
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, images: Array.from(e.target.files) });
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this data to your backend
    console.log('Form submitted:', formData);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">List Your Property</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="title" className="label">
                    Property Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    className="input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="propertyType" className="label">
                    Property Type
                  </label>
                  <select
                    id="propertyType"
                    className="input"
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="price" className="label">
                    Price
                  </label>
                  <input
                    type="number"
                    id="price"
                    className="input"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="location" className="label">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    className="input"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Property Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="bedrooms" className="label">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    id="bedrooms"
                    className="input"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="bathrooms" className="label">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    id="bathrooms"
                    className="input"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="sqft" className="label">
                    Square Feet
                  </label>
                  <input
                    type="number"
                    id="sqft"
                    className="input"
                    value={formData.sqft}
                    onChange={(e) => setFormData({ ...formData, sqft: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <label htmlFor="description" className="label">
                Description
              </label>
              <textarea
                id="description"
                rows={5}
                className="input"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            {/* Amenities */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {amenitiesList.map((amenity) => (
                  <label key={amenity} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Images */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Property Images</h2>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              <p className="mt-2 text-sm text-gray-500">
                You can upload multiple images. Supported formats: JPG, PNG
              </p>
            </div>

            <button type="submit" className="btn-primary w-full">
              List Property
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ListProperty; 