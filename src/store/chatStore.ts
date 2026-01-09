import { create } from "zustand";
import { socketService } from "@/services/sockets/socketService";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderType: "donor" | "requester";
  senderName?: string;
  senderBloodType?: string;
  timestamp: Date;
  requestId: string;
  read: boolean;
  conversationId?: string;
}

interface ChatState {
  isConnected: boolean;
  messages: Message[];
  currentRequestId: string | null;
  currentConversationId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  initializeChat: (requestId: string) => Promise<void>;
  disconnectChat: () => void;
  sendMessage: (text: string) => Promise<void>;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  markMessagesAsRead: (messageIds: string[]) => void;
  clearChat: () => void;
  loadChatHistory: (requestId: string) => Promise<void>;
  clearError: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  isConnected: false,
  messages: [],
  currentRequestId: null,
  currentConversationId: null,
  isLoading: false,
  error: null,

  initializeChat: async (requestId: string) => {
    const { disconnectChat, loadChatHistory } = get();

    disconnectChat();

    try {
      set({ isLoading: true, error: null });

      const { user, token } = useAuthStore.getState();

      if (!user || !token) {
        set({ error: "User not authenticated", isLoading: false });
        return;
      }

      const conversationId = `request_${requestId}`;

      const setupListeners = () => {
        socketService.on("new-message", (messageData: any) => {
          const { messages, currentRequestId } = get();
          
          console.log("New message received:", messageData);
          
          const messageRequestId = messageData.request_id?.toString() || messageData.requestId?.toString();
          if (messageRequestId !== currentRequestId) {
            return;
          }
        
          const newMessage: Message = {
            id: messageData.id?.toString() || messageData.messageId?.toString(),
            text: messageData.text || messageData.message,
            senderId: messageData.sender_id?.toString() || messageData.senderId?.toString(),
            senderType: messageData.sender_type || messageData.senderType,
            senderName: messageData.sender_name || messageData.senderName,
            senderBloodType: messageData.sender_blood_type || messageData.senderBloodType,
            timestamp: new Date(messageData.timestamp),
            requestId: messageRequestId,
            read: messageData.read_status || messageData.read || false,
            conversationId: messageData.conversation_id || messageData.conversationId,
          };
        
          //set({ messages: [...messages, newMessage] }); //this line is causing duplication on messages in ui(not inDB) i will see it later
        });

        socketService.on("messages-read", (data: { messageIds: string[] }) => {
          get().markMessagesAsRead(data.messageIds);
        });

        socketService.on("conversation-joined", (data: any) => {
          console.log("Successfully joined conversation:", data.conversationId);
          set({
            isConnected: true,
            currentRequestId: requestId,
            currentConversationId: data.conversationId,
            error: null,
            isLoading: false,
          });
        });

        socketService.on("chat-history", (history: any[]) => {
          const formattedHistory = history.map((msg) => ({
            id: msg.id?.toString(),
            text: msg.text || msg.message,
            senderId: msg.sender_id?.toString() || msg.senderId?.toString(),
            senderType: msg.sender_type || msg.senderType,
            senderName: msg.sender_name || msg.senderName,
            senderBloodType: msg.sender_blood_type || msg.senderBloodType,
            timestamp: new Date(msg.timestamp),
            requestId: msg.request_id?.toString() || msg.requestId?.toString(),
            read: msg.read_status,
            conversationId: msg.conversation_id || msg.conversationId,
          }));
          set({ messages: formattedHistory });
        });

        socketService.on("join-error", (error: any) => {
          console.error("Failed to join conversation:", error);
          set({ error: error.error || "Failed to join conversation", isLoading: false });
        });

        // Add typing indicators
        socketService.on("user-typing", (data: any) => {
          // Handle typing indicators if needed
          console.log("User typing:", data);
        });

        socketService.on("user-joined", (data: any) => {
          console.log("User joined conversation:", data);
        });

        socketService.on("user-left", (data: any) => {
          console.log("User left conversation:", data);
        });
      };

      setupListeners();

      // Connect socket and join conversation
      const connected = await socketService.connect();
      if (!connected) {
        set({ error: "Failed to connect to chat server", isLoading: false });
        return;
      }

      // Join the conversation room
      const joinSuccess = await socketService.emit("join-conversation", {
        conversationId,
        userId: user.id.toString(),
        requestId: requestId,
      });

      if (!joinSuccess) {
        set({ error: "Failed to join conversation", isLoading: false });
        return;
      }

      // Load existing chat history from API
      await loadChatHistory(requestId);

    } catch (error) {
      console.error("Failed to initialize chat:", error);
      set({ error: "Failed to initialize chat", isLoading: false });
    }
  },

