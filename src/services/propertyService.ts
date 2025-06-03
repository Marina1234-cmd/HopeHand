import { db } from '../config/firebase'
import { collection, addDoc, updateDoc, deleteDoc, doc, getDoc, getDocs, query, where, orderBy, limit, startAfter, DocumentSnapshot, serverTimestamp, DocumentData, CollectionReference } from 'firebase/firestore'
import { Property, PropertyListFilters, PropertyListResponse } from '../types/property'

const PROPERTIES_COLLECTION = 'properties'
const PAGE_SIZE = 12

interface ListPropertiesParams {
  type?: string
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  lastDoc?: DocumentSnapshot<DocumentData>
}

interface ListPropertiesResponse {
  properties: Property[]
  lastDoc?: DocumentSnapshot<DocumentData>
}

interface ListPropertiesOptions {
  featured?: boolean
  category?: string
  limit?: number
}

// Mock data for development
const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Help Demisha Heal from Stage 3 Thyroid Cancer',
    description: 'Support Demisha\'s fight against thyroid cancer with medical expenses and recovery costs.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop',
    amountRaised: 27493,
    targetAmount: 50000,
    daysLeft: 23,
    featured: true,
    location: 'New York, NY',
    owner: {
      name: 'Demisha Williams',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100'
    },
    category: {
      id: 'medical',
      name: 'Medical'
    },
    donationsCount: 6600,
    lastUpdated: '2024-02-20',
    story: 'Demisha was recently diagnosed with Stage 3 Thyroid Cancer...',
    updates: [],
    topDonations: []
  },
  {
    id: '2',
    title: 'Help Reg pay off his debt! #FreeReg',
    description: 'Support Reg in clearing his financial burden and getting back on track.',
    imageUrl: 'https://images.unsplash.com/photo-1559526324-593bc073d938?auto=format&fit=crop',
    amountRaised: 203240,
    targetAmount: 250000,
    daysLeft: 15,
    featured: true,
    location: 'Miami, FL',
    owner: {
      name: 'Reg Thompson',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100'
    },
    category: {
      id: 'emergency',
      name: 'Emergency'
    },
    donationsCount: 8300,
    lastUpdated: '2024-02-21',
    story: 'After facing unexpected financial challenges...',
    updates: [],
    topDonations: []
  },
  {
    id: '3',
    title: 'Help Lydia Thriver Support Her Stem Cell Journey',
    description: 'Support Lydia\'s life-changing stem cell treatment and recovery process.',
    imageUrl: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop',
    amountRaised: 32443,
    targetAmount: 75000,
    daysLeft: 45,
    featured: false,
    location: 'Boston, MA',
    owner: {
      name: 'Lydia Thriver',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100'
    },
    category: {
      id: 'medical',
      name: 'Medical'
    },
    donationsCount: 2300,
    lastUpdated: '2024-02-19',
    story: 'Lydia has been battling a rare condition...',
    updates: [],
    topDonations: []
  }
]

class PropertyService {
  private propertiesRef: CollectionReference

  constructor() {
    this.propertiesRef = collection(db, 'properties')
  }

  // Create a new property listing
  async createProperty(propertyData: Omit<Property, 'id' | 'listedDate'>): Promise<string> {
    try {
      const property = {
        ...propertyData,
        listedDate: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, PROPERTIES_COLLECTION), property)
      return docRef.id
    } catch (error) {
      console.error('Failed to create property:', error)
      throw error
    }
  }

  // Update a property
  async updateProperty(propertyId: string, updates: Partial<Property>): Promise<void> {
    try {
      const propertyRef = doc(db, PROPERTIES_COLLECTION, propertyId)
      await updateDoc(propertyRef, updates)
    } catch (error) {
      console.error('Failed to update property:', error)
      throw error
    }
  }

  // Delete a property
  async deleteProperty(propertyId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, PROPERTIES_COLLECTION, propertyId))
    } catch (error) {
      console.error('Failed to delete property:', error)
      throw error
    }
  }

  // Get a property by ID
  async getProperty(propertyId: string): Promise<Property | null> {
    try {
      const propertyDoc = await getDoc(doc(db, PROPERTIES_COLLECTION, propertyId))

      if (!propertyDoc.exists()) {
        return null
      }

      return {
        id: propertyDoc.id,
        ...propertyDoc.data()
      } as Property
    } catch (error) {
      console.error('Failed to get property:', error)
      throw error
    }
  }

  // List properties with filters
  async listProperties(params: ListPropertiesParams): Promise<ListPropertiesResponse> {
    try {
      // Build query with filters
      const filters = []
      if (params.type) {
        filters.push(where('type', '==', params.type))
      }
      if (params.minPrice !== undefined) {
        filters.push(where('price', '>=', params.minPrice))
      }
      if (params.maxPrice !== undefined) {
        filters.push(where('price', '<=', params.maxPrice))
      }
      if (params.bedrooms !== undefined) {
        filters.push(where('bedrooms', '>=', params.bedrooms))
      }

      // Apply filters and ordering
      let q = query(
        this.propertiesRef,
        ...filters,
        orderBy('createdAt', 'desc'),
        limit(PAGE_SIZE)
      )

      // Apply pagination if lastDoc is provided
      if (params.lastDoc) {
        q = query(q, startAfter(params.lastDoc))
      }

      const snapshot = await getDocs(q)
      const properties = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Property[]

      return {
        properties,
        lastDoc: snapshot.docs[snapshot.docs.length - 1]
      }
    } catch (error) {
      console.error('Error listing properties:', error)
      throw error
    }
  }

  async listProperties(options: ListPropertiesOptions = {}) {
    try {
      // For development, return mock data
      let filteredProperties = [...mockProperties]
      
      if (options.featured !== undefined) {
        filteredProperties = filteredProperties.filter(p => p.featured === options.featured)
      }
      
      if (options.category) {
        filteredProperties = filteredProperties.filter(p => p.category.id === options.category)
      }
      
      if (options.limit) {
        filteredProperties = filteredProperties.slice(0, options.limit)
      }

      return { properties: filteredProperties }

      // TODO: Implement real Firebase query
      /*
      const propertiesRef = collection(db, 'properties')
      let q = query(propertiesRef, orderBy('createdAt', 'desc'))

      if (options.featured !== undefined) {
        q = query(q, where('featured', '==', options.featured))
      }

      if (options.category) {
        q = query(q, where('category.id', '==', options.category))
      }

      if (options.limit) {
        q = query(q, limit(options.limit))
      }

      const snapshot = await getDocs(q)
      const properties = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Property[]

      return { properties }
      */
    } catch (error) {
      console.error('Error fetching properties:', error)
      throw error
    }
  }
}

// Create and export singleton instance
export const propertyService = new PropertyService() 