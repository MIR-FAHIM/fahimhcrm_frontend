import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Divider,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Box,
  Chip,
  Paper,
  useTheme
} from '@mui/material';
import {
  FileCopy as FileCopyIcon,
  Download as DownloadIcon,
  BarChart as BarChartIcon,
  People as PeopleIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Task as TaskIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const DashBetterRead = ({ details, loadReport }) => {
  const theme = useTheme();
  const [lang, setLang] = useState('en');
  const [expandedSection, setExpandedSection] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const getNarrative = () => {
    const {
      leads_added = 0,
      prospects_engaged = 0,
      clients_converted = 0,
      conversion_rate = '0%',
      top_sources = [],
      calls_made = 0,
      emails_sent = 0,
      messages_sent = 0,
      followups = 0,
      tasks_created = 0,
      tasks_completed = 0,
      overdue_tasks = 0,
      projects = {},
      top_performer = 'N/A',
      working_days = 0,
      attendance_avg = '0%',
      late_entries = 0,
      top_attendee = 'N/A',
      leads_to_prospects = '0%',
      prospects_to_clients = '0%',
      avg_days_to_convert = 0,
      stalled_leads = 0,
      recommendations = []
    } = details;

    const english = {
      leadOverview: {
        title: "Lead Generation & Conversion",
        icon: <TrendingUpIcon color="primary" />,
        content: (
          <Box>
            <Typography paragraph>
              This month, <strong>{leads_added}</strong> new leads were added, with primary sources being
              <Chip label={top_sources.join(', ') || 'unspecified channels'} size="small" sx={{ mx: 1 }} />.
              A total of <strong>{prospects_engaged}</strong> prospects were actively engaged, resulting in
              <strong>{clients_converted}</strong> conversions—translating to a conversion rate of
              <Chip label={conversion_rate} color={parseFloat(conversion_rate) > 10 ? 'success' : 'warning'} size="small" sx={{ mx: 1 }} />.
            </Typography>
            <Typography paragraph>
              This indicates {parseFloat(conversion_rate) > 10 ? (
                <Chip label="Strong lead conversion performance" color="success" size="small" />
              ) : (
                <Chip label="Room for improvement in conversion" color="warning" size="small" />
              )}.
            </Typography>
          </Box>
        )
      },

      engagement: {
        title: "Engagement Activities",
        icon: <PeopleIcon color="primary" />,
        content: (
          <Box>
            <Typography paragraph>
              Engagement efforts included:
            </Typography>
            <Box display="flex" alignItems="center" gap={2} mb={1}>
              <Chip icon={<PhoneIcon />} label={`${calls_made} calls`} variant="outlined" />
              <Chip icon={<EmailIcon />} label={`${emails_sent} emails`} variant="outlined" />
              <Chip icon={<EmailIcon />} label={`${messages_sent} messages`} variant="outlined" />
              <Chip icon={<PhoneIcon />} label={`${followups} follow-ups`} variant="outlined" />
            </Box>
            <Typography paragraph>
              This consistent outreach reflects an
              {followups >= 10 ? (
                <Chip label="active and attentive engagement strategy" color="success" size="small" />
              ) : (
                <Chip label="opportunity to improve engagement" color="warning" size="small" />
              )}.
            </Typography>
          </Box>
        )
      },

      tasksProjects: {
        title: "Task Management & Team Collaboration",
        icon: <TaskIcon color="primary" />,
        content: (
          <Box>
            <Typography paragraph>
              Your team created <strong>{tasks_created}</strong> tasks, with
              <Chip label={`${tasks_completed} completed`} color="success" size="small" sx={{ mx: 1 }} />
              and <Chip label={`${overdue_tasks} pending`} color={overdue_tasks > 5 ? 'error' : 'warning'} size="small" sx={{ mx: 1 }} />.
            </Typography>
            <Typography paragraph>
              There are <strong>{projects.ongoing || 0}</strong> ongoing projects and
              <strong>{projects.completed || 0}</strong> completed ones.
            </Typography>
            <Typography paragraph>
              {overdue_tasks > 5 ? (
                <Chip label="Attention needed for overdue tasks" color="error" size="small" />
              ) : (
                <Chip label="Task deadlines are mostly well managed" color="success" size="small" />
              )}. Top performer this period: <strong>{top_performer}</strong>.
            </Typography>
          </Box>
        )
      },

      attendance: {
        title: "Attendance Overview",
        icon: <CalendarIcon color="primary" />,
        content: (
          <Box>
            <Typography paragraph>
              Out of <strong>{working_days}</strong> tracked working days, the average team attendance stood at
              <Chip label={attendance_avg} color={parseFloat(attendance_avg) >= 90 ? 'success' : 'warning'} size="small" sx={{ mx: 1 }} />,
              with <strong>{late_entries}</strong> late entries.
            </Typography>
            <Typography paragraph>
              {parseFloat(attendance_avg) >= 90 ? (
                <Chip label="Team punctuality and presence were excellent" color="success" size="small" />
              ) : (
                <Chip label="Consider reinforcing attendance discipline" color="warning" size="small" />
              )}. <strong>{top_attendee}</strong> stood out with consistent attendance.
            </Typography>
          </Box>
        )
      },

      crmFunnel: {
        title: "CRM Funnel Insights",
        icon: <BarChartIcon color="primary" />,
        content: (
          <Box>
            <Typography paragraph>
              Funnel metrics show a <strong>{leads_to_prospects}</strong> transition from leads to prospects,
              and a <strong>{prospects_to_clients}</strong> from prospects to clients.
            </Typography>
            <Typography paragraph>
              On average, conversion took <strong>{avg_days_to_convert}</strong> days.
              {stalled_leads > 10 ? (
                <Chip label="Stalled leads may be impacting growth" color="error" size="small" />
              ) : (
                <Chip label="Funnel flow is relatively smooth" color="success" size="small" />
              )}.
            </Typography>
          </Box>
        )
      },

      recommendations: {
        title: "Recommendations",
        icon: <InfoIcon color="primary" />,
        content: (
          <Box>
            <Typography paragraph>
              Based on this month's performance, here are some recommendations:
            </Typography>
            <Box component="ul" sx={{ pl: 2, my: 1 }}>
              {recommendations.map((rec, index) => (
                <Typography key={index} component="li" variant="body2">
                  {rec}
                </Typography>
              ))}
            </Box>
          </Box>
        )
      }
    };

    const bangla = {
      leadOverview: {
        title: "লিড জেনারেশন ও রূপান্তর",
        icon: <TrendingUpIcon color="primary" />,
        content: (
          <Box>
            <Typography paragraph>
              এই মাসে <strong>{leads_added}</strong>টি নতুন লিড যোগ হয়েছে, প্রধান উৎস ছিল
              <Chip label={top_sources.join(', ') || 'অনির্দিষ্ট চ্যানেল'} size="small" sx={{ mx: 1 }} />.
              মোট <strong>{prospects_engaged}</strong> জন সম্ভাব্য ক্লায়েন্টের সাথে যোগাযোগ হয়েছে এবং
              <strong>{clients_converted}</strong> জন ক্লায়েন্টে রূপান্তর হয়েছে—রূপান্তরের হার
              <Chip label={conversion_rate} color={parseFloat(conversion_rate) > 10 ? 'success' : 'warning'} size="small" sx={{ mx: 1 }} />.
            </Typography>
            <Typography paragraph>
              এটি নির্দেশ করে যে রূপান্তর {parseFloat(conversion_rate) > 10 ? (
                <Chip label="ভালো পারফরম্যান্স" color="success" size="small" />
              ) : (
                <Chip label="উন্নতির সুযোগ আছে" color="warning" size="small" />
              )}.
            </Typography>
          </Box>
        )
      },

      engagement: {
        title: "যোগাযোগ কার্যক্রম",
        icon: <PeopleIcon color="primary" />,
        content: (
          <Box>
            <Typography paragraph>
              যোগাযোগ কার্যক্রমের মধ্যে ছিল:
            </Typography>
            <Box display="flex" alignItems="center" gap={2} mb={1}>
              <Chip icon={<PhoneIcon />} label={`${calls_made} কল`} variant="outlined" />
              <Chip icon={<EmailIcon />} label={`${emails_sent} ইমেইল`} variant="outlined" />
              <Chip icon={<EmailIcon />} label={`${messages_sent} মেসেজ`} variant="outlined" />
              <Chip icon={<PhoneIcon />} label={`${followups} ফলো-আপ`} variant="outlined" />
            </Box>
            <Typography paragraph>
              এই ধারাবাহিক প্রচেষ্টা একটি
              {followups >= 10 ? (
                <Chip label="সক্রিয় ও মনোযোগী কৌশল" color="success" size="small" />
              ) : (
                <Chip label="উন্নতির সুযোগ" color="warning" size="small" />
              )}.
            </Typography>
          </Box>
        )
      },

      tasksProjects: {
        title: "টাস্ক ম্যানেজমেন্ট ও দলীয় সহযোগিতা",
        icon: <TaskIcon color="primary" />,
        content: (
          <Box>
            <Typography paragraph>
              আপনার দল <strong>{tasks_created}</strong>টি টাস্ক তৈরি করেছে, যার মধ্যে
              <Chip label={`${tasks_completed} সম্পন্ন`} color="success" size="small" sx={{ mx: 1 }} />
              এবং <Chip label={`${overdue_tasks} বাকি`} color={overdue_tasks > 5 ? 'error' : 'warning'} size="small" sx={{ mx: 1 }} />.
            </Typography>
            <Typography paragraph>
              বর্তমানে <strong>{projects.ongoing || 0}</strong>টি প্রকল্প চলমান এবং
              <strong>{projects.completed || 0}</strong>টি সম্পন্ন হয়েছে।
            </Typography>
            <Typography paragraph>
              {overdue_tasks > 5 ? (
                <Chip label="মেয়াদোত্তীর্ণ টাস্কের প্রতি মনোযোগ প্রয়োজন" color="error" size="small" />
              ) : (
                <Chip label="টাস্ক সময়মতো সম্পন্ন হচ্ছে" color="success" size="small" />
              )}. এই সময়ের সেরা পারফর্মার: <strong>{top_performer}</strong>.
            </Typography>
          </Box>
        )
      },

      attendance: {
        title: "উপস্থিতি ওভারভিউ",
        icon: <CalendarIcon color="primary" />,
        content: (
          <Box>
            <Typography paragraph>
              <strong>{working_days}</strong>টি কর্মদিবস ট্র্যাক করা হয়েছে এবং গড় উপস্থিতি
              <Chip label={attendance_avg} color={parseFloat(attendance_avg) >= 90 ? 'success' : 'warning'} size="small" sx={{ mx: 1 }} />,
              যেখানে <strong>{late_entries}</strong>টি দেরিতে আগমনের ঘটনা রয়েছে।
            </Typography>
            <Typography paragraph>
              {parseFloat(attendance_avg) >= 90 ? (
                <Chip label="দলের উপস্থিতি এবং সময়ানুবর্তিতা চমৎকার" color="success" size="small" />
              ) : (
                <Chip label="উপস্থিতি শৃঙ্খলা জোরদার করার কথা বিবেচনা করুন" color="warning" size="small" />
              )}. <strong>{top_attendee}</strong> ধারাবাহিক উপস্থিতির জন্য বিশেষভাবে উল্লেখযোগ্য।
            </Typography>
          </Box>
        )
      },

      crmFunnel: {
        title: "সিআরএম ফানেল ইনসাইটস",
        icon: <BarChartIcon color="primary" />,
        content: (
          <Box>
            <Typography paragraph>
              ফানেল ডেটা অনুযায়ী, <strong>{leads_to_prospects}</strong> হারে লিড থেকে প্রোসপেক্টে রূপান্তর এবং
              <strong>{prospects_to_clients}</strong> হারে প্রোসপেক্ট থেকে ক্লায়েন্টে রূপান্তর হয়েছে।
            </Typography>
            <Typography paragraph>
              গড়ে রূপান্তরে সময় লেগেছে <strong>{avg_days_to_convert}</strong> দিন।
              {stalled_leads > 10 ? (
                <Chip label="রূপান্তর ব্যর্থ হওয়া লিড ব্যবসার উন্নতিতে প্রভাব ফেলতে পারে" color="error" size="small" />
              ) : (
                <Chip label="ফানেল সাধারণভাবে মসৃণভাবে চলছে" color="success" size="small" />
              )}.
            </Typography>
          </Box>
        )
      },

      recommendations: {
        title: "পরামর্শসমূহ",
        icon: <InfoIcon color="primary" />,
        content: (
          <Box>
            <Typography paragraph>
              এই মাসের পারফরম্যান্সের উপর ভিত্তি করে, এখানে কিছু পরামর্শ রয়েছে:
            </Typography>
            <Box component="ul" sx={{ pl: 2, my: 1 }}>
              {recommendations.map((rec, index) => (
                <Typography key={index} component="li" variant="body2">
                  {rec}
                </Typography>
              ))}
            </Box>
          </Box>
        )
      }
    };

    return lang === 'bn' ? bangla : english;
  };

  const narrative = getNarrative();
  const reportText = Object.values(narrative).map(section => section.content).join('\n\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
  };

  const handleDownload = () => {
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'business_report.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <Card sx={{margin: 'auto', mt: 4, borderRadius: 3 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box
  display="flex"
  alignItems="center"
  gap={2}
  sx={{
    p: 1,
    borderRadius: 2,
    backgroundColor: 'background.paper',
    boxShadow: 1,
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: 3
    }
  }}
>
  <BarChartIcon
    color="primary"
    sx={{
      fontSize: 30,
      transition: 'transform 0.3s ease',
      '&:hover': {
        transform: 'scale(1.1)'
      }
    }}
  />
  <Typography
    variant="h5"
    fontWeight="bold"
    sx={{
      flexGrow: 1,
      transition: 'color 0.3s ease',
      '&:hover': {
        color: 'primary.main'
      }
    }}
  >
    Monthly Business Overview Report
  </Typography>
  <Button
    variant="contained"
    sx={{
      bgcolor: "primary.main",
      color: "#fff",
      fontWeight: 600,
      px: 3,
      py: 1.5,
      borderRadius: "10px",
      boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        bgcolor: "primary.dark",
        transform: "translateY(-2px)",
        boxShadow: "0 6px 16px rgba(25, 118, 210, 0.4)"
      },
      "&:active": {
        transform: "translateY(0)"
      }
    }}
    onClick={() => loadReport()}
  >
    Load Report
  </Button>
</Box>

          <ToggleButtonGroup
            value={lang}
            exclusive
            onChange={(e, newLang) => newLang && setLang(newLang)}
            size="small"
            sx={{ border: `1px solid ${theme.palette.divider}` }}
          >
            <ToggleButton value="en" sx={{ px: 2 }}>EN</ToggleButton>
            <ToggleButton value="bn" sx={{ px: 2 }}>BN</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Reporting Period: {details.reporting_period || `${formatDate(details.start_date)} – ${formatDate(details.end_date)}`}
        </Typography>

        <Divider sx={{ my: 3, borderColor: theme.palette.divider }} />

        {Object.entries(narrative).map(([key, section]) => (
          <Paper
            key={key}
            elevation={expandedSection === key ? 3 : 1}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: theme.shadows[4]
              }
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              onClick={() => toggleSection(key)}
              sx={{ cursor: 'pointer' }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                {section.icon}
                <Typography variant="h6" fontWeight="bold">
                  {section.title}
                </Typography>
              </Box>
              {expandedSection === key ? (
                <Typography variant="body2" color="text.secondary">
                  Click to collapse
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Click to expand
                </Typography>
              )}
            </Box>

            {expandedSection === key && (
              <Box sx={{ mt: 2 }}>
                {section.content}
              </Box>
            )}
          </Paper>
        ))}

        <Divider sx={{ my: 3, borderColor: theme.palette.divider }} />

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            startIcon={<FileCopyIcon />}
            onClick={handleCopy}
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2 }}
          >
            Copy Report
          </Button>
          <Button
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            variant="outlined"
            color="primary"
            sx={{ borderRadius: 2 }}
          >
            Download
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default DashBetterRead;
