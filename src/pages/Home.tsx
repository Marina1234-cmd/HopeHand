import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Find Your Dream Home
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Discover the perfect property from our extensive collection of homes, apartments, and commercial spaces.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/properties"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Browse Properties
          </Link>
          <Link
            to="/search"
            className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            Search Now
          </Link>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Featured Properties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Placeholder for featured properties */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">Modern Apartment</h3>
              <p className="text-gray-600 mb-4">New York, NY</p>
              <p className="text-blue-600 font-bold">$450,000</p>
            </div>
          </div>
          {/* Add more property cards here */}
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center py-16 bg-gray-100 rounded-lg">
        <h2 className="text-3xl font-bold mb-4">Ready to List Your Property?</h2>
        <p className="text-xl text-gray-600 mb-8">
          Join thousands of successful property owners who trust us.
        </p>
        <Link
          to="/list-property"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          List Your Property
        </Link>
      </section>
    </div>
  );
};

export default Home; 