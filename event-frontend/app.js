class EventApp {
    constructor() {
        this.baseUrl = '';
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
        
        console.log('EventApp initialized');
        this.initializeApp();
        this.bindEvents();
        this.startNotificationPolling();
    }

    initializeApp() {
        console.log('Initializing app...');
        if (this.user) {
            this.showUserSection();
            this.loadEvents();
            this.loadNotifications();
            
            // Show appropriate sections based on role
            if (this.user.role === 'ORGANIZER') {
                this.showOrganizerFeatures();
            } else if (this.user.role === 'ADMIN') {
                this.showAdminFeatures();
            }
        } else {
            this.showAuthSection();
        }
    }

    bindEvents() {
        console.log('Binding events...');
        
        // Auth buttons
        document.addEventListener('click', (e) => {
            if (e.target.id === 'loginBtn') this.showModal('loginModal');
            if (e.target.id === 'signupBtn') this.showModal('signupModal');
            if (e.target.id === 'logoutBtn') this.logout();
            if (e.target.id === 'notificationsBtn') this.toggleNotifications();
            if (e.target.id === 'suggestEventBtn') this.showModal('suggestEventModal');
            if (e.target.id === 'viewPendingEventsBtn') this.loadPendingEvents();
            if (e.target.id === 'createEventBtn') this.showModal('createEventModal');
            
            if (e.target.className.includes('close')) {
                e.target.closest('.modal').style.display = 'none';
            }
        });

        // Form submissions
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin(e);
        });

        document.getElementById('signupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup(e);
        });

        document.getElementById('createEventForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCreateEvent(e);
        });

        document.getElementById('suggestEventForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSuggestEvent(e);
        });

        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
            // Close notifications dropdown when clicking outside
            if (!e.target.closest('.notifications')) {
                this.hideNotifications();
            }
        });
    }

    // 🔐 AUTHENTICATION METHODS
    async handleLogin(e) {
        console.log('Handling login...');
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }

        try {
            console.log('Sending login request...');
            const response = await fetch(`${this.baseUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Login response:', data);

            if (data.token) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('token', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));
                
                alert('Login successful!');
                this.hideModal('loginModal');
                this.initializeApp();
            } else {
                alert(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Network error: ' + error.message);
        }
    }

    async handleSignup(e) {
        console.log('Handling signup...');
        
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const role = document.getElementById('signupRole').value;

        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }

        try {
            console.log('Sending signup request...');
            const response = await fetch(`${this.baseUrl}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, role })
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Signup response:', data);

            if (data.token) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('token', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));
                
                alert('Signup successful!');
                this.hideModal('signupModal');
                this.initializeApp();
            } else {
                alert(data.error || 'Signup failed');
            }
        } catch (error) {
            console.error('Signup error:', error);
            alert('Network error: ' + error.message);
        }
    }

    // 📅 EVENT METHODS
    async loadEvents() {
        console.log('Loading events...');
        
        if (!this.token) {
            console.log('No token available');
            return;
        }

        try {
            const response = await fetch(`${this.baseUrl}/events`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();
            console.log('Events response:', data);

            if (data.events) {
                this.displayEvents(data.events);
            } else if (data.error) {
                console.log('Error loading events:', data.error);
            }
        } catch (error) {
            console.error('Error loading events:', error);
        }
    }

    displayEvents(events) {
        const eventsList = document.getElementById('eventsList');
        if (!eventsList) return;
        
        console.log('Displaying events:', events);

        if (events.length === 0) {
            eventsList.innerHTML = '<div class="loading">No events available. Check back later!</div>';
            return;
        }

        eventsList.innerHTML = events.map(event => `
            <div class="event-card">
                <div class="event-title">${event.title}</div>
                <div class="event-description">${event.description}</div>
                <div class="event-details">
                    <strong>📅 Date:</strong> ${new Date(event.date).toLocaleString()}<br>
                    <strong>📍 Location:</strong> ${event.location}<br>
                    <strong>👤 Organizer:</strong> ${event.organizer?.email || 'Unknown'}<br>
                    <strong>✅ RSVPs:</strong> ${event.rsvps?.length || 0}
                    ${event.capacity ? `<br><strong>👥 Capacity:</strong> ${event.capacity}` : ''}
                </div>
                ${this.user && this.user.role === 'ATTENDEE' ? `
                    <button class="btn btn-success" onclick="app.rsvpToEvent('${event.id}')">
                        🎯 RSVP Going
                    </button>
                ` : ''}
                ${this.user && this.user.role === 'ADMIN' && !event.approved ? `
                    <button class="btn btn-warning" onclick="app.approveEvent('${event.id}')">
                        ✅ Approve Event
                    </button>
                ` : ''}
            </div>
        `).join('');
    }

    async handleCreateEvent(e) {
        e.preventDefault();
        console.log('Creating event...');
        
        const title = document.getElementById('eventTitle').value;
        const description = document.getElementById('eventDescription').value;
        const date = document.getElementById('eventDate').value;
        const location = document.getElementById('eventLocation').value;
        const capacity = document.getElementById('eventCapacity').value || 100;

        if (!title || !description || !date || !location) {
            alert('Please fill in all fields');
            return;
        }

        try {
            const response = await fetch(`${this.baseUrl}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ 
                    title, 
                    description, 
                    date: new Date(date).toISOString(), 
                    location,
                    capacity: parseInt(capacity)
                })
            });

            const data = await response.json();
            console.log('Create event response:', data);

            if (data.event) {
                alert('🎉 Event created successfully! All users have been notified.');
                document.getElementById('createEventForm').reset();
                this.loadEvents();
                this.hideModal('createEventModal');
            } else {
                alert(data.error || 'Failed to create event');
            }
        } catch (error) {
            console.error('Create event error:', error);
            alert('Network error: ' + error.message);
        }
    }

    async handleSuggestEvent(e) {
        e.preventDefault();
        console.log('Suggesting event...');
        
        const title = document.getElementById('suggestTitle').value;
        const description = document.getElementById('suggestDescription').value;
        const date = document.getElementById('suggestDate').value;
        const location = document.getElementById('suggestLocation').value;
        const capacity = document.getElementById('suggestCapacity').value || 100;

        if (!title || !description || !date || !location) {
            alert('Please fill in all fields');
            return;
        }

        try {
            const response = await fetch(`${this.baseUrl}/events/suggest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ 
                    title, 
                    description, 
                    date: new Date(date).toISOString(), 
                    location,
                    capacity: parseInt(capacity)
                })
            });

            const data = await response.json();
            console.log('Suggest event response:', data);

            if (data.event) {
                alert('✅ Event suggested successfully! Waiting for admin approval.');
                document.getElementById('suggestEventForm').reset();
                this.hideModal('suggestEventModal');
            } else {
                alert(data.error || 'Failed to suggest event');
            }
        } catch (error) {
            console.error('Suggest event error:', error);
            alert('Network error: ' + error.message);
        }
    }

    async rsvpToEvent(eventId) {
        console.log('RSVP to event:', eventId);
        
        try {
            const response = await fetch(`${this.baseUrl}/events/${eventId}/rsvp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ status: 'GOING' })
            });

            const data = await response.json();
            console.log('RSVP response:', data);

            if (data.rsvp) {
                alert('🎉 RSVP successful! You are attending this event.');
                this.loadEvents(); // Refresh events list
            } else {
                alert(data.error || 'RSVP failed');
            }
        } catch (error) {
            console.error('RSVP error:', error);
            alert('Network error: ' + error.message);
        }
    }

    async approveEvent(eventId) {
        if (!confirm('Are you sure you want to approve this event?')) return;
        
        try {
            const response = await fetch(`${this.baseUrl}/events/${eventId}/approve`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();
            console.log('Approve event response:', data);

            if (data.event) {
                alert('✅ Event approved successfully! All users have been notified.');
                this.loadEvents();
                this.loadPendingEvents();
            } else {
                alert(data.error || 'Failed to approve event');
            }
        } catch (error) {
            console.error('Approve event error:', error);
            alert('Network error: ' + error.message);
        }
    }

    async loadPendingEvents() {
        try {
            const response = await fetch(`${this.baseUrl}/events/pending`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();
            console.log('Pending events response:', data);

            if (data.events) {
                this.displayPendingEvents(data.events);
            } else {
                alert(data.error || 'Failed to load pending events');
            }
        } catch (error) {
            console.error('Load pending events error:', error);
            alert('Network error: ' + error.message);
        }
    }

    displayPendingEvents(events) {
        const pendingEventsList = document.getElementById('pendingEventsList');
        if (!pendingEventsList) return;

        if (events.length === 0) {
            pendingEventsList.innerHTML = '<p>No pending events for approval.</p>';
            return;
        }

        pendingEventsList.innerHTML = events.map(event => `
            <div class="pending-event-card">
                <div class="event-title">${event.title}</div>
                <div class="event-description">${event.description}</div>
                <div class="event-details">
                    <strong>📅 Date:</strong> ${new Date(event.date).toLocaleString()}<br>
                    <strong>📍 Location:</strong> ${event.location}<br>
                    <strong>👤 Suggested by:</strong> ${event.organizer?.email || 'Unknown'}<br>
                    <strong>👥 Capacity:</strong> ${event.capacity || 100}
                </div>
                <button class="btn btn-success" onclick="app.approveEvent('${event.id}')">
                    ✅ Approve Event
                </button>
            </div>
        `).join('');
    }

    // 🔔 NOTIFICATION METHODS
    async loadNotifications() {
        if (!this.token) return;

        try {
            const response = await fetch(`${this.baseUrl}/notifications`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            
            const data = await response.json();
            if (data.notifications) {
                this.displayNotifications(data.notifications);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    displayNotifications(notifications) {
        const notificationsBadge = document.getElementById('notificationsBadge');
        const notificationsList = document.getElementById('notificationsList');
        
        if (!notificationsBadge || !notificationsList) return;

        // Update badge count
        const unreadCount = notifications.filter(n => !n.read).length;
        notificationsBadge.textContent = unreadCount;
        notificationsBadge.style.display = unreadCount > 0 ? 'inline' : 'none';

        // Display notifications
        if (notifications.length === 0) {
            notificationsList.innerHTML = '<div class="notification-item">No notifications</div>';
            return;
        }

        notificationsList.innerHTML = notifications.map(notification => `
            <div class="notification-item ${notification.read ? 'read' : 'unread'}" 
                 onclick="app.markNotificationAsRead('${notification.id}')">
                <div class="notification-title">${this.getNotificationIcon(notification.type)} ${notification.title}</div>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-time">${new Date(notification.createdAt).toLocaleString()}</div>
            </div>
        `).join('');
    }

    getNotificationIcon(type) {
        const icons = {
            'EVENT_CREATED': '📅',
            'EVENT_APPROVED': '✅',
            'RSVP_CONFIRMED': '🎯',
            'EVENT_SUGGESTED': '💡'
        };
        return icons[type] || '🔔';
    }

    async markNotificationAsRead(notificationId) {
        try {
            await fetch(`${this.baseUrl}/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            this.loadNotifications(); // Refresh notifications
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    toggleNotifications() {
        const dropdown = document.getElementById('notificationsDropdown');
        if (dropdown.style.display === 'block') {
            this.hideNotifications();
        } else {
            this.showNotifications();
        }
    }

    showNotifications() {
        const dropdown = document.getElementById('notificationsDropdown');
        dropdown.style.display = 'block';
    }

    hideNotifications() {
        const dropdown = document.getElementById('notificationsDropdown');
        dropdown.style.display = 'none';
    }

    startNotificationPolling() {
        // Check for new notifications every 30 seconds
        setInterval(() => {
            if (this.token) {
                this.loadNotifications();
            }
        }, 30000);
    }

    // 👥 ROLE-BASED UI METHODS
    showUserSection() {
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('userSection').style.display = 'block';
        document.getElementById('actionButtons').style.display = 'flex';
        
        if (this.user) {
            document.getElementById('userEmail').textContent = this.user.email;
            document.getElementById('userRole').textContent = this.user.role.toLowerCase();
        }
    }

    showAuthSection() {
        document.getElementById('authSection').style.display = 'block';
        document.getElementById('userSection').style.display = 'none';
        document.getElementById('actionButtons').style.display = 'none';
        this.hideOrganizerFeatures();
        this.hideAdminFeatures();
        
        const eventsList = document.getElementById('eventsList');
        if (eventsList) {
            eventsList.innerHTML = '<div class="loading">Please login to view events</div>';
        }
    }

    showOrganizerFeatures() {
        const suggestEventBtn = document.getElementById('suggestEventBtn');
        if (suggestEventBtn) suggestEventBtn.style.display = 'inline-block';
    }

    hideOrganizerFeatures() {
        const suggestEventBtn = document.getElementById('suggestEventBtn');
        if (suggestEventBtn) suggestEventBtn.style.display = 'none';
    }

    showAdminFeatures() {
        const createEventBtn = document.getElementById('createEventBtn');
        const adminPanel = document.getElementById('adminPanel');
        const viewPendingEventsBtn = document.getElementById('viewPendingEventsBtn');
        
        if (createEventBtn) createEventBtn.style.display = 'inline-block';
        if (adminPanel) adminPanel.style.display = 'block';
        if (viewPendingEventsBtn) viewPendingEventsBtn.style.display = 'inline-block';

        this.loadAdminStats();
        this.loadUsers();
    }

    async loadAdminStats() {
        try {
            const response = await fetch(`${this.baseUrl}/admin/stats`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();
            if (data.userCount) {
                const userCountElement = document.getElementById('totalUsersCount');
                if(userCountElement) {
                    userCountElement.textContent = data.userCount;
                }
            }
        } catch (error) {
            console.error('Error loading admin stats:', error);
        }
    }

    async loadUsers() {
        try {
            const response = await fetch(`${this.baseUrl}/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();
            if (data.users) {
                this.displayUsers(data.users);
            }
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    displayUsers(users) {
        const userList = document.getElementById('userList');
        if (!userList) return;

        userList.innerHTML = users.map(user => `
            <div class="user-card">
                <div class="user-email">${user.email}</div>
                <div class="user-role">
                    <select onchange="app.updateUserRole('${user.id}', this.value)">
                        <option value="ATTENDEE" ${user.role === 'ATTENDEE' ? 'selected' : ''}>Attendee</option>
                        <option value="ORGANIZER" ${user.role === 'ORGANIZER' ? 'selected' : ''}>Organizer</option>
                        <option value="ADMIN" ${user.role === 'ADMIN' ? 'selected' : ''}>Admin</option>
                    </select>
                </div>
            </div>
        `).join('');
    }

    async updateUserRole(userId, role) {
        try {
            const response = await fetch(`${this.baseUrl}/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ role })
            });

            const data = await response.json();
            if (data.success) {
                alert('User role updated successfully!');
                this.loadUsers();
            } else {
                alert(data.error || 'Failed to update user role');
            }
        } catch (error) {
            console.error('Error updating user role:', error);
            alert('Network error: ' + error.message);
        }
    }

    hideAdminFeatures() {
        const createEventBtn = document.getElementById('createEventBtn');
        const adminPanel = document.getElementById('adminPanel');
        const viewPendingEventsBtn = document.getElementById('viewPendingEventsBtn');
        
        if (createEventBtn) createEventBtn.style.display = 'none';
        if (adminPanel) adminPanel.style.display = 'none';
        if (viewPendingEventsBtn) viewPendingEventsBtn.style.display = 'none';
    }

    // 🎯 UTILITY METHODS
    showModal(modalId) {
        console.log('Showing modal:', modalId);
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.token = null;
        this.user = null;
        this.showAuthSection();
        alert('Logged out successfully');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM loaded, initializing app...');
        window.app = new EventApp();
    });
} else {
    console.log('DOM already loaded, initializing app...');
    window.app = new EventApp();
}