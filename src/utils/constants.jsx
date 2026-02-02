export const MOCK_USER = {
  name: import.meta.env.VITE_ADMIN_NAME,
  email: import.meta.env.VITE_ADMIN_EMAIL,
  password: import.meta.env.VITE_ADMIN_PASSWORD,
  avatar: 'https://picsum.photos/seed/alex/200/200',
};

export const ANALYTICS_MOCK = {
  totalRevenue: 124592,
  activeUsers: 42501,
  conversionRate: 3.24,
  newSignups: 1284,
  performanceData: [
    { day: 'MON', revenue: 60, prevRevenue: 40 },
    { day: 'TUE', revenue: 55, prevRevenue: 35 },
    { day: 'WED', revenue: 75, prevRevenue: 50 },
    { day: 'THU', revenue: 65, prevRevenue: 45 },
    { day: 'FRI', revenue: 90, prevRevenue: 60 },
    { day: 'SAT', revenue: 80, prevRevenue: 55 },
    { day: 'SUN', revenue: 50, prevRevenue: 40 },
  ],
};

export const MANAGED_USERS_MOCK = [
  { id: 'W-001', name: 'Jordan Smith', email: 'jordan@example.com', phone: '+1 (555) 123-4567', status: 'Verified', joinedDate: 'Oct 12, 2023', code: '849201' },
  { id: 'W-002', name: 'Sarah Chen', email: 'sarah.c@example.com', phone: '+1 (555) 987-6543', status: 'Verified', joinedDate: 'Oct 15, 2023', code: '112930' },
  { id: 'W-003', name: 'Michael Ross', email: 'mross@example.com', phone: '+1 (555) 444-5555', status: 'Pending Login', joinedDate: 'Oct 18, 2023', code: '550291' },
  { id: 'W-004', name: 'Elena Gilbert', email: 'elena.g@example.com', phone: '+1 (555) 222-3333', status: 'Verified', joinedDate: 'Oct 20, 2023', code: '992031' },
];
export const RECENT_TRANSACTIONS = [
  { id: 'TRX-9482', title: 'Premium Plan Subscription', date: 'Oct 24, 2023', amount: 299.0, status: 'Completed', type: 'subscription' },
  { id: 'TRX-9481', title: 'Custom Domain Add-on', date: 'Oct 23, 2023', amount: 12.0, status: 'Processing', type: 'addon' },
  { id: 'TRX-9480', title: 'Consulting Fee', date: 'Oct 22, 2023', amount: 1500.0, status: 'Completed', type: 'fee' },
  { id: 'TRX-9479', title: 'Cloud Storage Expansion', date: 'Oct 21, 2023', amount: 45.0, status: 'Failed', type: 'expansion' },
];
