// ChatPage.tsx (Next.js 15)
"use client";

import { useEffect, useState } from "react";
import { ChatMessage } from "@/components/chat/chat-message";
import { ContactCard } from "@/components/chat/contact-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStomp } from "@/hooks/use-stomp";
import axios from "axios";

interface Message {
  id: number;
  content: string;
  timestamp: string;
  sender: "user" | "contact";
  read: boolean;
  senderName?: string;
}

interface Contact {
  id: number;
  name: string;
  role: string;
  avatar: string;
  initials: string;
  online: boolean;
  lastSeen: string;
  unreadCount: number;
  isGroup?: boolean;
}

export default function ChatPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newMessage, setNewMessage] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { sendMessage } = useStomp((msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  });

  useEffect(() => {
    axios.get("/api/syncMessages").then(() => {
      axios.get("/api/contacts").then((res) => setContacts(res.data));
    });
  }, []);

  useEffect(() => {
    if (selectedContact) {
      axios
        .get(`/api/getMessages?contactId=${selectedContact.id}`)
        .then((res) => {
          setMessages(res.data);
          axios.post(`/api/markAsRead`, { contactId: selectedContact.id });
        });
    }
  }, [selectedContact]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    const payload = {
      content: newMessage,
      roomId: selectedContact.id,
      sender: "user",
    };

    sendMessage(payload);
    await axios.post("/api/sendMessage", payload);
    setMessages((prev) => [
      ...prev,
      { ...payload, timestamp: new Date().toISOString(), read: false },
    ]);
    setNewMessage("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedContact) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("roomId", selectedContact.id.toString());

    const res = await axios.post("/api/sendMessageWithFile", formData);
    sendMessage(res.data);
    setMessages((prev) => [...prev, res.data]);
  };

  const handleDelete = async (id: number) => {
    await axios.delete(`/api/deleteMessage?id=${id}`);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSearch = async () => {
    if (!selectedContact || !searchTerm.trim()) return;
    const res = await axios.get(
      `/api/searchMessages?contactId=${selectedContact.id}&query=${searchTerm}`
    );
    setMessages(res.data);
  };

  return (
    <div className="flex h-screen">
      <aside className="w-1/3 border-r overflow-y-auto">
        {contacts.map((contact) => (
          <ContactCard
            key={contact.id}
            contact={contact}
            isActive={selectedContact?.id === contact.id}
            onClick={() => setSelectedContact(contact)}
          />
        ))}
      </aside>

      <main className="flex flex-col flex-1">
        <div className="border-b p-4 flex gap-2">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search messages..."
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch}>Search</Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map((msg) => (
            <div key={msg.id} className="relative group">
              <ChatMessage message={msg} isGroup={selectedContact?.isGroup} />
              <button
                onClick={() => handleDelete(msg.id)}
                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 text-xs text-red-500"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        <div className="border-t p-4 flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <input
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            id="upload"
          />
          <label htmlFor="upload">
            <Button variant="outline">📎</Button>
          </label>
          <Button onClick={handleSend}>Send</Button>
        </div>
      </main>
    </div>
  );
}
