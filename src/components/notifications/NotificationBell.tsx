import { useState } from 'react';

interface Notification {
  id: string;
  message: string;
  read: boolean;
  timestamp: Date;
}

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      message: 'Welcome to RealEstate Pro!',
      read: false,
      timestamp: new Date(),
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <span className="sr-only">View notifications</span>
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
            <div className="mt-2 divide-y divide-gray-100">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div key={notification.id} className="py-3">
                    <p className="text-sm text-gray-800">{notification.message}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {notification.timestamp.toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="py-3 text-sm text-gray-500">No notifications</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 