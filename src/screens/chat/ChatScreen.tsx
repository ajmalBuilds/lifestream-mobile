import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  LayoutAnimation,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Header from "@/components/common/Header";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { SendHorizonal, RefreshCw, Check, ChevronDownCircle, ChevronUpCircle, ChevronDown, ChevronUp, Trash2, Copy, EllipsisVertical, X } from "lucide-react-native";
import { useChatStore } from "@/store/chatStore";
import { useAuthStore } from "@/store/authStore";
import { userAPI } from "@/services/api"

type RootStackParamList = {
  RequestDetails: {
    requestId: string;
    urgency?: string;
    bloodType?: string;
    patientName?: string;
    unitsNeeded?: number;
    createdAt?: string;
    hospital?: string;
    latitude: number;
    longitude: number;
    isFromUserRequests: boolean;
  };
  ChatScreen: {
    requestId: string;
    urgency?: string;
    bloodType?: string;
    patientName?: string;
    unitsNeeded?: number;
    createdAt?: string;
    hospital?: string;
    latitude: number;
    longitude: number;
    isFromUserRequests: boolean;
  };
};

type ChatScreenRouteProp = RouteProp<RootStackParamList, "ChatScreen">;
type ChatScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ChatScreen"
>;

interface Props {
  route: ChatScreenRouteProp;
  navigation: ChatScreenNavigationProp;
}

