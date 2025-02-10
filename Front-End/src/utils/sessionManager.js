// sessionManager.js (new file - create in src/utils/)
import axios from 'axios';

class SessionManager {
    constructor() {
        this.sessionCheckInterval = null;
        this.sessionTimeout = null;
    }

    startSession(token, expiresIn, userData) {
        const expirationTime = new Date().getTime() + (expiresIn * 1000);
        
        localStorage.setItem('token', token);
        localStorage.setItem('expirationTime', expirationTime.toString());
        localStorage.setItem('userData', JSON.stringify(userData));

        // Clear any existing intervals/timeouts
        this.clearTimers();

        // Set up session check interval (every minute)
        this.sessionCheckInterval = setInterval(() => {
            this.checkSession();
        }, 60000);

        // Set up session timeout
        this.sessionTimeout = setTimeout(() => {
            this.endSession();
        }, expiresIn * 1000);
    }

    checkSession() {
        const expirationTime = localStorage.getItem('expirationTime');
        if (!expirationTime) return false;

        const timeLeft = parseInt(expirationTime) - new Date().getTime();
        
        if (timeLeft <= 0) {
            this.endSession();
            return false;
        }

        // Optional: Warn user when session is about to expire (5 minutes before)
        if (timeLeft <= 300000) {
            this.warnSessionExpiring();
        }

        return true;
    }

    warnSessionExpiring() {
        // You can implement custom warning logic here
        console.warn('Session will expire in less than 5 minutes');
    }

    endSession() {
        this.clearTimers();
        localStorage.removeItem('token');
        localStorage.removeItem('expirationTime');
        localStorage.removeItem('userData');
        localStorage.removeItem('userLevel');
        window.location.href = '/login';
    }

    clearTimers() {
        if (this.sessionCheckInterval) {
            clearInterval(this.sessionCheckInterval);
        }
        if (this.sessionTimeout) {
            clearTimeout(this.sessionTimeout);
        }
    }

    getToken() {
        return localStorage.getItem('token');
    }

    getUserData() {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    }

    isAuthenticated() {
        return this.getToken() && this.checkSession();
    }
}

export const sessionManager = new SessionManager();