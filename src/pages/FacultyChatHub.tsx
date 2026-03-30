import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getProfileAvatarUrl } from '@/utils/avatarUtils';
import { ArrowLeft, MoreVertical, Send } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

interface FacultyMeta {
  id: string;
  full_name: string;
  email: string;
  department?: string;
  avatar_url?: string | null;
  updated_at?: string;
}
interface MessageRow {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

const MOCK_FACULTIES: FacultyMeta[] = [
  {
    id: 'f1',
    full_name: 'Dr. Aarti Mehra',
    email: 'aarti.mehra@univ.edu',
    department: 'CSE',
    updated_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    avatar_url: null,
  },
  {
    id: 'f2',
    full_name: 'Prof. Rahul Verma',
    email: 'rahul.verma@univ.edu',
    department: 'ECE',
    updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    avatar_url: null,
  },
  {
    id: 'f3',
    full_name: 'Dr. Neha Kapoor',
    email: 'neha.kapoor@univ.edu',
    department: 'AIML',
    updated_at: new Date(Date.now() - 24 * 3600 * 1000 + 300000).toISOString(),
    avatar_url: null,
  },
];

const CNV_KEY = (id: string) => `fac_contacts_${id}`;

const FacultyChatHub: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user } = useAuth();
  const { profile } = useProfile();
  const myId = profile?.id ?? '';
  const [searchParams] = useSearchParams();

  const [faculties, setFaculties] = useState<FacultyMeta[]>([]);
  const [conversations, setConversations] = useState<string[]>([]);
  const [activePeerId, setActivePeerId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [search, setSearch] = useState('');
  const [showListMobile, setShowListMobile] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const chatRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(
            'id, full_name, email, updated_at, role, avatar_url, department'
          )
          .eq('role', 'faculty');
        if (error) {
          setFaculties(MOCK_FACULTIES);
          return;
        }
        const metas = (data || []).map((p: any) => ({
          id: p.id,
          full_name: p.full_name,
          email: p.email,
          updated_at: p.updated_at,
          avatar_url: p.avatar_url,
          department: p.department,
        })) as FacultyMeta[];
        setFaculties(metas.length ? metas : MOCK_FACULTIES);
      } catch {
        setFaculties(MOCK_FACULTIES);
      }
    })();
  }, []);

  useEffect(() => {
    if (!myId) return;
    (async () => {
      try {
        const { data } = await supabase
          .from('messages')
          .select('sender_id, receiver_id, created_at')
          .or(`sender_id.eq.${myId},receiver_id.eq.${myId}`)
          .order('created_at', { ascending: false });
        const peers = new Set<string>();
        (data || []).forEach((m: any) => {
          peers.add(m.sender_id === myId ? m.receiver_id : m.sender_id);
        });
        const convs = Array.from(peers);
        const fallback = MOCK_FACULTIES.map(f => f.id);
        let stored: string[] = [];
        try {
          stored = JSON.parse(localStorage.getItem(CNV_KEY(myId)) || '[]');
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
          /* ignore */
        }
        const urlPeer = searchParams.get('peer') || '';
        const merged = Array.from(
          new Set(
            [...(convs.length ? convs : fallback), ...stored, urlPeer].filter(
              Boolean
            )
          )
        );
        setConversations(merged);
        if (urlPeer) {
          try {
            const key = CNV_KEY(myId);
            const prev: string[] = JSON.parse(
              localStorage.getItem(key) || '[]'
            );
            if (!prev.includes(urlPeer))
              localStorage.setItem(key, JSON.stringify([urlPeer, ...prev]));
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (err) {
            /* ignore */
          }
          setActivePeerId(urlPeer);
          setShowListMobile(false);
        } else if (!activePeerId && merged[0]) setActivePeerId(merged[0]);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        /* ignore */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myId, searchParams]);

  useEffect(() => {
    if (!myId || !activePeerId) {
      setMessages([]);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${myId},receiver_id.eq.${activePeerId}),and(sender_id.eq.${activePeerId},receiver_id.eq.${myId})`
        )
        .order('created_at', { ascending: true });
      setMessages((data as MessageRow[]) || []);

      // Mark messages as read when opening the chat
      const unreadIds = (data || [])
        .filter(m => m.receiver_id === myId && !m.read_at)
        .map(m => m.id);
      if (unreadIds.length > 0) {
        await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .in('id', unreadIds);
        // Update unread counts
        setUnreadCounts(prev => ({
          ...prev,
          [activePeerId]: 0,
        }));
      }

      setTimeout(
        () =>
          chatRef.current?.scrollTo({
            top: chatRef.current.scrollHeight,
            behavior: 'smooth',
          }),
        30
      );
    })();
  }, [myId, activePeerId]);

  // Real-time subscription for messages
  useEffect(() => {
    if (!myId) return;

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(sender_id.eq.${myId},receiver_id.eq.${myId})`,
        },
        payload => {
          const newMessage = payload.new as MessageRow;

          // If this is the active conversation, add to messages
          if (
            activePeerId &&
            (newMessage.sender_id === activePeerId ||
              newMessage.receiver_id === activePeerId)
          ) {
            setMessages(prev => [...prev, newMessage]);
            setTimeout(
              () =>
                chatRef.current?.scrollTo({
                  top: chatRef.current.scrollHeight,
                  behavior: 'smooth',
                }),
              30
            );

            // Mark as read if we're the receiver
            if (newMessage.receiver_id === myId) {
              supabase
                .from('messages')
                .update({ read_at: new Date().toISOString() })
                .eq('id', newMessage.id);
            }
          }

          // Update unread counts
          if (newMessage.receiver_id === myId) {
            const senderId = newMessage.sender_id;
            setUnreadCounts(prev => ({
              ...prev,
              [senderId]: (prev[senderId] || 0) + 1,
            }));
          }
        }
      )
      .subscribe(() => {});

    return () => {
      supabase.removeChannel(channel);
    };
  }, [myId, activePeerId]);

  // Fallback polling mechanism (every 3 seconds)
  useEffect(() => {
    if (!myId || !activePeerId) return;

    const pollMessages = async () => {
      try {
        const { data } = await supabase
          .from('messages')
          .select('*')
          .or(
            `and(sender_id.eq.${myId},receiver_id.eq.${activePeerId}),and(sender_id.eq.${activePeerId},receiver_id.eq.${myId})`
          )
          .order('created_at', { ascending: true });

        if (data) {
          setMessages(data as MessageRow[]);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    // Poll every 3 seconds as fallback
    const interval = setInterval(pollMessages, 3000);

    return () => clearInterval(interval);
  }, [myId, activePeerId]);

  // Load unread counts for all conversations
  useEffect(() => {
    if (!myId) return;

    (async () => {
      const { data } = await supabase
        .from('messages')
        .select('sender_id, receiver_id, read_at')
        .eq('receiver_id', myId)
        .is('read_at', null);

      const counts: Record<string, number> = {};
      (data || []).forEach(msg => {
        counts[msg.sender_id] = (counts[msg.sender_id] || 0) + 1;
      });
      setUnreadCounts(counts);
    })();
  }, [myId]);

  const peers = useMemo(() => {
    const byId = new Map(faculties.map(f => [f.id, f]));
    return conversations.map(
      id =>
        byId.get(id) ?? {
          id,
          full_name: 'Faculty',
          email: '',
          department: undefined,
          avatar_url: null,
          updated_at: undefined,
        }
    );
  }, [faculties, conversations]);
  const filteredPeers = useMemo(() => {
    const q = search.toLowerCase();
    return peers.filter(
      f =>
        f.full_name.toLowerCase().includes(q) ||
        (f.department || '').toLowerCase().includes(q)
    );
  }, [peers, search]);

  const activePeer = useMemo(
    () => faculties.find(f => f.id === activePeerId) || null,
    [faculties, activePeerId]
  );

  const sendMessage = async () => {
    if (!myId || !activePeerId || !newMsg.trim()) return;
    const content = newMsg.trim();
    setNewMsg('');
    const { data, error } = await supabase
      .from('messages')
      .insert({ sender_id: myId, receiver_id: activePeerId, content })
      .select()
      .maybeSingle();
    if (!error && data) {
      setMessages(ms => [...ms, data as any]);
      setTimeout(
        () =>
          chatRef.current?.scrollTo({
            top: chatRef.current!.scrollHeight,
            behavior: 'smooth',
          }),
        20
      );
    }
  };

  const mobileToChat = () => {
    setShowListMobile(false);
  };
  const mobileToList = () => {
    setShowListMobile(true);
  };

  useEffect(() => {
    if (!activePeerId) return;
    if (faculties.some(f => f.id === activePeerId)) return;
    (async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name, email, department, avatar_url, updated_at')
          .eq('id', activePeerId)
          .maybeSingle();
        if (data) {
          setFaculties(prev => [
            ...prev,
            {
              id: data.id,
              full_name: data.full_name || 'Faculty',
              email: data.email || '',
              department: data.department,
              avatar_url: data.avatar_url,
              updated_at: data.updated_at,
            },
          ]);
        } else {
          setFaculties(prev => [
            ...prev,
            {
              id: activePeerId,
              full_name: 'Faculty',
              email: '',
              department: undefined,
              avatar_url: null,
              updated_at: new Date().toISOString(),
            },
          ]);
        }
      } catch {
        setFaculties(prev => [
          ...prev,
          {
            id: activePeerId,
            full_name: 'Faculty',
            email: '',
            department: undefined,
            avatar_url: null,
            updated_at: new Date().toISOString(),
          },
        ]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePeerId]);

  return (
    <div className='min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-[#0b1020]'>
      <div className='max-w-7xl mx-auto p-4 grid grid-cols-12 gap-4'>
        {/* Contacts list */}
        <section
          className={`col-span-12 md:col-span-4 ${showListMobile ? '' : 'hidden md:block'}`}
        >
          <Card className='h-[75vh] flex flex-col'>
            <CardHeader className='pb-3'>
              <CardTitle>Conversations</CardTitle>
              <div className='mt-2'>
                <Input
                  placeholder='Search'
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className='flex-1 overflow-auto p-0'>
              <div className='divide-y'>
                {filteredPeers.map(p => {
                  const unreadCount = unreadCounts[p.id] || 0;
                  return (
                    <button
                      key={p.id}
                      className={`w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-[#131a3b] ${activePeerId === p.id ? 'bg-gray-50 dark:bg-[#131a3b]' : ''}`}
                      onClick={() => {
                        setActivePeerId(p.id);
                        mobileToChat();
                      }}
                    >
                      <div className='flex items-center gap-3'>
                        <div className='relative'>
                          <Avatar className='h-9 w-9'>
                            <AvatarImage
                              src={getProfileAvatarUrl({
                                avatar_url: p.avatar_url,
                                full_name: p.full_name,
                                role: 'faculty',
                              })}
                              alt={p.full_name}
                            />
                            <AvatarFallback>
                              {p.full_name.slice(0, 1)}
                            </AvatarFallback>
                          </Avatar>
                          {unreadCount > 0 && (
                            <div className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium'>
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </div>
                          )}
                        </div>
                        <div className='min-w-0 flex-1'>
                          <div className='font-medium truncate'>
                            {p.full_name}
                          </div>
                          <div className='text-xs text-muted-foreground truncate'>
                            {p.department || '—'}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
                {!filteredPeers.length && (
                  <div className='p-4 text-sm text-muted-foreground'>
                    No contacts.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Active chat */}
        <section
          className={`col-span-12 md:col-span-8 ${showListMobile ? 'hidden md:block' : ''}`}
        >
          <Card className='h-[75vh] flex flex-col'>
            <CardHeader className='flex flex-row items-center justify-between'>
              <div className='flex items-center gap-3'>
                <Button
                  variant='ghost'
                  size='icon'
                  className='md:hidden'
                  onClick={mobileToList}
                  aria-label='Back'
                >
                  <ArrowLeft className='h-4 w-4' />
                </Button>
                {activePeerId ? (
                  <>
                    <Avatar className='h-8 w-8'>
                      <AvatarImage
                        src={getProfileAvatarUrl({
                          avatar_url: activePeer?.avatar_url,
                          full_name: activePeer?.full_name,
                          role: 'faculty',
                        })}
                        alt={activePeer?.full_name || 'Faculty'}
                      />
                      <AvatarFallback>
                        {(activePeer?.full_name || 'F').slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className='font-medium leading-tight'>
                        {activePeer?.full_name || 'Faculty'}
                      </div>
                      <div className='text-xs text-muted-foreground -mt-0.5'>
                        {activePeer?.department || '—'}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className='font-medium'>Select a conversation</div>
                )}
              </div>
              <div>
                <Button variant='ghost' size='icon' aria-label='More'>
                  <MoreVertical className='h-4 w-4' />
                </Button>
              </div>
            </CardHeader>
            <CardContent className='flex-1 flex flex-col p-0'>
              <div
                ref={chatRef}
                className='flex-1 overflow-auto space-y-2 p-3 bg-gray-50 dark:bg-[#0f1530]'
              >
                {messages.map(m => {
                  const mine = m.sender_id === myId;
                  return (
                    <div
                      key={m.id}
                      className={`flex ${mine ? 'justify-end' : ''}`}
                    >
                      <div
                        className={`max-w-[75%] rounded px-3 py-2 text-sm shadow ${mine ? 'bg-blue-600 text-white' : 'bg-white dark:bg-[#0b1020] border'}`}
                      >
                        <div>{m.content}</div>
                        <div className='mt-1 text-[10px] opacity-80 text-right flex items-center gap-1 justify-end'>
                          <span>
                            {new Date(m.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span aria-label={m.read_at ? 'Read' : 'Sent'}>
                            {m.read_at ? '✓✓' : '✓'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {!messages.length && (
                  <div className='text-sm text-muted-foreground text-center mt-8'>
                    No messages yet.
                  </div>
                )}
              </div>
              <div className='p-3 flex items-center gap-2 border-t bg-white/70 dark:bg-transparent'>
                <Input
                  placeholder={
                    !activePeerId ? 'Select a contact' : 'Type a message...'
                  }
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value)}
                  disabled={!activePeerId}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!activePeerId || !newMsg.trim()}
                  aria-label='Send'
                >
                  <Send className='h-4 w-4' />
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      <Link to='/faculty/community' className='fixed bottom-6 left-6'>
        <Button variant='outline'>Back to Directory</Button>
      </Link>
    </div>
  );
};

export default FacultyChatHub;
