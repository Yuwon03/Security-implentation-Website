'use client'
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { loadIdentity } from '@/lib/identity';
import { io } from 'socket.io-client';
import { deriveSharedSecret, deriveKeys, encryptThenMac, decryptThenVerify } from '@/lib/crypto';

interface ChatSummary {
  id: number | string;
  name: string;
}
interface Message {
  sender: string;
  content: string;
  timestamp: string;
}
interface ChatData {
  chat_id: number;
  name: string;
  type: 'group' | 'private';
  participants: string[];
  messages: Message[];
}

export default function Chat() {

  const router = useRouter();
  const [socket, setSocket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [groupChats, setGroupChats] = useState<ChatSummary[]>([])
  const [individualChats, setIndividualChats] = useState<ChatSummary[]>([])
  const [activeChat, setActiveChat] = useState<{
    id: number | string
    type: 'group' | 'private'
    name: string
  }>({ id: '', type: 'group', name: '' })
  const [chatData, setChatData] = useState<Record<string|number, any>>({});
  const [message, setMessage] = useState('');
  const [keyEnc, setKeyEnc] = useState<CryptoKey|null>(null);
  const [keyMac, setKeyMac] = useState<CryptoKey|null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const username = localStorage.getItem('username');
    if (!username) {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    const newSocket = io('https://localhost:8000', {
      path: '/socket.io',
      transports: ['websocket'],
      secure: true
    });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;
    
    const handleNewMessage = async (msg: any) => {
      console.log("New message received:", msg);
      
      // Always update the message in the relevant chat data regardless of active chat
      setChatData(prevChatData => {
        if (!prevChatData[msg.chat_id]) return prevChatData;
        
        const updatedChatData = {...prevChatData};
        const thisChat = {...updatedChatData[msg.chat_id]};
        
        if (thisChat.type === 'private') {
          // For private chats, add message with encryption data that will be decrypted below
          thisChat.messages = [
            ...thisChat.messages,
            {
              sender: msg.sender,
              iv: msg.iv,
              ct: msg.ct, 
              tag: msg.tag,
              timestamp: msg.timestamp
            }
          ];
        } else {
          thisChat.messages = [
            ...thisChat.messages,
            {
              sender: msg.sender,
              content: msg.content,
              timestamp: msg.timestamp
            }
          ];
        }
        
        updatedChatData[msg.chat_id] = thisChat;
        return updatedChatData;
      });

      // Immediately decrypt private messages if needed
      if (msg.iv && msg.ct && msg.tag) {
        const updatedChat = chatData[msg.chat_id];
        if (updatedChat && updatedChat.type === 'private') {
          const username = localStorage.getItem('username') || '';
          const { privKey } = await loadIdentity(username);
          
          const otherUsername = updatedChat.participants.find((p: string) => p !== username);
          if (otherUsername) {
            const pkRes = await fetch(`/api/auth/getPublicKey?username=${encodeURIComponent(otherUsername)}`);
            const pkJson = await pkRes.json();
            const theirPubB64 = pkJson.publicKey;
            
            const shared = await deriveSharedSecret(privKey, theirPubB64);
            const { keyEnc, keyMac } = await deriveKeys(shared);
            
            try {
              const content = await decryptThenVerify(
                keyEnc, keyMac,
                msg.iv, msg.ct, msg.tag
              );
              
              setChatData(prevChatData => {
                const updatedChatData = {...prevChatData};
                const thisChat = {...updatedChatData[msg.chat_id]};
                const messages = [...thisChat.messages];
                
                // Find and update the last message that matches this one
                const lastIdx = messages.length - 1;
                if (lastIdx >= 0 && 
                    messages[lastIdx].sender === msg.sender && 
                    messages[lastIdx].iv === msg.iv) {
                  messages[lastIdx] = {
                    sender: msg.sender,
                    content: content,
                    timestamp: msg.timestamp
                  };
                }
                
                thisChat.messages = messages;
                updatedChatData[msg.chat_id] = thisChat;
                return updatedChatData;
              });
            } catch (error) {
              console.error('Error decrypting message:', error);
            }
          }
        }
      }
    };
    
    socket.on('new_message', handleNewMessage);
    
    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, chatData]);

  useEffect(() => {
    if (!socket || !activeChat) return;
    socket.emit('join', { chat_id: activeChat.id });
  }, [socket, activeChat])

  useEffect(() => {
    const username = localStorage.getItem('username') || '';
    async function fetchChats(){
      try {
        const response = await fetch(`/api/auth/chats?username=${encodeURIComponent(username)}`)
        const data = (await response.json()) as ChatData[];
        
        if (!response.ok) {
          throw new Error((data as any).error || 'Failed to fetch chats');
        }

        console.log(data)

        const groups: ChatSummary[] = []
        const privates: ChatSummary[] = []
        const map: Record<number | string, ChatData> = {}
        const { privKey } = await loadIdentity(username)

        for (const chat of data) {
          let msgs: Message[] = []

          if (chat.type === 'private') {
            const other = chat.participants.find((p) => p !== username)!
            const pkRes = await fetch(`/api/auth/getPublicKey?username=${encodeURIComponent(other)}`)
            const pkJson = await pkRes.json();
            console.log(pkJson);
            const theirPubB64 = pkJson.publicKey;
            const shared = await deriveSharedSecret(privKey, theirPubB64)
            const { keyEnc, keyMac } = await deriveKeys(shared)

            msgs = await Promise.all(
              chat.messages.map(async (m:any) => {
                const content = await decryptThenVerify(
                  keyEnc, keyMac,
                  m.iv, m.ct, m.tag
                )
                return {
                  sender:    m.sender,
                  content,
                  timestamp: m.timestamp
                }
              })
            )
          } else {
            msgs = chat.messages.map((m:any) => ({
              sender:    m.sender,
              content:   m.content,
              timestamp: m.timestamp
            }))
          }

          const displayName = chat.type === 'private'
          ? chat.participants.find((p:string) => p !== username)!
          : chat.name

          map[chat.chat_id] = {
            chat_id:       chat.chat_id,
            name:     displayName,
            type:     chat.type,
            participants: chat.participants,
            messages:     msgs
          }
          if (chat.type === 'group') {
            groups.push({ id: chat.chat_id, name: displayName })
          } else {
            privates.push({ id: chat.chat_id, name: displayName })
          }
        }
        console.log(map)
        console.log(groups)
        console.log(privates)
        setGroupChats(groups)
        setIndividualChats(privates)
        setChatData(map)

        if (groups.length) {
          setActiveChat({ id: groups[0].id, type: 'group', name: groups[0].name })
        } else if (privates.length) {
          setActiveChat({ id: privates[0].id, type: 'private', name: privates[0].name })
        }

      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChats();
  }, []);

  useEffect(() => {
    if (!activeChat || activeChat.type !== 'private') return

    ;(async () => {
      const myUsername = localStorage.getItem('username') || '';
      const otherUsername = chatData[activeChat.id]?.participants.find((p:string) => p !== myUsername);
      if (!otherUsername) return;

      const { privKey } = await loadIdentity(myUsername)
      const res = await fetch(`/api/auth/getPublicKey?username=${encodeURIComponent(otherUsername)}`)
      const pkJson = await res.json();
      const theirPubB64 = pkJson.publicKey;

      const shared = await deriveSharedSecret(privKey, theirPubB64)
      const { keyEnc, keyMac } = await deriveKeys(shared)

      setKeyEnc(keyEnc)
      setKeyMac(keyMac)
    })()
  }, [activeChat, chatData])

  // Effect to scroll to bottom when messages change or active chat changes
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [chatData, activeChat.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
  
    const username = localStorage.getItem('username') || '';
  
    try {
      if (activeChat.type === 'private') {
        if (!keyEnc || !keyMac || !activeChat) return
        const { iv, ct, tag } = await encryptThenMac(keyEnc, keyMac, message)
        const response = await fetch(`/api/auth/sendmessagee2ee`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ chatId: activeChat.id, username: username, iv, ct, tag })
        
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to send message');
        }
      } else{
        // For group chats, send the message as is
        const response = await fetch(`/api/auth/sendmessageplain`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ chatId: activeChat.id, username: username, message: message })
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to send message');
        }
      }
  
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <header className="flex justify-between items-center p-4 border-b">
        <span className="font-medium text-lg text-indigo-700">Messages</span>
        <button
          onClick={() => router.push('/home/chat/addchat')}
          className="text-sm border border-indigo-300 px-3 py-1 rounded-sm text-indigo-700 hover:bg-indigo-50"
        >
          Add Chat
        </button>
      </header>

      {/* Main Content - Chat Interface */}
      <main className="flex flex-1 overflow-hidden">
        {/* Sidebar with group and individual chats */}
        <div className="w-64 border-r overflow-y-auto bg-gray-50">
          {/* Group Chats Section */}
          <div className="p-4 border-b">
            <h2 className="text-sm font-medium text-gray-600 mb-2">Group Chats</h2>
            <ul className="space-y-1">
              {groupChats.map((chat) => (
                <li
                  key={chat.id}
                  className={`px-3 py-2 text-sm cursor-pointer ${
                    activeChat.name === chat.name && activeChat.type === "group"
                      ? "bg-indigo-50 border-l-2 border-indigo-400 text-indigo-700"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveChat({ id: chat.id, type: "group", name: chat.name })}
                >
                  {chat.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 border-b">
            <h2 className="text-sm font-medium text-gray-600 mb-2">Direct Messages</h2>
            <ul className="space-y-1">
              {individualChats.map((chat) => (
                <li
                  key={chat.id}
                  className={`px-3 py-2 text-sm cursor-pointer ${
                    activeChat.name === chat.name && activeChat.type === "private"
                      ? "bg-indigo-50 border-l-2 border-indigo-400 text-indigo-700"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveChat({ id: chat.id, type: "private", name: chat.name })}
                >
                  {chat.name}
                </li>
              ))}
            </ul>
          </div>

          {/* Task Management */}
          <div className="p-4">
            <button 
              onClick={() => router.push('/home/chat/task')}
              className="w-full text-sm text-indigo-700 py-2 border border-indigo-400 hover:bg-indigo-50"
            >
              View Tasks
            </button>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat header */}
          <div className="border-b p-3 flex items-center bg-gray-50">
            <div>
              <h2 className="font-medium text-indigo-700">{activeChat.name}</h2>
              <p className="text-xs text-gray-500">
                {activeChat.type === "group" ? "Group Chat" : "Direct Message"}
                {activeChat.type === "group" && chatData[activeChat.id]?.participants && (
                  <span className="ml-2 text-xs text-gray-400">
                    Members: {chatData[activeChat.id].participants.join(', ')}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Message list */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 max-h-[calc(100vh-220px)]"
          >
            {(chatData[activeChat.id]?.messages || []).map((message: Message, index: number) => {
              const myUsername = typeof window !== "undefined" ? localStorage.getItem('username') : '';
              const isMine = message.sender === myUsername;
              return (
                <div
                  key={index}
                  className={`flex gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs p-2 rounded-sm ${
                    isMine 
                      ? 'bg-indigo-100 border border-indigo-200' 
                      : 'bg-white border border-gray-300 shadow-sm'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium ${isMine ? 'text-indigo-700' : 'text-gray-700'}`}>
                        {message.sender}
                      </span>
                      <span className="text-xs text-gray-400">{new Date(message.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className={`text-sm ${isMine ? 'text-indigo-900' : 'text-gray-800'}`}>{message.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          <form onSubmit={handleSubmit} className="border-t p-3 bg-gray-50">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-gray-300 text-sm bg-white"
              />
              <button 
                type="submit" 
                className="px-4 py-2 border border-indigo-400 text-sm text-indigo-700 hover:bg-indigo-50"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

