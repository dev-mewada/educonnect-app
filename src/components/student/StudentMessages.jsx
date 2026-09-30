import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function StudentMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [convRes, contactsRes] = await Promise.all([
        api.getConversations(),
        api.getMessageContacts()
      ]);

      if (contactsRes?.success && Array.isArray(contactsRes.data)) {
        setContacts(contactsRes.data);
      }

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
      } else if (contactsRes?.success && contactsRes.data.length > 0 && !activeContact) {
        const first = contactsRes.data[0];
        setActiveContact({
          id: first.id,
          name: first.name,
          role: first.role,
          email: first.email
        });
      }
    } catch (err) {
      console.error('Error loading student messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
        console.error('Error fetching message thread:', err);
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
    if (!inputText.trim() || !activeContact?.id || sending) return;

    const text = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const res = await api.sendMessage(activeContact.id, text);
      if (res?.success && res.data) {
        setMessages(prev => [...prev, res.data]);
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

  return (
    <div style={{ marginTop: '25px', animation: 'fadeUp 0.3s ease' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', color: '#1e293b', margin: '0 0 6px' }}>Instructor & Admin Messaging 💬</h2>
        <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Connect 1-on-1 with instructors and administrators in real-time, saved securely in MySQL.</p>
      </div>

      <div style={{
        display: 'flex',
        height: '560px',
        background: '#fff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}>
        {/* Contact list */}
        <div style={{ width: '280px', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <h4 style={{ margin: 0, fontSize: '14px', color: '#475569' }}>Contacts ({contacts.length})</h4>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>Loading contacts...</div>
            ) : contacts.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>No contacts available.</div>
            ) : (
              contacts.map(c => {
                const isSelected = activeContact?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveContact({ id: c.id, name: c.name, role: c.role, email: c.email })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      background: isSelected ? '#eff6ff' : 'transparent',
                      borderLeft: isSelected ? '4px solid #3b82f6' : '4px solid transparent'
                    }}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: c.role === 'Admin' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      fontSize: '14px'
                    }}>
                      {c.name ? c.name.charAt(0).toUpperCase() : 'U'}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h5 style={{ margin: '0 0 2px', fontSize: '13px', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.name}
                      </h5>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        {c.role}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {activeContact ? (
            <>
              {/* Chat header */}
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: activeContact.role === 'Admin' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
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
                  <h4 style={{ margin: '0 0 2px', fontSize: '15px', color: '#1e293b' }}>{activeContact.name}</h4>
                  <span style={{ fontSize: '12px', color: '#10b981' }}>{activeContact.role} • {activeContact.email}</span>
                </div>
              </div>

              {/* Messages list */}
              <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {loadingMsgs ? (
                  <div style={{ textAlign: 'center', color: '#64748b', padding: '30px', fontSize: '13px' }}>Loading messages from database...</div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#64748b', padding: '30px', fontSize: '13px' }}>No conversation yet. Send a message to get in touch!</div>
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
                          background: isMe ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : '#fff',
                          color: isMe ? '#fff' : '#1e293b',
                          padding: '12px 16px',
                          borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                          fontSize: '13px',
                          lineHeight: 1.5
                        }}
                      >
                        <p style={{ margin: 0 }}>{m.message}</p>
                        <span style={{ display: 'block', fontSize: '10px', textAlign: 'right', marginTop: '4px', color: isMe ? 'rgba(255,255,255,0.75)' : '#94a3b8' }}>
                          {timeStr}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat input */}
              <form onSubmit={handleSend} style={{ padding: '16px 20px', background: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder={`Ask a question or reply to ${activeContact.name}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
                <button
                  type="submit"
                  disabled={sending || !inputText.trim()}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    background: '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: (sending || !inputText.trim()) ? 'not-allowed' : 'pointer',
                    opacity: (sending || !inputText.trim()) ? 0.7 : 1,
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
              Select a contact to start messaging.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
