import React, { useMemo } from 'react';
import { Grid, Card, CardContent, Typography, Box, Chip } from '@mui/material';
import {
  CalendarToday as BookingsIcon,
  Payment as PaymentIcon,
  Cancel as CancelIcon,
  PersonOff as NoShowIcon,
  TrendingUp as TrendIcon
} from '@mui/icons-material';

const BookingStats = ({ bookings = [] }) => {
  const stats = useMemo(() => {
    const totalBookings = bookings.length;
    const pendingPayments = bookings.filter(b => b.payment.status === 'pending').length;
    const cancellations = bookings.filter(b => b.status === 'cancelled').length;
    const noShows = bookings.filter(b => b.status === 'no-show').length;
    const cancellationRate = totalBookings > 0 ? ((cancellations / totalBookings) * 100).toFixed(1) : 0;

    return {
      totalBookings,
      pendingPayments,
      cancellations,
      noShows,
      cancellationRate
    };
  }, [bookings]);

  const StatCard = ({ icon, title, value, subtitle, color = 'primary' }) => (
    <Card sx={{ 
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb',
      '&:hover': {
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
              {value.toLocaleString()}
            </Typography>
            <Typography variant="body2" fontWeight="medium" color="text.primary">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ 
            p: 2, 
            borderRadius: 2, 
            backgroundColor: `${color}.50`,
            color: `${color}.main`
          }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item size={{xs:6, sm:6, md:2.4}}>
        <StatCard
          icon={<BookingsIcon />}
          title="Total Bookings"
          value={stats.totalBookings}
          color="primary"
        />
      </Grid>
      
      <Grid item size={{xs:6, sm:6, md:2.4}}>
        <StatCard
          icon={<PaymentIcon />}
          title="Pending Payment"
          value={stats.pendingPayments}
          color="warning"
        />
      </Grid>
      
      <Grid item size={{xs:6, sm:6, md:2.4}}>
        <StatCard
          icon={<CancelIcon />}
          title="Cancellations"
          value={stats.cancellations}
          color="error"
        />
      </Grid>
      
      <Grid item size={{xs:6, sm:6, md:2.4}}>
        <StatCard
          icon={<NoShowIcon />}
          title="No-Shows"
          value={stats.noShows}
          color="grey"
        />
      </Grid>
      
      <Grid item size={{xs:6, sm:6, md:2.4}}>
        <StatCard
          icon={<TrendIcon />}
          title="Cancellation Rate"
          value={`${stats.cancellationRate}%`}
          color="info"
        />
      </Grid>
    </Grid>
  );
};

export default BookingStats;