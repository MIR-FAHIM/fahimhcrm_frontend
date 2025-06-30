import { Avatar, Box, Button, Grid, Input, TextField, Typography } from '@mui/material';
import { blue } from '@mui/material/colors';
import { useState, useEffect } from 'react';
import { useProfile } from '../../../provider/profile_context';
const ProfileComponent = ({
  imageUrl,
  handleFileChange,
  handleUpload,
  changePass,
  profileData,
  userID,
  id,
  handleLogout,
  handleUpdateData
}) => {
  const [editData, setEditData] = useState({});
    const { userProfileData, setUserProfileData, profileLoading } = useProfile();
  const [passwordData, setPasswordData] = useState({});
  const [passwordError, setPasswordError] = useState('');
const isEditable = userProfileData.role?.id === 1 || userProfileData.role?.id === 2;
  useEffect(() => {
    if (profileData) {
      setEditData({
        user_id: profileData.id || '',
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        birthdate: profileData.birthdate || '',
        bio: profileData.bio || '',
        start_hour: profileData.start_hour || '',
        start_min: profileData.start_min || '',
      });
    }

    setPasswordData({
    user_id: profileData.id || '',
    current_password: '',
    new_password: '',
    confirm_new_password: ''
  })
  }, [profileData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    handleUpdateData(editData);
  };

  const handlePasswordSave = () => {
    // Simple validation
    if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_new_password) {
      setPasswordError('All password fields are required');
      return;
    }
    if (passwordData.new_password !== passwordData.confirm_new_password) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwordData.new_password.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    // Trigger the password change function
    changePass(passwordData);
  };

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', padding: 3 }}>
      {/* Avatar & Upload */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 3 }}>
        <Avatar
          alt="avatar"
          src={imageUrl}
          sx={{
            width: 100,
            height: 100,
            marginBottom: 2,
            border: '2px solid',
            borderColor: blue[500],
          }}
        />

        {userID === id && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              sx={{ marginBottom: 2 }}
            />
            <Button
              onClick={handleUpload}
              variant="contained"
              color="primary"
              sx={{ textTransform: 'none' }}
            >
              Upload Profile Image
            </Button>
          </Box>
        )}
      </Box>

      {/* Editable General Info */}
      <Typography variant="h5" fontWeight="bold" mb={2}>
        General Information
      </Typography>

      <Grid container spacing={3}>
        {/* Left Side */}
        <Grid item xs={12} md={6}>
          <TextField
            label="Name"
            name="name"
            fullWidth
            value={editData.name}
            onChange={handleChange}
            margin="dense"
          />
          <TextField
            label="Email"
            name="email"
            fullWidth
            value={editData.email}
            onChange={handleChange}
            margin="dense"
            disabled = {isEditable}
          />
          <TextField
            label="Phone"
            name="phone"
            fullWidth
            value={editData.phone}
            onChange={handleChange}
            margin="dense"
          />
          <TextField
            label="Address"
            name="address"
            fullWidth
            value={editData.address}
            onChange={handleChange}
            margin="dense"
          />
          <TextField
            label="Birthdate"
            name="birthdate"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={editData.birthdate?.split("T")[0] || ''}
            onChange={handleChange}
            margin="dense"
          />
          <TextField
            label="Bio"
            name="bio"
            fullWidth
            multiline
            rows={3}
            value={editData.bio}
            onChange={handleChange}
            margin="dense"
          />
  <Box sx={{ mt: 2, p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
  <Typography variant="h6" gutterBottom>
    Office Entry Time
  </Typography>

  <TextField
    label="Entry Hour"
    name="start_hour"
    fullWidth
    multiline
    rows={3}
    value={editData.start_hour}
    onChange={handleChange}
    margin="dense"
    disabled={!isEditable}
  />
  <TextField
    label="Entry Min"
    name="start_min"
    fullWidth
    multiline
    rows={3}
    value={editData.start_min}
    onChange={handleChange}
    margin="dense"
    disabled={!isEditable}
  />
{isEditable && (
  <Button
    onClick={handleSave}
    variant="contained"
    color="success"
    sx={{ textTransform: 'none', minWidth: 150 }}
  >
    Save Changes
  </Button>
)}
</Box>
        </Grid>

        {/* Right Side (read-only) */}
        <Grid item xs={12} md={6}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Role:</strong> {profileData.role?.role_name}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Department:</strong> {profileData.department?.department_name}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Designation:</strong> {profileData.designation?.designation_name}
          </Typography>
        </Grid>
      </Grid>

      {/* Password Change Section */}

     {userID === id && (
<Grid>
     <Typography variant="h6" fontWeight="bold" mt={4} mb={2}>
        Change Password
      </Typography>
      {passwordError && (
        <Typography color="error" variant="body2" mb={2}>
          {passwordError}
        </Typography>
      )}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Current Password"
            name="current_password"
            type="password"
            fullWidth
            value={passwordData.current_password}
            onChange={handlePasswordChange}
            margin="dense"
          />
          <TextField
            label="New Password"
            name="new_password"
            type="password"
            fullWidth
            value={passwordData.new_password}
            onChange={handlePasswordChange}
            margin="dense"
          />
          <TextField
            label="Confirm New Password"
            name="confirm_new_password"
            type="password"
            fullWidth
            value={passwordData.confirm_new_password}
            onChange={handlePasswordChange}
            margin="dense"
          />
        </Grid>
            
      </Grid>
      <Button
      onClick={handlePasswordSave}
      variant="contained"
      color="secondary"
      sx={{ textTransform: 'none', minWidth: 150 }}
    >
      Change Password
    </Button>
      </Grid>
     )} 
 

{userID === id && (
  <Box
    sx={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 2,
      mt: 4,
      justifyContent: 'flex-start', // or 'center' or 'space-between' as needed
    }}
  >
    <Button
      onClick={handleSave}
      variant="contained"
      color="success"
      sx={{ textTransform: 'none', minWidth: 150 }}
    >
      Save Changes
    </Button>

    <Button
      onClick={handleLogout}
      variant="outlined"
      color="warning"
      sx={{ textTransform: 'none', minWidth: 150 }}
    >
      Log Out
    </Button>


  </Box>
)}
    </Box>
  );
};

export default ProfileComponent;
