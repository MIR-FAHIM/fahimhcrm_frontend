import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  Tooltip,
  Paper
} from '@mui/material';


const ActivityChip = ({ icon, label, count = 0 }) => (
    <Tooltip title={`${label}: ${count}`}>
      <Box display="flex" alignItems="center" gap={0.5} sx={{ color: "text.primary" }}>
        {icon}
        <Typography variant="body2">{count}</Typography>
      </Box>
    </Tooltip>
  );
  export default ActivityChip;