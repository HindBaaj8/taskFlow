import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiMessageSquare, FiUsers, FiBell, FiChevronDown, FiSmile } from 'react-icons/fi';
import { fetchProjects } from '../features/projects/projectSlice';
import { 
  getMessages, setCurrentProject, clearError, getNotifications, decrementUnreadCount, sendTyping 
} from '../features/collab/collabSlice';
import SocketService from '../services/socket';
import Spinner from '../components/common/Spinner';
import { toast } from 'react-hot-toast';

const ChatPage = () => {
  const dispatch = useDispatch();
  const { 
    currentProjectId, messages, loading, error, hasMoreMessages, page, notifications, unreadCount, onlineUsers, typingUsers, socketStatus 
  } = useSelector((s) => s.collab);
  const projects = useSelector((s) => s.projects.list);
  const { user } = useSelector((s) => s.auth);
  const [messageContent, setMessageContent] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    dispatch(fetchProjects());
    SocketService.connect();
    return () => SocketService.disconnect();
  }, [dispatch]);

  useEffect(() => {
    if (currentProjectId) {
      dispatch(getMessages({ projectId: currentProjectId }));
      SocketService.joinRoom(currentProjectId);
      dispatch(getNotifications());
    } else {
      SocketService.leaveRoom(currentProjectId);
    }
  }, [currentProjectId, dispatch]);

  const handleTyping = (e) => {
    setMessageContent(e.target.value);
    if (currentProjectId && socketStatus === 'connected' && e.target.value.length > 0) {
      SocketService.sendTyping(currentProjectId, true);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageContent.trim() || !currentProjectId) return;
    const sent = SocketService.sendMessage(currentProjectId, messageContent.trim());
    if (sent) setMessageContent('');
    else toast.error('Socket offline');
  };

  const loadMoreMessages = () => {
    if (hasMoreMessages && currentProjectId) {
      dispatch(getMessages({ projectId: currentProjectId, page: page + 1 }));
    }
  };

  const markNotifRead = () => {
    dispatch(decrementUnreadCount());
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <FiMessageSquare size={48} className="mb-4" />
        <p className="text-lg font-medium">Error: {error}</p>
        <button onClick={() => dispatch(clearError())} className="btn-primary px-6 py-2 mt-4">
          Retry
        </button>
      </div>
    );
  }

  const isOwnMessage = (msg) => msg.sender.toString() === user?._id;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] gap-6 p-6">
      {/* Messages */}
      <div className="flex-1 flex flex-col min-w-0 lg:min-w-[500px]">
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
          <FiMessageSquare size={24} className="text-indigo-600" />
          <select 
            value={currentProjectId || ''}
            onChange={(e) => dispatch(setCurrentProject(e.target.value))}
            className="flex-1 max-w-md bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="">Select project</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FiUsers size={16} />
            <span>{onlineUsers.length}</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              socketStatus === 'connected' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
            }`}>
              {socketStatus[0].toUpperCase() + socketStatus.slice(1)}
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 rounded-xl p-4 mb-4">
          {currentProjectId ? (
            <>
              <div 
                className="flex-1 overflow-y-auto pr-2 mb-4"
                onScroll={(e) => e.target.scrollTop === 0 && hasMoreMessages && loadMoreMessages()}
              >
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                    <FiMessageSquare size={48} className="mb-4" />
                    <p>No messages</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg._id} className={`mb-4 flex ${isOwnMessage(msg) ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-md px-4 py-2 rounded-2xl shadow-sm ${
                        isOwnMessage(msg) 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-white border'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className="text-xs mt-1 opacity-75">
                          {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                {loading && <Spinner className="m-auto mt-4" />}
                {hasMoreMessages && (
                  <button onClick={loadMoreMessages} className="self-center mt-4 text-indigo-600 text-sm font-medium">
                    Load more
                  </button>
                )}
              </div>

              {typingUsers.length > 0 && (
                <div className="flex items-center gap-2 p-3 bg-indigo-50 border rounded-xl">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                  </div>
                  <span className="text-sm text-indigo-800">Someone is typing...</span>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <FiMessageSquare size={48} className="mb-4" />
              <p className="text-lg font-medium mb-1">Team Chat</p>
              <p className="text-sm">Select a project</p>
            </div>
          )}
        </div>

        {currentProjectId && (
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                rows="1"
                value={messageContent}
                onChange={handleTyping}
                placeholder="Type message..."
                className="input resize-none pr-12 min-h-[44px] max-h-[120px] w-full"
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
                <FiSmile size={18} />
              </button>
            </div>
            <button 
              type="submit" 
              disabled={!messageContent.trim() || socketStatus !== 'connected'}
              className="btn-primary px-6 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        )}
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-80 flex flex-col gap-6">
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FiUsers size={18} />
            Online ({onlineUsers.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {onlineUsers.map((id) => (
              <div key={id} className="flex items-center gap-3 p-2 bg-green-50 border rounded-lg">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">U</span>
                </div>
                <span className="font-medium text-sm text-green-900">User {id.slice(-4)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4 relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="flex items-center gap-2 w-full text-left"
          >
            <FiBell size={20} className={unreadCount > 0 ? 'text-orange-500 animate-pulse' : 'text-gray-700'} />
            <span className="font-semibold text-gray-900">Notifications</span>
            {unreadCount > 0 && (
              <span className="ml-auto w-6 h-6 bg-orange-500 text-white rounded-full text-xs font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
            <FiChevronDown size={16} className={`ml-auto transition-transform ${showNotifications ? 'rotate-180' : ''}`} />
          </button>

          {showNotifications && (
            <div className="absolute top-full mt-2 w-80 bg-white border shadow-xl rounded-2xl py-3 z-50 max-h-96 overflow-y-auto right-0 lg:right-auto">
              <div className="px-4 pb-2">
                <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  Mark all read
                </button>
              </div>
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-gray-500 text-sm text-center">No notifications</p>
              ) : (
                notifications.slice(0, 10).map((notif) => (
                  <div 
                    key={notif._id}
                    onClick={markNotifRead}
                    className="p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 last:border-0"
                  >
                    <p className={`font-medium text-sm ${notif.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
