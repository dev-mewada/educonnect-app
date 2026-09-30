import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function MessagesSection() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const loadConversations = async () => {
    try {
      setLoadingConv(true);
      const [convRes, contactsRes] = await Promise.all([
        api.getConversations(),
        api.getMessageContacts()
      ]);

      if (convRes?.success && Array.isArray(convRes.data)) {
        setConversations(convRes.data);
        if (convRes.data.length > 0 && !activeContact) {
          const first = convRes.data[0];
          setActiveContact({
            id: first.contactId,
            name: first.contactName,
            role: first.contactRole,
            email: first.contactEmail
          });
        }
      }

      if (contactsRes?.success && Array.isArray(contactsRes.data)) {
        setContacts(contactsRes.data);
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
    } finally {
      setLoadingConv(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  // Fetch messages whenever activeContact changes
  useEffect(() => {
    if (!activeContact?.id) return;

    let isMounted = true;
    const loadThread = async () => {
      try {
        setLoadingMsgs(true);
        const res = await api.getMessages(activeContact.id);
        if (isMounted && res?.success && Array.isArray(res.data)) {
          setMessages(res.data);
        }
      } catch (err) {
        console.error('Error fetching messages thread:', err);
      } finally {
        if (isMounted) setLoadingMsgs(false);
      }
    };

    loadThread();
    return () => { isMounted = false; };
  }, [activeContact?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || !activeContact?.id || sending) return;

    const text = inputMsg.trim();
    setInputMsg('');
    setSending(true);

    try {
      const res = await api.sendMessage(activeContact.id, text);
      if (res?.success && res.data) {
        setMessages(prev => [...prev, res.data]);
        // Update conversation snippet in left panel
        setConversations(prev => {
          const existing = prev.find(c => c.contactId === activeContact.id);
          if (existing) {
            return prev.map(c => c.contactId === activeContact.id ? { ...c, lastMessage: text, lastTimestamp: new Date() } : c);
          } else {
            return [{
              contactId: activeContact.id,
              contactName: activeContact.name,
              contactRole: activeContact.role,
              contactEmail: activeContact.email,
              lastMessage: text,
              lastTimestamp: new Date(),
              unreadCount: 0
            }, ...prev];
          }
        });
      } else {
        alert(res?.message || 'Failed to send message');
      }
    } catch (err) {
      alert('Error sending message: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const startNewChat = (contact) => {
    setActiveContact(contact);
    setShowNewChatModal(false);
  };

  return (
    <div style={{ marginTop: '25px', animation: 'fadeUp 0.4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '24px', color: '#1e293b', margin: '0 0 5px' }}>Messages & Communication</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Direct inquiry communication between mentors, students, and administration stored in MySQL.</p>
        </div>

        <button 
          onClick={() => setShowNewChatModal(true)}
          style={{
            padding: '9px 16px',
            borderRadius: '10px',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <i className="ri-user-add-line"></i> Start New Conversation
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 5px 20px rgba(0,0,0,0.05)', minHeight: '520px' }}>
        {/* Left Conversation List */}
        <div style={{ borderRight: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: 0, color: '#1e293b', fontSize: '15px' }}>Conversations ({conversations.length})</h4>
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loadingConv ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                No active message threads yet. Click "Start New Conversation".
              </div>
            ) : (
              conversations.map(conv => (
                <div 
                  key={conv.contactId} 
                  onClick={() => setActiveContact({ id: conv.contactId, name: conv.contactName, role: conv.contactRole, email: conv.contactEmail })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    background: activeContact?.id === conv.contactId ? '#ffffff' : 'transparent',
                    borderLeft: activeContact?.id === conv.contactId ? '4px solid #2563eb' : '4px solid transparent'
                  }}
                >
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    background: conv.contactRole === 'Teacher' ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '15px'
                  }}>
                    {conv.contactName ? conv.contactName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.contactName}</div>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>{conv.contactRole}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '3px' }}>
                      {conv.lastMessage || 'Click to view conversation'}
                    </div>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span style={{ background: '#2563eb', color: '#fff', fontSize: '11px', fontWeight: 600, padding: '2px 6px', borderRadius: '10px' }}>
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Active Chat Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '560px' }}>
          {activeContact ? (
            <>
              {/* Header */}
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px', background: '#ffffff' }}>
                <div style={{ 
                  width: '38px', 
                  height: '38px', 
                  borderRadius: '50%', 
                  background: activeContact.role === 'Teacher' ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '14px'
                }}>
                  {activeContact.name ? activeContact.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', color: '#1e293b' }}>{activeContact.name}</h4>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{activeContact.role} • {activeContact.email}</span>
                </div>
              </div>

              {/* Chat Thread Messages */}
              <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {loadingMsgs ? (
                  <div style={{ textAlign: 'center', color: '#64748b', padding: '30px', fontSize: '13px' }}>Loading messages from database...</div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#64748b', padding: '30px', fontSize: '13px' }}>No messages yet. Send a message below to start chatting!</div>
                ) : (
                  messages.map(m => {
                    const isMe = m.sender_id === user?.id;
                    const timeStr = m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                    return (
                      <div 
                        key={m.id} 
                        style={{
                          alignSelf: isMe ? 'flex-end' : 'flex-start',
                          maxWidth: '70%',
                          background: isMe ? 'linear-gradient(135deg, #2563eb, #3b82f6)' : '#ffffff',
                          color: isMe ? '#ffffff' : '#1e293b',
                          padding: '12px 16px',
                          borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                          fontSize: '14px',
                          lineHeight: '1.4'
                        }}
                      >
                        <p style={{ margin: 0 }}>{m.message}</p>
                        <span style={{ display: 'block', fontSize: '10px', textAlign: 'right', marginTop: '6px', color: isMe ? 'rgba(255,255,255,0.75)' : '#94a3b8' }}>
                          {timeStr}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Footer */}
              <form onSubmit={handleSend} style={{ padding: '16px 20px', background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px' }}>
                <input 
                  type="text" 
                  value={inputMsg} 
                  onChange={(e) => setInputMsg(e.target.value)} 
                  placeholder={`Write a message to ${activeContact.name}...`}
                  style={{ flex: 1, padding: '10px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                />
                <button 
                  type="submit" 
                  disabled={sending || !inputMsg.trim()}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: (sending || !inputMsg.trim()) ? 'not-allowed' : 'pointer',
                    opacity: (sending || !inputMsg.trim()) ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <i className="ri-send-plane-fill"></i> Send
                </button>
              </form>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              Select a conversation to read and send messages.
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Contact Picker Modal */}
      {showNewChatModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{ background: '#fff', borderRadius: '18px', width: '450px', maxWidth: '90%', padding: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>Select User to Message</h3>
              <i className="ri-close-line" onClick={() => setShowNewChatModal(false)} style={{ fontSize: '24px', cursor: 'pointer', color: '#64748b' }}></i>
            </div>

            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {contacts.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No eligible contacts available.</div>
              ) : (
                contacts.map(c => (
                  <div 
                    key={c.id} 
                    onClick={() => startNewChat(c)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      transition: '0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ 
                      width: '36px', 
                      height: '36px', 
                      borderRadius: '50%', 
                      background: c.role === 'Teacher' ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      fontSize: '14px'
                    }}>
                      {c.name ? c.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b' }}>{c.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{c.role} • {c.email}</div>
                    </div>
                    <i className="ri-chat-1-line" style={{ color: '#2563eb', fontSize: '18px' }}></i>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
