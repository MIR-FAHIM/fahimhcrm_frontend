import React, { useState, useEffect } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Badge
} from "@mui/material";
import { fetchConversationRoom, getChatMessageByConID } from "../../../api/controller/admin_controller/conversation_controller";
import { useNavigate } from "react-router-dom";
import { base_url } from "../../../api/config/index";
import ChatIcon from '@mui/icons-material/Chat';
import { formatDistanceToNow } from 'date-fns';
import ChatMessages from "./chat_message"; // Make sure to import your ChatMessages component

const ConversationRoomList = () => {
  const [rooms, setRooms] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedId, setRelatedID] = useState(null);
  const [type, setType] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
// Set your current user ID
  const navigate = useNavigate();
  const userID = localStorage.getItem("userId");


  useEffect(() => {
   
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const response = await fetchConversationRoom();
        if (response.status === "success") {
          // Sort rooms by updated_at in descending order
          const sortedRooms = response.data.sort((a, b) =>
            new Date(b.updated_at) - new Date(a.updated_at)
          );
          setRooms(sortedRooms);
        } else {
          setError("Failed to fetch conversation rooms");
        }
      } catch (err) {
        setError("Error fetching conversation rooms");
        console.error("Error fetching conversation rooms:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleRoomClick = (roomID) => {
    setSelectedRoom(roomID); // Set the selected room ID
    
    fetchChatByConversations(roomID); // Fetch chats for the selected room
  };

  const getRoomTypeLabel = (type) => {
    const typeLabels = {
      project: "Project",
      general: "General",
      client: "Client",
      prospect: "Prospect"
    };
    return typeLabels[type] || type;
  };

  const getRoomTypeColor = (type) => {
    const typeColors = {
      project: "primary",
      general: "secondary",
      client: "success",
      prospect: "info"
    };
    return typeColors[type] || "default";
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Chat List */}
      <Box sx={{ width: 320, borderRight: '1px solid #e0e0e0', overflowY: 'auto' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6" fontWeight="bold">
            Conversations
          </Typography>
        </Box>

        <List sx={{ p: 0 }}>
          {rooms.map((room) => (
            <React.Fragment key={room.id}>
              <ListItem
                alignItems="flex-start"
                selected={selectedRoom === room.id}
                sx={{
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    cursor: 'pointer'
                  },
                  backgroundColor: selectedRoom === room.id ? '#e3f2fd' : 'inherit'
                }}
                onClick={function () {
                 
                  switch (room.type) {
                    case "project":
                      setRelatedID(room.project_id);
                      setType("project");
                      break;
                    case "prospect":
                      setRelatedID(room.prospect_id);
                      setType("prospect");
                      break;
                    case "client":
                      setRelatedID(room.client_id);
                      setType("client");
                      break;
                    case "general":
                      setRelatedID(room.general_id);
                      setType("general");
                      break;
                    default:
                      break;
                  }
                  return handleRoomClick(room.id);
                }}
              >
                <ListItemAvatar>
                  {room.cover_photo ? (
                    <Avatar
                      alt={room.room_name}
                      src={`${base_url}/storage/${room.cover_photo}`}
                    />
                  ) : (
                    <Avatar sx={{ bgcolor: '#1976d2' }}>
                      {getInitials(room.room_name)}
                    </Avatar>
                  )}
                </ListItemAvatar>
                <ListItemText
                  primary={room.room_name}
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                        sx={{ display: 'inline' }}
                      >
                        {getRoomTypeLabel(room.type)}
                      </Typography>
                      {" — " + formatDistanceToNow(new Date(room.updated_at), { addSuffix: true })}
                    </>
                  }
                />
                <IconButton edge="end" aria-label="messages">
                  <Badge color="primary" variant="dot">
                    <ChatIcon color="action" />
                  </Badge>
                </IconButton>
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
        {selectedRoom ? (
          <ChatMessages  currentUserId={parseInt(userID)} roomID={selectedRoom} relatedId= {relatedId} type= {type}/>
        ) : (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%'
          }}>
            <Typography variant="h6" color="text.secondary">
              Select a conversation from the list
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ConversationRoomList;
