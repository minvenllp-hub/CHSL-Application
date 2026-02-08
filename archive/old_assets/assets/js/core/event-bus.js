/**
 * EVENT BUS - Communication System for Modules
 * This allows different modules to talk to each other
 */

class EventBus {
    constructor() {
        // Store all event listeners
        this.events = {};
        
        // Shared data that all modules can access
        this.sharedData = {
            // MC Master data
            mcMembers: [],
            expenseCategories: [],
            approvalMatrix: {},
            
            // User info
            user: { 
                name: 'System Admin', 
                role: 'Administrator' 
            },
            
            // System state
            currentModule: 'dashboard',
            isLoggedIn: true
        };
    }

    /**
     * Subscribe to an event
     * Example: eventBus.on('user-logged-in', (userData) => { ... })
     */
    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }

    /**
     * Emit an event (notify all subscribers)
     * Example: eventBus.emit('user-logged-in', userData)
     */
    emit(eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${eventName} handler:`, error);
                }
            });
        }
    }

    /**
     * Set shared data (all modules can access this)
     */
    setData(key, value) {
        this.sharedData[key] = value;
        // Notify that data changed
        this.emit('data-changed', { key, value });
    }

    /**
     * Get shared data
     */
    getData(key) {
        return this.sharedData[key];
    }

    /**
     * Get all shared data
     */
    getAllData() {
        return { ...this.sharedData };
    }
}

// Create a global event bus instance
window.eventBus = new EventBus();

// Define common event names (so we don't have typos)
window.AppEvents = {
    // Module events
    MODULE_LOADED: 'module-loaded',
    MODULE_CHANGED: 'module-changed',
    
    // Data events
    DATA_CHANGED: 'data-changed',
    MC_MEMBERS_UPDATED: 'mc-members-updated',
    EXPENSE_CATEGORIES_UPDATED: 'expense-categories-updated',
    APPROVAL_MATRIX_UPDATED: 'approval-matrix-updated',
    
    // User events
    USER_LOGGED_IN: 'user-logged-in',
    USER_LOGGED_OUT: 'user-logged-out',
    
    // System events
    SYSTEM_ERROR: 'system-error',
    SHOW_NOTIFICATION: 'show-notification'
};

// Log to console when event bus is ready
console.log('✅ Event Bus initialized');