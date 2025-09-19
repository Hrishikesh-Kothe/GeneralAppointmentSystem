import React, { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Calendar } from './components/ui/calendar';
import { toast, Toaster } from 'sonner';

const categories = ['healthcare', 'personal care', 'education', 'homeservice'];

export default function App() {
  const [currentView, setCurrentView] = useState('auth');
  const [authMode, setAuthMode] = useState('login');
  const [userType, setUserType] = useState('member');
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState();
  const [selectedTime, setSelectedTime] = useState('');
  const [dashboardView, setDashboardView] = useState('main');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    category: '',
    specialization: ''
  });

  useEffect(() => {
    loadAppointments();
  }, []);

  const makeRequest = async (endpoint, options = {}) => {
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    return response;
  };

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

  const loadAppointments = async () => {
    try {
      const response = await makeRequest('/appointments');
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  const createTimeSlot = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select both date and time');
      return;
    }

    try {
      const response = await makeRequest('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          specialistId: user?._id,
          specialistName: user?.name,
          specialization: user?.specialization,
          category: user?.category,
          date: selectedDate.toISOString().split('T')[0],
          time: selectedTime,
          isBooked: false
        }),
      });

      if (response.ok) {
        toast.success('Time slot created!');
        setSelectedDate(undefined);
        setSelectedTime('');
        setDashboardView('main');
        loadAppointments();
      } else {
        const error = await response.text();
        toast.error(`Error creating slot: ${error}`);
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Failed to create time slot');
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
        toast.success('Appointment booked!');
        loadAppointments();
        setDashboardView('main');
      } else {
        const error = await response.text();
        toast.error(`Booking failed: ${error}`);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment');
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
    toast.success('Logged out successfully');
  };

  const getAvailableAppointments = () => {
    return appointments.filter(apt => 
      apt.category === selectedCategory && !apt.isBooked
    );
  };

  const getUserAppointments = () => {
    if (user?.userType === 'member') {
      return appointments.filter(apt => apt.memberName === user.name);
    } else {
      return appointments.filter(apt => apt.specialistId === user?._id);
    }
  };

  if (currentView === 'auth') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Toaster position="top-center" />
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
                
                <Button type="submit" className="w-full mt-6">
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
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-foreground">
                Welcome, {user?.name}
              </h1>
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full capitalize">
                {user?.userType}
              </span>
            </div>
            <Button variant="outline" onClick={logout}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {dashboardView === 'main' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-semibold text-foreground mb-2">Dashboard</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200" 
                    onClick={() => setDashboardView(user?.userType === 'member' ? 'book' : 'list')}>
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-lg">
                    {user?.userType === 'member' ? 'Book Appointment' : 'Manage Schedule'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <p className="text-muted-foreground text-sm">
                    {user?.userType === 'member' 
                      ? 'Find and book appointments with specialists' 
                      : 'Create and manage your available time slots'
                    }
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200" 
                    onClick={() => setDashboardView('view')}>
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-lg">View Appointments</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <p className="text-muted-foreground text-sm">
                    {user?.userType === 'member' 
                      ? 'Check your booked appointments' 
                      : 'View your scheduled appointments'
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {dashboardView === 'book' && user?.userType === 'member' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => setDashboardView('main')}>
                ← Back to Dashboard
              </Button>
              <h2 className="text-2xl font-semibold">Book Appointment</h2>
            </div>

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
                  {getAvailableAppointments().map(appointment => (
                    <Card key={appointment._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                          <div className="space-y-1">
                            <h4 className="font-semibold text-lg">{appointment.specialistName}</h4>
                            <p className="text-muted-foreground">{appointment.specialization}</p>
                            <p className="text-sm font-medium">
                              {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                            </p>
                          </div>
                          <Button onClick={() => bookAppointment(appointment._id)} className="sm:ml-4">
                            Book Appointment
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {getAvailableAppointments().length === 0 && (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground">No available appointments in this category</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {dashboardView === 'list' && user?.userType === 'specialist' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => setDashboardView('main')}>
                ← Back to Dashboard
              </Button>
              <h2 className="text-2xl font-semibold">Create Time Slot</h2>
            </div>

            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Add Available Time</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Select a date and time when you'll be available for appointments
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Select Date</Label>
                    <div className="flex justify-center">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Select Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                    />
                  </div>

                  <Button onClick={createTimeSlot} className="w-full" size="lg">
                    Create Time Slot
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {dashboardView === 'view' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => setDashboardView('main')}>
                ← Back to Dashboard
              </Button>
              <h2 className="text-2xl font-semibold">
                {user?.userType === 'member' ? 'My Appointments' : 'My Schedule'}
              </h2>
            </div>

            <div className="space-y-4 max-w-4xl mx-auto">
              {getUserAppointments().map(appointment => (
                <Card key={appointment._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                      <div className="space-y-2">
                        {user?.userType === 'member' ? (
                          <>
                            <h4 className="font-semibold text-lg">{appointment.specialistName}</h4>
                            <p className="text-muted-foreground">{appointment.specialization}</p>
                          </>
                        ) : (
                          <h4 className="font-semibold text-lg">
                            {appointment.isBooked ? `Booked by: ${appointment.memberName}` : 'Available Slot'}
                          </h4>
                        )}
                        <p className="text-sm font-medium">
                          {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                        </p>
                      </div>
                      <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                        appointment.isBooked 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      }`}>
                        {appointment.isBooked ? 'Confirmed' : 'Available'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {getUserAppointments().length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <p className="text-muted-foreground">No appointments found</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}