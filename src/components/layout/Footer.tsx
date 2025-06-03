import React from 'react'
import { Link } from 'react-router-dom'

const footerSections = {
  donate: {
    title: 'Donate',
    links: [
      { name: 'Categories', href: '/categories' },
      { name: 'Crisis relief', href: '/categories/emergency' },
      { name: 'Social Impact Funds', href: '/impact-funds' },
      { name: 'Supporter Space', href: '/supporter-space' }
    ]
  },
  fundraise: {
    title: 'Fundraise',
    links: [
      { name: 'How to start a HopeHand', href: '/how-it-works' },
      { name: 'Fundraising categories', href: '/categories' },
      { name: 'Team fundraising', href: '/team-fundraising' },
      { name: 'Fundraising Blog', href: '/blog' },
      { name: 'Charity fundraising', href: '/charity' },
      { name: 'Sign up as a nonprofit', href: '/nonprofit/signup' }
    ]
  },
  about: {
    title: 'About',
    links: [
      { name: 'How HopeHand works', href: '/how-it-works' },
      { name: 'HopeHand Giving Guarantee', href: '/guarantee' },
      { name: 'Supported countries', href: '/countries' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Help Center', href: '/help' },
      { name: 'About HopeHand', href: '/about' }
    ]
  },
  resources: {
    title: 'Resources',
    links: [
      { name: 'Newsroom', href: '/newsroom' },
      { name: 'Careers', href: '/careers' },
      { name: 'HopeHand.org', href: '/' },
      { name: 'HopeHand Partnerships', href: '/partnerships' },
      { name: 'HopeHand Pro for nonprofits', href: '/nonprofit' }
    ]
  }
}

const moreResources = [
  { name: 'Fundraising tips', href: '/fundraising-tips/basics' },
  { name: 'Fundraising ideas', href: '/fundraising-tips/ideas' },
  { name: 'Rent assistance', href: '/categories/rent' },
  { name: 'Fundraising sites', href: '/fundraising-sites' },
  { name: 'Team fundraising ideas', href: '/team-fundraising/ideas' },
  { name: 'What is crowdfunding?', href: '/what-is-crowdfunding' },
  { name: 'Why HopeHand', href: '/why-hopehand' },
  { name: 'Common questions', href: '/faq' },
  { name: 'Success stories', href: '/success-stories' },
  { name: 'Help with bills', href: '/categories/bills' },
  { name: 'Help with medical bills', href: '/categories/medical' },
  { name: 'Fundraising ideas for college', href: '/categories/education' },
  { name: 'School fundraising ideas', href: '/categories/education/schools' },
  { name: 'How to get a service dog', href: '/categories/pets' },
  { name: 'Crowdfunding sites', href: '/crowdfunding-sites' },
  { name: 'Help for veterans', href: '/categories/veterans' }
]

export default function Footer() {
  const [showMoreResources, setShowMoreResources] = React.useState(false)

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {Object.values(footerSections).map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-base text-gray-500 hover:text-gray-900"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <button
            onClick={() => setShowMoreResources(!showMoreResources)}
            className="flex items-center text-sm font-semibold text-gray-600 hover:text-gray-900"
          >
            More resources
            <svg
              className={`ml-2 h-5 w-5 transform transition-transform ${
                showMoreResources ? 'rotate-180' : ''
              }`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {showMoreResources && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {moreResources.map((resource) => (
                <Link
                  key={resource.name}
                  to={resource.href}
                  className="text-base text-gray-500 hover:text-gray-900"
                >
                  {resource.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; {new Date().getFullYear()} HopeHand. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}