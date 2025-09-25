import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Calendar } from './components/ui/calendar';
import { RadioGroup, RadioGroupItem } from './components/ui/radio-group';
import { Checkbox } from './components/ui/checkbox';
import { Textarea } from './components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { Badge } from './components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { toast } from './components/ui/toast';
import { AppointmentCard } from './components/AppointmentCard';
import { OptimizedAppointmentList } from './components/OptimizedAppointmentList';
import { ErrorBoundary } from './components/ErrorBoundary';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const categories = ['healthcare', 'personal care', 'education', 'homeservice'];
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function AppContent() {
  const [currentView, setCurrentView] = useState('auth');
  const [authMode, setAuthMode] = useState('login');
  const [userType, setUserType] = useState('member');
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState();
  const [dashboardView, setDashboardView] = useState('main');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);
  const [specialistAppointments, setSpecialistAppointments] = useState([]);
  const [dateAppointments, setDateAppointments] = useState([]);
  
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedDays, setSelectedDays] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [slotInterval, setSlotInterval] = useState('30');
  const [venue, setVenue] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    profilePhoto: ''
  });
  
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [updateData, setUpdateData] = useState({
    venue: '',
    phone: '',
    time: ''
  });
  
  const [selectedBulkGroup, setSelectedBulkGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    category: '',
    specialization: ''
  });

  const makeRequest = useCallback(async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      return response;
    } catch (error) {
      console.error(`Request failed for ${endpoint}:`, error);
      throw error;
    }
  }, []);

  const loadAppointments = useCallback(async () => {
    try {
      console.log('Loading appointments...');
      const response = await makeRequest('/appointments');
      if (response.ok) {
        const data = await response.json();
        console.log(`Loaded ${data.appointments.length} appointments`);
        setAppointments(data.appointments);
        
        if (data.appointments.length > 100) {
          console.info(`Large dataset loaded: ${data.appointments.length} appointments. Pagination is enabled.`);
        }
      } else {
        console.error('Failed to load appointments:', response.status, response.statusText);
        toast.error('Failed to load appointments');
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast.error('Error loading appointments');
    }
  }, [makeRequest]);

  const loadSpecialists = useCallback(async () => {
    try {
      const response = await makeRequest('/search/specialists');
      if (response.ok) {
        const data = await response.json();
        setSpecialists(data.specialists);
      }
    } catch (error) {
      console.error('Error loading specialists:', error);
      toast.error('Failed to load specialists');
    }
  }, [makeRequest]);

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        setAppointments([]);
        setSpecialists([]);
        
        await Promise.all([
          loadAppointments(),
          loadSpecialists()
        ]);
      } catch (error) {
        console.error('Error initializing data:', error);
        toast.error('Failed to load initial data');
        setAppointments([]);
        setSpecialists([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeData();
  }, [loadAppointments, loadSpecialists]);

  useEffect(() => {
    setCurrentPage(1);
  }, [dashboardView, selectedCategory, selectedSpecialist, selectedBulkGroup]);
  
  useEffect(() => {
    if (dashboardView === 'list' && user?.phone) {
      setContactPhone(user.phone);
    }
  }, [dashboardView, user]);

  const handleAuth = async (e) => {
    e.preventDefault();
    
    try {
      if (authMode === 'register') {
        const response = await makeRequest('/register', {
          method: 'POST',
          body: JSON.stringify({
            ...formData,
            userType
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setCurrentView('dashboard');
          toast.success('Registration successful!');
        } else {
          const error = await response.text();
          toast.error(`Registration failed: ${error}`);
        }
      } else {
        const response = await makeRequest('/login', {
          method: 'POST',
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setCurrentView('dashboard');
          toast.success('Login successful!');
        } else {
          const error = await response.text();
          toast.error(`Login failed: ${error}`);
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Authentication failed');
    }
  };

  const searchSpecialists = async (query, category = '') => {
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (category) params.append('category', category);
      
      const response = await makeRequest(`/search/specialists?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setSpecialists(data.specialists);
      }
    } catch (error) {
      console.error('Error searching specialists:', error);
    }
  };

  const loadSpecialistAppointments = async (specialistId) => {
    try {
      const response = await makeRequest(`/appointments/specialist/${specialistId}`);
      if (response.ok) {
        const data = await response.json();
        setSpecialistAppointments(data.appointments);
      }
    } catch (error) {
      console.error('Error loading specialist appointments:', error);
    }
  };

  const loadDateAppointments = async (date, category = '') => {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      
      const response = await makeRequest(`/appointments/date/${date}?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setDateAppointments(data.appointments);
      }
    } catch (error) {
      console.error('Error loading date appointments:', error);
    }
  };

  const updateProfile = async () => {
    if (!user) return;
    
    try {
      const response = await makeRequest(`/profile/${user._id}`, {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setProfileDialogOpen(false);
        toast.success('Profile updated successfully!');
      } else {
        const error = await response.text();
        toast.error(`Profile update failed: ${error}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const getDatesForMonthAndDays = (month, year, selectedDays) => {
    const monthIndex = months.indexOf(month);
    const yearNum = parseInt(year);
    const dates = [];
    
    const daysOfWeekMap = {
      'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4,
      'Friday': 5, 'Saturday': 6, 'Sunday': 0
    };
    
    for (let day = 1; day <= new Date(yearNum, monthIndex + 1, 0).getDate(); day++) {
      const date = new Date(yearNum, monthIndex, day);
      const dayName = daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1];
      
      if (selectedDays.includes(dayName)) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    
    return dates;
  };

  const generateTimeSlots = (start, end, intervalMinutes) => {
    const slots = [];
    const startTime = new Date(`2000-01-01T${start}:00`);
    const endTime = new Date(`2000-01-01T${end}:00`);
    
    let currentTime = new Date(startTime);
    
    while (currentTime < endTime) {
      const timeString = currentTime.toTimeString().slice(0, 5);
      slots.push(timeString);
      currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes);
    }
    
    return slots;
  };

  const createBulkRecurringSlots = async () => {
    if (!selectedMonth || !selectedYear || selectedDays.length === 0 || !startTime || !endTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (startTime >= endTime) {
      toast.error('End time must be after start time');
      return;
    }

    try {
      const dates = getDatesForMonthAndDays(selectedMonth, selectedYear, selectedDays);
      const timeSlots = generateTimeSlots(startTime, endTime, parseInt(slotInterval));
      
      const appointments = [];
      
      dates.forEach(date => {
        timeSlots.forEach(time => {
          appointments.push({
            specialistId: user?._id,
            specialistName: user?.name,
            specialization: user?.specialization,
            category: user?.category,
            date: date,
            time: time,
            venue: venue || null,
            phone: contactPhone || null
          });
        });
      });

      const response = await makeRequest('/appointments/bulk', {
        method: 'POST',
        body: JSON.stringify({ appointments }),
      });

      if (response.ok) {
        toast.success(`Created ${appointments.length} appointment slots!`);
        setSelectedMonth('');
        setSelectedDays([]);
        setStartTime('');
        setEndTime('');
        setVenue('');
        setContactPhone('');
        setDashboardView('main');
        loadAppointments();
      } else {
        const error = await response.text();
        toast.error(`Failed to create slots: ${error}`);
      }
    } catch (error) {
      console.error('Error creating bulk slots:', error);
      toast.error('Failed to create appointment slots');
    }
  };

  const bookAppointment = async (appointmentId) => {
    try {
      const response = await makeRequest(`/appointments/${appointmentId}/book`, {
        method: 'PUT',
        body: JSON.stringify({
          memberName: user?.name
        }),
      });

      if (response.ok) {
        const updatedAppointment = await response.json();
        
        setAppointments(prevAppointments => 
          prevAppointments.map(apt => 
            apt._id === appointmentId 
            ? { ...apt, isBooked: true, memberName: user.name } 
            : apt
          )
        );
        
        toast.success('Appointment booked successfully!');
        
        if (user?.userType === 'member') {
          setDashboardView('view');
        }

      } else {
        const error = await response.text();
        toast.error(`Booking failed: ${error}`);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment');
    }
  };

  const deleteAppointment = async (appointmentId) => {
    try {
      const response = await makeRequest(`/appointments/${appointmentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Appointment deleted!');
        loadAppointments();
      } else {
        const error = await response.text();
        toast.error(`Delete failed: ${error}`);
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Failed to delete appointment');
    }
  };

  const updateAppointment = async () => {
    if (!selectedAppointment) return;
    
    try {
      const response = await makeRequest(`/appointments/${selectedAppointment._id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      
      if (response.ok) {
        toast.success('Appointment updated successfully!');
        setUpdateDialogOpen(false);
        setSelectedAppointment(null);
        loadAppointments();
      } else {
        const error = await response.text();
        toast.error(`Update failed: ${error}`);
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
    }
  };

  const logout = () => {
    setUser(null);
    setCurrentView('auth');
    setDashboardView('main');
    setFormData({
      name: '',
      email: '',
      password: '',
      category: '',
      specialization: ''
    });
    setVenue('');
    setContactPhone('');
    toast.success('Logged out successfully');
  };

  const handleAppointmentUpdate = useCallback((appointment) => {
    setSelectedAppointment(appointment);
    setUpdateData({
      venue: appointment.venue || '',
      phone: appointment.phone || '',
      time: appointment.time
    });
    setUpdateDialogOpen(true);
  }, []);

  const handleAppointmentDelete = useCallback((appointmentId) => {
    deleteAppointment(appointmentId);
  }, []);

  const handleAppointmentBook = useCallback((appointmentId) => {
    bookAppointment(appointmentId);
  }, [user]);

  const getAvailableAppointments = useMemo(() => {
    try {
      if (!Array.isArray(appointments)) {
        console.warn('appointments is not an array:', appointments);
        return [];
      }
      return appointments.filter(apt => 
        apt && apt.category === selectedCategory && !apt.isBooked
      );
    } catch (error) {
      console.error('Error in getAvailableAppointments:', error);
      return [];
    }
  }, [appointments, selectedCategory]);

  const getUserAppointments = useMemo(() => {
    try {
      if (!Array.isArray(appointments)) {
        console.warn('appointments is not an array:', appointments);
        return [];
      }
      
      if (user?.userType === 'member') {
        return appointments.filter(apt => apt && apt.memberName === user.name);
      } else {
        return appointments.filter(apt => apt && apt.specialistId === user?._id);
      }
    } catch (error) {
      console.error('Error in getUserAppointments:', error);
      return [];
    }
  }, [appointments, user]);

  const getGroupedAppointments = useMemo(() => {
    try {
      const userAppointments = getUserAppointments;
      const grouped = {};
      const individual = [];

      if (!Array.isArray(userAppointments)) {
        console.warn('getUserAppointments did not return an array:', userAppointments);
        return { grouped: {}, individual: [] };
      }

      userAppointments.forEach(appointment => {
        if (!appointment || !appointment._id) {
          console.warn('Invalid appointment object:', appointment);
          return;
        }
        
        if (appointment.bulkId) {
          if (!grouped[appointment.bulkId]) {
            grouped[appointment.bulkId] = [];
          }
          grouped[appointment.bulkId].push(appointment);
        } else {
          individual.push(appointment);
        }
      });

      return { grouped, individual };
    } catch (error) {
      console.error('Error in getGroupedAppointments:', error);
      return { grouped: {}, individual: [] };
    }
  }, [getUserAppointments]);

  const getBulkGroupAppointments = useCallback((bulkId) => {
    const groupAppointments = appointments.filter(apt => apt.bulkId === bulkId);
    
    if (user?.userType === 'member') {
      return groupAppointments.filter(apt => apt.memberName === user.name);
    }
    
    return groupAppointments;
  }, [appointments, user]);

  const formatBulkGroupTitle = useCallback((group) => {
    if (group.length === 0) return 'Empty Group';
    
    const firstAppt = group[0];
    const dates = [...new Set(group.map(apt => apt.date))].sort();
    const times = [...new Set(group.map(apt => apt.time))].sort();
    
    const dateRange = dates.length === 1 
      ? new Date(dates[0]).toLocaleDateString()
      : `${new Date(dates[0]).toLocaleDateString()} - ${new Date(dates[dates.length - 1]).toLocaleDateString()}`;
    
    const timeRange = times.length === 1 
      ? times[0]
      : `${times[0]} - ${times[times.length - 1]}`;
    
    return `${firstAppt.specialization} Sessions (${group.length} slots) - ${dateRange}`;
  }, []);

  const getPaginatedAppointments = useCallback((appointments) => {
    try {
      if (!Array.isArray(appointments)) {
        console.warn('getPaginatedAppointments received non-array:', appointments);
        return [];
      }
      
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return appointments.slice(startIndex, endIndex);
    } catch (error) {
      console.error('Error in getPaginatedAppointments:', error);
      return [];
    }
  }, [currentPage, itemsPerPage]);

  const getTotalPages = useCallback((totalItems) => {
    try {
      if (typeof totalItems !== 'number' || totalItems < 0) {
        return 1;
      }
      return Math.max(1, Math.ceil(totalItems / itemsPerPage));
    } catch (error) {
      console.error('Error in getTotalPages:', error);
      return 1;
    }
  }, [itemsPerPage]);

  if (currentView === 'auth') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl text-center font-semibold">
                General Appointment System
              </CardTitle>
              <p className="text-center text-sm text-muted-foreground">
                {authMode === 'login' ? 'Sign in to your account' : 'Create your account'}
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAuth} className="space-y-4">
                {authMode === 'register' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="userType">User Type</Label>
                      <Select value={userType} onValueChange={(value) => setUserType(value)}>
                        <SelectTrigger id="userType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="specialist">Specialist</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    {userType === 'specialist' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="category">Service Category</Label>
                          <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                            <SelectTrigger id="category">
                              <SelectValue placeholder="Select service category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(cat => (
                                <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="specialization">Specialization</Label>
                          <Input
                            id="specialization"
                            value={formData.specialization}
                            onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                            placeholder="e.g., Pediatrician, Carpenter, Math Tutor"
                            required
                          />
                        </div>
                      </>
                    )}
                  </>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Enter your password"
                    required
                  />
                </div>
                
                <Button type="submit" className="btn-primary btn-default w-full mt-6">
                  {authMode === 'login' ? 'Sign In' : 'Create Account'}
                </Button>
              </form>
              
              <div className="text-center mt-6">
                <Button
                  variant="link"
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-sm"
                >
                  {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <header className="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.profilePhoto} />
                <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  Welcome, {user?.name}
                </h1>
                <Badge variant="secondary" className="text-xs capitalize">
                  {user?.userType}
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button className="btn-outline btn-sm" onClick={() => {
                setProfileData({
                  name: user?.name || '',
                  phone: user?.phone || '',
                  profilePhoto: user?.profilePhoto || ''
                });
                setProfileDialogOpen(true);
              }}>
                Edit Profile
              </Button>
              
              <Button className="btn-outline btn-sm" onClick={logout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && (
          <div className="loading-overlay">
            <div className="flex items-center space-x-4 bg-card p-6 rounded-lg shadow-lg">
              <div className="loading-spinner"></div>
              <p className="text-sm text-muted-foreground font-medium">Loading appointments...</p>
            </div>
          </div>
        )}

        {dashboardView === 'main' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-semibold text-foreground mb-2">Dashboard</h2>
              <p className="text-muted-foreground">
                {user?.userType === 'member' 
                  ? 'Book appointments with service specialists' 
                  : 'Manage your appointment schedule and availability'
                }
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="dashboard-card cursor-pointer" 
                   onClick={() => setDashboardView(user?.userType === 'member' ? 'book' : 'list')}>
                <div className="text-center space-y-4">
                  <div className="text-5xl mb-4">
                    {user?.userType === 'member' ? '📅' : '⚙️'}
                  </div>
                  <h3 className="text-figma-heading">
                    {user?.userType === 'member' ? '🔍 Book New Appointment' : 'Manage Schedule'}
                  </h3>
                  <p className="text-figma-body">
                    {user?.userType === 'member' 
                      ? 'Search and book appointments with specialists in your area' 
                      : 'Create and manage your available time slots'
                    }
                  </p>
                  <Button className="btn-primary btn-default mt-6 w-full">
                    {user?.userType === 'member' ? '🚀 Start Booking' : '⚙️ Manage Schedule'}
                  </Button>
                </div>
              </div>

              <div className="dashboard-card cursor-pointer" 
                   onClick={() => setDashboardView('view')}>
                <div className="text-center space-y-4">
                  <div className="text-5xl mb-4">📋</div>
                  <h3 className="text-figma-heading">My Appointments</h3>
                  <p className="text-figma-body">
                    {user?.userType === 'member' 
                      ? 'View and manage your booked appointments' 
                      : 'Check your upcoming scheduled appointments'
                    }
                  </p>
                  <Button className="btn-outline btn-default mt-6 w-full">
                    📋 View All
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {dashboardView === 'book' && user?.userType === 'member' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4 bg-blue-50 p-4 rounded-lg">
              <Button variant="outline" onClick={() => setDashboardView('main')}>
                ← Back to Dashboard
              </Button>
              <div>
                <h2 className="text-2xl font-semibold">🔍 Book New Appointment</h2>
                <p className="text-gray-600">Choose how you'd like to find your specialist</p>
              </div>
            </div>

            <Tabs defaultValue="category" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="category">By Category</TabsTrigger>
                <TabsTrigger value="specialist">By Specialist</TabsTrigger>
                <TabsTrigger value="date">By Date</TabsTrigger>
              </TabsList>
              
              <TabsContent value="category" className="space-y-6">
                {!selectedCategory ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-center">Select Service Category</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                      {categories.map(category => (
                        <Card key={category} className="cursor-pointer hover:shadow-md transition-shadow duration-200" 
                              onClick={() => setSelectedCategory(category)}>
                          <CardContent className="p-6 text-center">
                            <h3 className="font-medium capitalize">{category}</h3>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <Button variant="outline" onClick={() => setSelectedCategory('')}>
                        ← Back to Categories
                      </Button>
                      <h3 className="text-xl font-medium capitalize">{selectedCategory} Specialists</h3>
                    </div>

                    <div className="space-y-4 max-w-3xl mx-auto">
                      <OptimizedAppointmentList
                        appointments={getAvailableAppointments}
                        user={user}
                        currentPage={currentPage}
                        itemsPerPage={itemsPerPage}
                        onBook={handleAppointmentBook}
                        onPageChange={setCurrentPage}
                        emptyMessage="No available appointments in this category"
                      />
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="specialist" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <Input
                      placeholder="Search specialists by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={() => searchSpecialists(searchQuery)} className="bg-blue-600 hover:bg-blue-700 text-white">
                      Search
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {specialists.map(specialist => (
                      <Card key={specialist._id} className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => {
                              setSelectedSpecialist(specialist);
                              setDashboardView('specialist-appointments');
                              loadSpecialistAppointments(specialist._id);
                            }}>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={specialist.profilePhoto} />
                              <AvatarFallback>{specialist.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold">{specialist.name}</h4>
                              <p className="text-sm text-gray-600">{specialist.specialization}</p>
                              <Badge variant="outline" className="text-xs mt-1">{specialist.category}</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="date" className="space-y-6">
                <div className="space-y-4">
                  <div className="max-w-md mx-auto">
                    <Select value={selectedCategory === "" ? "all" : selectedCategory} onValueChange={(value) => {
                      const categoryValue = value === "all" ? "" : value;
                      setSelectedCategory(categoryValue);
                      if (selectedDate) {
                        const dateStr = selectedDate.toISOString().split('T')[0];
                        loadDateAppointments(dateStr, categoryValue);
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by category (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="max-w-md mx-auto">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        if (date) {
                          const dateStr = date.toISOString().split('T')[0];
                          loadDateAppointments(dateStr, selectedCategory);
                        }
                      }}
                      className="rounded-md border"
                    />
                  </div>
                </div>
                
                {selectedDate && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-center">
                      Appointments on {selectedDate.toLocaleDateString()}
                    </h3>
                    <div className="space-y-4 max-w-3xl mx-auto">
                      {dateAppointments.map(appointment => (
                        <Card key={appointment._id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                              <div className="space-y-1">
                                <h4 className="font-semibold text-lg">{appointment.specialistName}</h4>
                                <p className="text-gray-600">{appointment.specialization}</p>
                                <p className="text-sm font-medium">
                                  {appointment.time}
                                </p>
                                {appointment.venue && (
                                  <p className="text-sm text-blue-600">📍 {appointment.venue}</p>
                                )}
                              </div>
                              <Button onClick={() => bookAppointment(appointment._id)} className="sm:ml-4 bg-blue-600 hover:bg-blue-700 text-white">
                                Book Appointment
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {dateAppointments.length === 0 && (
                        <Card>
                          <CardContent className="p-12 text-center">
                            <p className="text-gray-500">No available appointments on this date</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {dashboardView === 'specialist-appointments' && selectedSpecialist && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => {
                setDashboardView('book');
                setSelectedSpecialist(null);
                setSpecialistAppointments([]);
              }}>
                ← Back to Book
              </Button>
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={selectedSpecialist.profilePhoto} />
                  <AvatarFallback>{selectedSpecialist.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-semibold">{selectedSpecialist.name}</h2>
                  <p className="text-gray-600">{selectedSpecialist.specialization}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 max-w-4xl mx-auto">
              <h3 className="text-lg font-medium">Available Appointments</h3>
              {specialistAppointments.filter(apt => !apt.isBooked).map(appointment => (
                <Card key={appointment._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                      <div className="space-y-1">
                        <p className="text-lg font-medium">
                          {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                        </p>
                        {appointment.venue && (
                          <p className="text-sm text-blue-600">📍 {appointment.venue}</p>
                        )}
                        <Badge variant="secondary">{appointment.category}</Badge>
                      </div>
                      <Button onClick={() => bookAppointment(appointment._id)} className="sm:ml-4 bg-blue-600 hover:bg-blue-700 text-white">
                        Book Appointment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {specialistAppointments.filter(apt => !apt.isBooked).length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <p className="text-gray-500">No available appointments with this specialist</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {dashboardView === 'list' && user?.userType === 'specialist' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => setDashboardView('main')}>
                ← Back to Dashboard
              </Button>
              <h2 className="text-2xl font-semibold">Create Time Slots</h2>
            </div>

            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Bulk Create Recurring Slots</CardTitle>
                  <p className="text-sm text-gray-600">
                    Set up your availability like setting recurring alarms
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Month</Label>
                      <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map(month => (
                            <SelectItem key={month} value={month}>{month}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Year</Label>
                      <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2025">2025</SelectItem>
                          <SelectItem value="2026">2026</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Days of the Week</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {daysOfWeek.map(day => (
                        <div key={day} className="flex items-center space-x-2">
                          <Checkbox
                            id={day}
                            checked={selectedDays.includes(day)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedDays([...selectedDays, day]);
                              } else {
                                setSelectedDays(selectedDays.filter(d => d !== day));
                              }
                            }}
                          />
                          <Label htmlFor={day} className="text-sm">{day}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        placeholder="09:00"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        placeholder="17:00"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Slot Duration</Label>
                    <RadioGroup value={slotInterval} onValueChange={setSlotInterval} className="flex space-x-6">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="15" id="15min" />
                        <Label htmlFor="15min" className="text-sm">15 minutes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="30" id="30min" />
                        <Label htmlFor="30min" className="text-sm">30 minutes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="60" id="1hour" />
                        <Label htmlFor="1hour" className="text-sm">1 hour</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="venue">Venue (Optional)</Label>
                    <Input
                      id="venue"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      placeholder="e.g., City Hospital, Room 101"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="Enter a contact number"
                    />
                    {!user?.phone && (
                        <p className="text-xs text-yellow-600">
                            Tip: Add a phone number to your profile to set it as the default here.
                        </p>
                    )}
                  </div>

                  <Button onClick={createBulkRecurringSlots} className="w-full">
                    Create Recurring Time Slots
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {dashboardView === 'view' && !selectedBulkGroup && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => setDashboardView('main')}>
                ← Back to Dashboard
              </Button>
              <h2 className="text-2xl font-semibold">
                {user?.userType === 'member' ? 'My Appointments' : 'My Schedule'}
              </h2>
              {user?.userType === 'specialist' && (
                <div className="ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      loadAppointments();
                      toast.success('Appointments refreshed');
                    }}
                  >
                    🔄 Refresh
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4 max-w-4xl mx-auto">
              {(() => {
                const { grouped, individual } = getGroupedAppointments;
                
                return (
                  <>
                    {Object.entries(grouped).map(([bulkId, group]) => {
                      const memberBookings = user?.userType === 'member' 
                        ? group.filter(apt => apt.memberName === user.name)
                        : group;
                      
                      if (user?.userType === 'member' && memberBookings.length === 0) {
                        return null;
                      }
                      
                      return (
                        <Card key={bulkId} className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500">
                          <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                              <div className="space-y-2 flex-grow" onClick={() => setSelectedBulkGroup(bulkId)}>
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-semibold text-lg">📅 {formatBulkGroupTitle(memberBookings)}</h4>
                                  {memberBookings.some(apt => apt.venue) && (
                                    <p className="text-sm text-blue-600">📍 {memberBookings[0].venue}</p>
                                  )}
                                </div>
                                {user?.userType === 'member' ? (
                                  <p className="text-gray-600">
                                    {memberBookings.length} appointment{memberBookings.length !== 1 ? 's' : ''} booked
                                  </p>
                                ) : (
                                  <p className="text-gray-600">
                                    {group.filter(apt => apt.isBooked).length} booked, {group.filter(apt => !apt.isBooked).length} available
                                  </p>
                                )}
                                <p className="text-xs text-gray-500">Click to view individual appointments</p>
                              </div>
                              {user?.userType === 'specialist' && (
                                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 sm:ml-auto">
                                  <div className="px-6 py-3 rounded-lg text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-200 min-w-fit whitespace-nowrap">
                                    🔄 Recurring Schedule
                                  </div>
                                  <Button
                                    className="bg-red-600 text-white font-medium px-3 py-2 rounded-md hover:bg-red-700 transition-colors whitespace-nowrap"
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      const availableAppointments = group.filter(apt => !apt.isBooked);
                                      if (availableAppointments.length > 0) {
                                        let deletedCount = 0;
                                        let errorCount = 0;
                                        
                                        for (const appointment of availableAppointments) {
                                          try {
                                            const response = await makeRequest(`/appointments/${appointment._id}`, {
                                              method: 'DELETE',
                                            });
                                            
                                            if (response.ok) {
                                              deletedCount++;
                                            } else {
                                              errorCount++;
                                              console.error(`Failed to delete appointment ${appointment._id}`);
                                            }
                                          } catch (error) {
                                            errorCount++;
                                            console.error('Error deleting appointment:', appointment._id, error);
                                          }
                                        }
                                        
                                        if (deletedCount > 0) {
                                          toast.success(`Deleted ${deletedCount} appointments from group`);
                                          loadAppointments();
                                        }
                                        
                                        if (errorCount > 0) {
                                          toast.error(`Failed to delete ${errorCount} appointments`);
                                        }
                                      } else {
                                        toast.error('No available appointments to delete in this group');
                                      }
                                    }}
                                  >
                                    🗑️ Delete Group
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}

                    <OptimizedAppointmentList
                      appointments={individual}
                      user={user}
                      currentPage={currentPage}
                      itemsPerPage={itemsPerPage}
                      onUpdate={handleAppointmentUpdate}
                      onDelete={handleAppointmentDelete}
                      onPageChange={setCurrentPage}
                      emptyMessage="No individual appointments found"
                    />

                    {Object.keys(grouped).length === 0 && individual.length === 0 && (
                      <Card>
                        <CardContent className="p-12 text-center">
                          <p className="text-gray-500">No appointments found</p>
                        </CardContent>
                      </Card>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {dashboardView === 'view' && selectedBulkGroup && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => setSelectedBulkGroup(null)}>
                ← Back to Schedule
              </Button>
              <h2 className="text-2xl font-semibold">
                Group Appointments
              </h2>
              {user?.userType === 'specialist' && (
                <div className="ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      loadAppointments();
                      toast.success('Appointments refreshed');
                    }}
                  >
                    🔄 Refresh
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4 max-w-4xl mx-auto">
              <OptimizedAppointmentList
                appointments={getBulkGroupAppointments(selectedBulkGroup)}
                user={user}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                onUpdate={handleAppointmentUpdate}
                onDelete={handleAppointmentDelete}
                onPageChange={setCurrentPage}
                emptyMessage="No appointments found in this group"
              />
            </div>
          </div>
        )}
      </main>

      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Profile</DialogTitle>
            <DialogDescription>
              Update your profile information including name, phone number, and profile photo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profileName">Name</Label>
              <Input
                id="profileName"
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profilePhone">Phone Number</Label>
              <Input
                id="profilePhone"
                value={profileData.phone}
                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                placeholder="Enter your phone number"
              />
            </div>
            <div className="space-y-4">
              <Label htmlFor="profilePhoto" className="text-base font-semibold">📸 Profile Photo</Label>
              
              <div className="relative">
                <div className="file-upload border-4 border-dashed border-primary/30 hover:border-primary/60 bg-primary/5 hover:bg-primary/10 transition-all">
                  <div className="text-center py-8 space-y-3">
                    <div className="text-4xl">📸</div>
                    <div>
                      <p className="text-lg font-semibold text-primary">
                        📁 Choose Profile Photo
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Click here to upload JPG, PNG, GIF (up to 10MB)
                      </p>
                    </div>
                    <div className="bg-primary text-primary-foreground px-4 py-2 rounded-md inline-block font-medium">
                      Browse Files
                    </div>
                  </div>
                  <Input
                    id="profilePhoto"
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          setProfileData({...profileData, profilePhoto: e.target?.result});
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
              </div>
              
              {profileData.profilePhoto && (
                <div className="bg-muted/30 p-4 rounded-lg border border-dashed border-border">
                  <div className="text-center space-y-3">
                    <p className="text-sm font-medium text-green-600">✅ Photo uploaded successfully!</p>
                    <img 
                      src={profileData.profilePhoto} 
                      alt="Profile preview" 
                      className="w-20 h-20 rounded-full object-cover border-4 border-primary mx-auto shadow-md"
                    />
                    <p className="text-xs text-muted-foreground">This will be your new profile photo</p>
                  </div>
                </div>
              )}
            </div>
            <Button onClick={updateProfile} className="btn-primary btn-default w-full">
              Update Profile
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Appointment</DialogTitle>
            <DialogDescription>
              Modify the appointment details including time, venue, and contact information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="updateTime">Time</Label>
              <Input
                id="updateTime"
                type="time"
                value={updateData.time}
                onChange={(e) => setUpdateData({...updateData, time: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="updateVenue">Venue</Label>
              <Input
                id="updateVenue"
                value={updateData.venue}
                onChange={(e) => setUpdateData({...updateData, venue: e.target.value})}
                placeholder="Enter venue"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="updatePhone">Phone Number</Label>
              <Input
                id="updatePhone"
                value={updateData.phone}
                onChange={(e) => setUpdateData({...updateData, phone: e.target.value})}
                placeholder="Enter phone number"
              />
            </div>
            <Button onClick={updateAppointment} className="btn-primary btn-default w-full">
              Update Appointment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

