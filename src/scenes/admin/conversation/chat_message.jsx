import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Stack,
  TextField,
  Button,
  useTheme,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import { base_url , image_file_url} from "../../../api/config/index";
import AddTaskFormChat from './task_add_from_chat';
import Dialog from '@mui/material/Dialog';
import SendIcon from '@mui/icons-material/Send';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { addChat, getChatMessageByConID } from '../../../api/controller/admin_controller/conversation_controller';
import { format } from 'date-fns';

const ChatMessages = ({ currentUserId, roomID, relatedId, type }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [error, setError] = useState(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatByConversations = async () => {
    try {
      setLoading(true);
      const response = await getChatMessageByConID({
        conversation_room_id: roomID,
        user_id: currentUserId
      });

      if (response.status === 'success') {
        setChats(response.data);
      } else {
        setError('Failed to fetch chats');
      }
    } catch (err) {
      console.error('Error fetching chats:', err);
      setError('Error fetching chats');
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await addChat({
        conversation_room_id: roomID,
        message: newMessage.trim(),
        message_type: 'text',
        sender_id: currentUserId
      });

      setNewMessage('');
      await fetchChatByConversations();
    } catch (err) {
      console.error('Sending message failed', err);
    }
  };

  const handleMenuOpen = (event, messageId, message) => {
    setTaskTitle(message);
    setAnchorEl(event.currentTarget);
    setSelectedMessageId(messageId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMessageId(null);
  };

  useEffect(() => {
    fetchChatByConversations();
  }, [roomID]);

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  return (
    <Box sx={{ height: '90vh', display: 'flex', flexDirection: 'column' }}>
      {/* Messages */}
      <Box sx={{ p: 2, overflowY: 'auto', flexGrow: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={2}>
            {chats.map((message) => {
              const isCurrentUser = message.sender_id === currentUserId;
              const messageTime = format(new Date(message.created_at), 'h:mm a');

              return (
                <Box
                  key={message.id}
                  display="flex"
                  justifyContent={isCurrentUser ? 'flex-end' : 'flex-start'}
                >
                  <Stack
                    direction={isCurrentUser ? 'row-reverse' : 'row'}
                    spacing={1}
                    alignItems="flex-end"
                    maxWidth="70%"
                  >
                    {!isCurrentUser && (
                      <Avatar
                        src={`${image_file_url}/${message.sender?.photo}`}
                        alt={message.sender?.name}
                        sx={{ width: 32, height: 32 }}
                      />
                    )}

                    <Box>
                      {!isCurrentUser && (
                        <Typography variant="caption" fontWeight="bold">
                          {message.sender?.name}
                        </Typography>
                      )}

                      <Paper
                        elevation={1}
                        sx={{
                          p: 1.5,
                          borderRadius: isCurrentUser
                            ? '16px 16px 0 16px'
                            : '16px 16px 16px 0',
                          backgroundColor: isCurrentUser
                            ? theme.palette.primary.main
                            : theme.palette.background.paper,
                          color: isCurrentUser
                            ? theme.palette.primary.contrastText
                            : theme.palette.text.primary,
                          position: 'relative'
                        }}
                      >
                        <Typography variant="body1">{message.message}</Typography>
                      </Paper>

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                          mt: 0.5
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {messageTime}
                          {isCurrentUser && (message.is_read ? ' ✓✓' : ' ✓')}
                        </Typography>

                        {isCurrentUser && (
                          <IconButton
                            size="small"
                            sx={{ ml: 1 }}
                            onClick={(e) => handleMenuOpen(e, message.id,message.message)}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </Box>

                    {isCurrentUser && (
                      <Avatar
                        src={message.sender?.photo}
                        alt={message.sender?.name}
                        sx={{ width: 32, height: 32 }}
                      />
                    )}
                  </Stack>
                </Box>
              );
            })}
            <div ref={messagesEndRef} />
          </Stack>
        )}
      </Box>

      {/* Settings Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem
  onClick={() => {
    setIsTaskDialogOpen(true);
    handleMenuClose();
  }}
>
  <CheckCircleOutlineIcon fontSize="small" sx={{ mr: 1 }} /> Task
</MenuItem>
        <MenuItem onClick={() => { console.log('Star', selectedMessageId); handleMenuClose(); }}>
          <StarOutlineIcon fontSize="small" sx={{ mr: 1 }} /> Star
        </MenuItem>
        <MenuItem onClick={() => { console.log('Edit', selectedMessageId); handleMenuClose(); }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Update
        </MenuItem>
        <MenuItem onClick={() => { console.log('Delete', selectedMessageId); handleMenuClose(); }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
      <Dialog
  open={isTaskDialogOpen}
  onClose={() => setIsTaskDialogOpen(false)}
  maxWidth="sm"
  fullWidth
>
  <AddTaskFormChat
  title = {taskTitle}
    messageId={selectedMessageId}
    related_id={relatedId}
    type={type}
    onClose={() => setIsTaskDialogOpen(false)}
  />
</Dialog>

      {/* Input area */}
      <Box
        sx={{
          borderTop: `1px solid ${theme.palette.divider}`,
          p: 2,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
        />
        <Button
          onClick={handleSendMessage}
          color="primary"
          variant="contained"
          sx={{ ml: 2 }}
          endIcon={<SendIcon />}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default ChatMessages;