  disconnectChat: () => {
    // Remove socket listeners
    socketService.off("new-message");
    socketService.off("messages-read");
    socketService.off("conversation-joined");
    socketService.off("chat-history");
    socketService.off("join-error");
    socketService.off("user-typing");
    socketService.off("user-joined");
    socketService.off("user-left");

    set({
      isConnected: false,
      currentRequestId: null,
      currentConversationId: null,
    });
  },

  sendMessage: async (text: string) => {
    const { currentRequestId, currentConversationId, messages } = get();
    const { user } = useAuthStore.getState();
  
    if (!currentRequestId || !currentConversationId || !user) {
      console.error("No active conversation or user not authenticated");
      return;
    }
  
    const tempMessageId = Date.now().toString();
    const newMessage: Message = {
      id: tempMessageId,
      text: text.trim(),
      senderId: user.id.toString(),
      senderType: user.userType as "donor" | "requester",
      timestamp: new Date(),
      requestId: currentRequestId,
      read: false,
      conversationId: currentConversationId,
    };
  
    set({ messages: [...messages, newMessage] }); 
  
    try {
      // Send via socket ONLY 
      const sent = await socketService.emit("send-message", {
        conversationId: currentConversationId,
        message: text.trim(),
        senderId: user.id.toString(),
        senderType: user.userType,
        requestId: currentRequestId,
        timestamp: new Date().toISOString(),
      });
  
      if (!sent) {
        throw new Error("Failed to send message via socket");
      }
  
    } catch (error) {
      console.error("❌ Failed to send message:", error);
      // Remove the optimistic message on error
      const { messages } = get();
      set({ 
        messages: messages.filter((msg) => msg.id !== tempMessageId),
        error: "Failed to send message" 
      });
    }
  },

  addMessage: (message: Message) => {
    const { messages } = get();
    set({ messages: [...messages, message] });
  },

  setMessages: (messages: Message[]) => {
    set({ messages });
  },

  markMessagesAsRead: (messageIds: string[]) => {
    const { messages } = get();
    const updatedMessages = messages.map((msg) =>
      messageIds.includes(msg.id) ? { ...msg, read: true } : msg
    );
    set({ messages: updatedMessages });
    
    const res = api.post("/chat/messages/read",  messageIds );
      

      console.log("Response : ",res);
  },

  clearChat: () => {
    set({
      messages: [],
      currentRequestId: null,
      currentConversationId: null,
      isConnected: false,
      error: null,
    });
  },

  loadChatHistory: async (requestId: string) => {
    try {
      console.log("Loading chat history for request:", requestId);
      
      const response = await api.get(`/chat/conversation/request/${requestId}`);
      console.log("Chat history response:", response.data);
  
      if (response.data.status === 'success') {
        console.log("Entered if ");
        
        const history = response.data.data?.messages || response.data.messages || [];
        
        const formattedHistory = history.map((msg: any) => ({
          id: msg.id?.toString(),
          text: msg.text || msg.message,
          senderId: msg.sender_id?.toString() || msg.senderId?.toString(),
          senderType: msg.sender_type || msg.senderType,
          senderName: msg.sender_name || msg.senderName,
          senderBloodType: msg.sender_blood_type || msg.senderBloodType,
          timestamp: new Date(msg.timestamp),
          requestId: msg.request_id?.toString() || msg.requestId?.toString() || requestId,
          read: msg.read_status || msg.read || false,
          conversationId: msg.conversation_id || msg.conversationId,
        }));
  
        console.log(`Loaded messages`, formattedHistory);
        set({ messages: formattedHistory });
      } else {
        throw new Error(response.data.message || 'Failed to load chat history');
      }
    } catch (error: any) {
      console.error("Failed to load chat history:", error);
  
      // Handle specific error cases
      if (error.response?.status === 403) {
        console.warn("User does not have access to this conversation");
        set({ error: "You don't have access to this conversation" });
      } else if (error.response?.status === 404) {
        console.warn("No chat history found for this request");
        // This is normal for new conversations
        set({ messages: [] });
      } else {
        const errorMessage = error.response?.data?.message || "Failed to load chat history";
        set({ error: errorMessage });
      }
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));