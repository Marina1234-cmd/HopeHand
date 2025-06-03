import { useState, useEffect } from 'react'
import { collection, query, getDocs, doc, updateDoc, deleteDoc, where, orderBy } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { useAuth } from '../../hooks/useAuth'

interface Comment {
  id: string
  text: string
  type: 'comment' | 'testimonial' | 'review'
  status: 'pending' | 'approved' | 'rejected'
  campaignId?: string
  campaignTitle?: string
  userId: string
  userName: string
  createdAt: string
  reportCount?: number
  reportReasons?: string[]
}

const CommentModeration = () => {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | Comment['type']>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | Comment['status']>('pending')
  const { hasPermission } = useAuth()

  const fetchComments = async () => {
    try {
      const commentsRef = collection(db, 'comments')
      let commentsQuery = query(commentsRef, orderBy('createdAt', 'desc'))

      if (statusFilter !== 'all') {
        commentsQuery = query(commentsQuery, where('status', '==', statusFilter))
      }
      if (filter !== 'all') {
        commentsQuery = query(commentsQuery, where('type', '==', filter))
      }

      const snapshot = await getDocs(commentsQuery)
      const commentsList = await Promise.all(snapshot.docs.map(async doc => {
        const data = doc.data() as Comment
        if (data.campaignId) {
          const campaignDoc = await getDocs(query(
            collection(db, 'campaigns'),
            where('id', '==', data.campaignId)
          ))
          if (!campaignDoc.empty) {
            data.campaignTitle = campaignDoc.docs[0].data().title
          }
        }
        return { ...data, id: doc.id }
      }))

      setComments(commentsList)
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [filter, statusFilter])

  const handleStatusChange = async (commentId: string, newStatus: Comment['status']) => {
    try {
      await updateDoc(doc(db, 'comments', commentId), {
        status: newStatus,
        moderatedAt: new Date().toISOString()
      })
      
      setComments(prev => prev.map(comment => 
        comment.id === commentId ? { ...comment, status: newStatus } : comment
      ))
    } catch (error) {
      console.error('Error updating comment status:', error)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return

    try {
      await deleteDoc(doc(db, 'comments', commentId))
      setComments(prev => prev.filter(comment => comment.id !== commentId))
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Comment Moderation</h2>
        <div className="flex gap-4">
          <select
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
          >
            <option value="all">All Types</option>
            <option value="comment">Comments</option>
            <option value="testimonial">Testimonials</option>
            <option value="review">Reviews</option>
          </select>
          <select
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-gray-200">
          {comments.map((comment) => (
            <li key={comment.id} className="p-6 hover:bg-gray-50">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full
                      ${comment.type === 'comment' ? 'bg-blue-100 text-blue-800' : ''}
                      ${comment.type === 'testimonial' ? 'bg-purple-100 text-purple-800' : ''}
                      ${comment.type === 'review' ? 'bg-green-100 text-green-800' : ''}
                    `}>
                      {comment.type.charAt(0).toUpperCase() + comment.type.slice(1)}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full
                      ${comment.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                      ${comment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${comment.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {comment.status.charAt(0).toUpperCase() + comment.status.slice(1)}
                    </span>
                    {comment.reportCount && comment.reportCount > 0 && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        {comment.reportCount} Reports
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <p className="text-gray-900">{comment.text}</p>

                <div className="flex justify-between items-end">
                  <div className="text-sm text-gray-500">
                    <p>By: {comment.userName}</p>
                    {comment.campaignTitle && (
                      <p>On: {comment.campaignTitle}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-4">
                    {comment.status === 'pending' && hasPermission('canModerateComments') && (
                      <>
                        <button
                          onClick={() => handleStatusChange(comment.id, 'approved')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange(comment.id, 'rejected')}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {hasPermission('canModerateComments') && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {comment.reportReasons && comment.reportReasons.length > 0 && (
                  <div className="mt-2 p-3 bg-red-50 rounded-md">
                    <h4 className="text-sm font-medium text-red-800 mb-1">Report Reasons:</h4>
                    <ul className="list-disc list-inside text-sm text-red-700">
                      {comment.reportReasons.map((reason, index) => (
                        <li key={index}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default CommentModeration 