const ChatScreen: React.FC<Props> = ({ route, navigation }) => {
  const {
    requestId,
    urgency,
    bloodType,
    patientName,
    unitsNeeded,
    createdAt,
    hospital,
    latitude,
    longitude,
    isFromUserRequests,
  } = route.params;

  const {
    messages,
    isConnected,
    isLoading,
    error,
    initializeChat,
    disconnectChat,
    sendMessage,
    markMessagesAsRead,
    clearError,
  } = useChatStore();

  const { user } = useAuthStore();
  const [inputText, setInputText] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const [isRequestDetailsCollapsed, setIsRequestDetailsCollapsed] = useState(true);
  const [isMessageSelectActive, setIsMessageSelectActive] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);

  const chatSuggestions = [
    "On My Way",
    "Running 10 mins late",
    "Is there any specific instructions?",
    "What are the hospital visiting hours?",
    "Do I need to bring any documents?",
  ];

  // Initialize chat when component mounts
  useEffect(() => {
    if (requestId) {
      initializeChat(requestId);
      console.log("Messages :", messages);
    }

    // Cleanup on unmount
    return () => {
      disconnectChat();
    };
  }, [requestId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });

    // Mark messages as read when viewing them
    const unreadMessages = messages
      .filter((msg) => !msg.read && msg.senderId !== user?.id?.toString())
      .map((msg) => msg.id);

    if (unreadMessages.length > 0) {
      markMessagesAsRead(unreadMessages);
    }
  }, [messages]);

  // Show error alerts
  useEffect(() => {
    if (error) {
      Alert.alert("Chat Error", error, [{ text: "OK", onPress: clearError }]);
    }
  }, [error]);

  const handleToggleRequestDetails = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsRequestDetailsCollapsed((prev) => !prev);
  };

  const handleSendMessage = () => {
    if (inputText.trim() && isConnected) {
      sendMessage(inputText);
      setInputText("");
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    if (isConnected) {
      sendMessage(suggestion);
    }
  };

  const handleRetryConnection = () => {
    initializeChat(requestId);
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isUserMessage = (message: any) => {
    return message.senderId === user?.id?.toString();
  };

  const getMessageStyle = (message: any) => {
    return isUserMessage(message) ? styles.userBubble : styles.otherBubble;
  };

  const getTextStyle = (message: any) => {
    return isUserMessage(message) ? styles.userText : styles.otherText;
  };

  const getUserProfileCardRandomBackground = (senderName: string) => {
    const colors = ["#F87171", "#34D399", "#60A5FA", "#FBBF24", "#A78BFA"];
    const charCodeSum = senderName
      .split("")
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charCodeSum % colors.length];
  };

  const isMessageSelected = (messageId: string) => {
    return selectedMessages.includes(messageId);
  };

  const handleSelectMessage = (messageId: string) => {
    if (isMessageSelectActive) {
      if (isMessageSelected(messageId)) {
        setSelectedMessages((prev) => prev.filter((id) => id !== messageId));
      } else {
        setSelectedMessages((prev) => [...prev, messageId]);
      }
    }
  };

  const handleDeleteChat = ([messageIds] : string[]) => {
    Alert.alert("Delete Messages", "Are you sure you want to delete the selected messages?", [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: () => { setSelectedMessages([]); setIsMessageSelectActive(false); } }]);
  };

  const handleCopyChat = ([messageIds] : string[]) => {
    Alert.alert("Copy Messages", "Selected messages copied to clipboard.", [{ text: "OK" }]);
  };

  useEffect(() => {
    if (selectedMessages.length === 0) {
      setIsMessageSelectActive(false);
    }
  }, [selectedMessages]);

  const loadDonorProfile = (donorId: string) => {
    const res = userAPI.getDonorById(donorId);
    console.log("Donor Profile: ", res);
  };

  useEffect(() => {
    const donorId = messages.at(0)?.senderId;
    if (donorId) {
    loadDonorProfile(donorId);
    }
  },[])

  return (
    <>
      <Header title="Chat" backgroundColor="#F8F6F6" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.container}>
          {/* Request Details Card */}
          <View style={styles.card}>
            <Text style={styles.requestIdText}>Request ID: {requestId}</Text>
            { isRequestDetailsCollapsed ? (<View style={{ height: 0, overflow: "hidden"}}>
              </View>) : (<View style={{ overflow: "hidden", gap: 8}}><Text style={styles.detailText}>
              Patient: {patientName || "Not specified"}
            </Text>
            <Text style={styles.detailText}>
              Blood Type: {bloodType || "Not specified"}
            </Text>
            <Text style={styles.detailText}>
              Units Needed: {unitsNeeded || "Not specified"}
            </Text>
            <Text style={styles.detailText}>
              Hospital: {hospital || "Not specified"}
            </Text>
            {createdAt && (
              <Text style={styles.detailText}>
                Created: {new Date(createdAt).toLocaleDateString()}
              </Text>)}
              </View>)}
            <View style={styles.connectionStatus}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isConnected ? "#10B981" : "#EF4444" },
                ]}
              />
              <Text style={styles.statusText}>
                {isConnected ? "Connected" : "Connecting..."}
              </Text>
              {isLoading && (
                <ActivityIndicator
                  size="small"
                  color="#D30000"
                  style={styles.loadingIndicator}
                />
              )}
              {!isConnected && !isLoading && (
                <TouchableOpacity
                  onPress={handleRetryConnection}
                  style={styles.retryButton}
                >
                  <RefreshCw size={14} color="#D30000" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }} onPress={handleToggleRequestDetails}>
              {isRequestDetailsCollapsed ? <ChevronDown size={30}/> : <ChevronUp size={30}/>}
            </TouchableOpacity>
          </View>

          {/* Chat Messages Area */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.chatContainer}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
          >
            {!isConnected && !isLoading && (
              <View style={styles.connectionBanner}>
                <ActivityIndicator size="small" color="#D30000" />
                <Text style={styles.connectionText}>Connecting to chat...</Text>
                <TouchableOpacity
                  onPress={handleRetryConnection}
                  style={styles.retryButton}
                >
                  <RefreshCw size={16} color="#D30000" />
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.chatInfo}>
              You are now connected with{" "}
              {isFromUserRequests
                ? "Responded Donors"
                : hospital || "the requester"}
              .{"\n"}
              Please coordinate the final details for donation.
            </Text>

            {messages.map((message) => (
              <TouchableOpacity
                key={message.id}
                style={[
                  styles.messageContainer,
                  isUserMessage(message) && { flexDirection: "row-reverse" },
                  isMessageSelected(message.id) && {
                    backgroundColor: "#aCd8a7",
                    borderRadius: 8,
                  },
                ]}
                onLongPress={() => {
                  setIsMessageSelectActive(true);
                  setSelectedMessages((prev) => [...prev, message.id]);
                }}
                onPress={() => handleSelectMessage(message.id)}
                activeOpacity={0.7}
              >
                <TouchableOpacity
                  style={[
                    styles.userProfileCard,
                    {
                      backgroundColor: getUserProfileCardRandomBackground(
                        message.senderName || "User"
                      ),
                    },
                  ]}
                >
                  <Text
                    style={{ fontSize: 18, fontWeight: "500", color: "black" }}
                  >
                    {message.senderName
                      ? message.senderName.charAt(0).toUpperCase()
                      : "U"}
                  </Text>
                </TouchableOpacity>
                <View style={[styles.messageBubble, getMessageStyle(message)]}>
                  <Text style={getTextStyle(message)}>{message.text}</Text>
                  <View style={styles.messageFooter}>
                    <Text
                      style={[
                        styles.timestamp,
                        isUserMessage(message) && styles.userTimestamp,
                      ]}
                    >
                      {formatTime(message.timestamp)}
                    </Text>
                    {message.read && isUserMessage(message) && (
                      <Text style={styles.readReceipt}>✓✓</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {messages.length === 0 && !isLoading && isConnected && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No messages yet. Start the conversation!
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Message Input Area */}
          <View style={styles.inputContainer}>
            {isMessageSelectActive ? (
              <View style={{ paddingTop: 10, display: "flex", flexDirection: "row", justifyContent: "space-around", alignItems: "center" }}>
                <Text
                  style={{ textAlign: "center", fontSize: 18, fontWeight: 500 }}
                >
                  {selectedMessages.length} Selected
                </Text>
                <TouchableOpacity onPress={() => handleDeleteChat(selectedMessages)}><Trash2 size={24} color={"#D30000"}/></TouchableOpacity>
                <TouchableOpacity onPress={() => handleCopyChat(selectedMessages)}><Copy size={24}/></TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedMessages([])}><X size={24}/></TouchableOpacity>
              </View>
            ) : (
              <ScrollView
                horizontal
                style={styles.suggestionsContainer}
                contentContainerStyle={styles.suggestionsContent}
                showsHorizontalScrollIndicator={false}
              >
                {chatSuggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.suggestionTextBubble,
                      !isConnected && styles.suggestionDisabled,
                    ]}
                    onPress={() => handleSuggestionPress(suggestion)}
                    disabled={!isConnected}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <View style={styles.inputBoxContainer}>
              <TextInput
                placeholder={
                  isConnected ? "Type a message..." : "Connecting..."
                }
                style={[
                  styles.inputBox,
                  !isConnected && styles.inputBoxDisabled,
                  isMessageSelectActive && { display: "none"}
                ]}
                multiline
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleSendMessage}
                placeholderTextColor="#9ca3af"
                editable={isConnected}
                maxLength={500}
                
              />
              <TouchableOpacity
                style={[
                  styles.enterKey,
                  (!isConnected || !inputText.trim()) &&
                    styles.enterKeyDisabled,
                  isMessageSelectActive && { display: "none"}
                ]}
                onPress={handleSendMessage}
                disabled={!isConnected || !inputText.trim()}
              >
                <SendHorizonal color={"white"} size={20} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F6F6",
  },
  card: {
    backgroundColor: "white",
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    gap: 8,
  },
  requestIdText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  connectionStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: "#6b7280",
    marginRight: 8,
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
  },
  chatContent: {
    padding: 16,
    paddingBottom: 8,
  },
  connectionBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF3F2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  connectionText: {
    fontSize: 14,
    color: "#D30000",
    marginLeft: 8,
    marginRight: 12,
  },
  retryText: {
    fontSize: 14,
    color: "#D30000",
    marginLeft: 4,
    fontWeight: "600",
  },
  chatInfo: {
    fontSize: 12,
    color: "grey",
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 18,
  },
  messageContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
    paddingHorizontal: 5,
  },
  userProfileCard: {
    width: 40,
    height: 40,
    borderRadius: 20,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
    alignSelf: "flex-start",
  },
  userBubble: {
    backgroundColor: "#D30000",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: "#f1f5f9",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  userText: {
    color: "white",
    fontSize: 16,
  },
  otherText: {
    color: "#1f2937",
    fontSize: 16,
  },
  messageFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 4,
  },
  timestamp: {
    fontSize: 10,
    color: "#6b7280",
  },
  userTimestamp: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  readReceipt: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.7)",
    marginLeft: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
  },
  inputContainer: {
    backgroundColor: "white",
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
  },
  suggestionsContainer: {
    paddingVertical: 12,
  },
  suggestionsContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  suggestionTextBubble: {
    backgroundColor: "#FBEAE8",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  suggestionDisabled: {
    backgroundColor: "#f3f4f6",
    opacity: 0.6,
  },
  suggestionText: {
    color: "#D30000",
    fontWeight: "600",
    fontSize: 14,
  },
  inputBoxContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
  },
  inputBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
    maxHeight: 100,
  },
  inputBoxDisabled: {
    backgroundColor: "#f9fafb",
    color: "#9ca3af",
  },
  enterKey: {
    backgroundColor: "#dc2626",
    padding: 12,
    borderRadius: 25,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  enterKeyDisabled: {
    backgroundColor: "#9ca3af",
  },
});
