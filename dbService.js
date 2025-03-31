/**
 * Database Service for T&M Ticket Generator
 * Handles local storage of databases and tickets
 */

class DBService {
    constructor() {
      this.storagePrefix = 'tm_ticket_';
      this.materialsKey = `${this.storagePrefix}materials_db`;
      this.equipmentKey = `${this.storagePrefix}equipment_db`;
      this.ticketsKey = `${this.storagePrefix}tickets`;
      
      // Initialize default databases if they don't exist
      this.initDatabase();
    }
    
    /**
     * Initialize databases with default values if they don't exist
     */
    initDatabase() {
      // Check and initialize materials database
      if (!localStorage.getItem(this.materialsKey)) {
        const defaultMaterials = [
          { id: 1, name: "2x4 Lumber", unit: "ft", price: 0.89 },
          { id: 2, name: "Plywood 4x8 Sheet", unit: "ea", price: 45.99 },
          { id: 3, name: "Drywall 4x8 Sheet", unit: "ea", price: 15.50 },
          { id: 4, name: "Concrete Mix", unit: "bag", price: 12.75 },
          { id: 5, name: "PVC Pipe 1\"", unit: "ft", price: 2.30 }
        ];
        this.saveMaterialsDB(defaultMaterials);
      }
      
      // Check and initialize equipment database
      if (!localStorage.getItem(this.equipmentKey)) {
        const defaultEquipment = [
          { id: 1, name: "Backhoe", unit: "hour", price: 120.00 },
          { id: 2, name: "Concrete Mixer", unit: "day", price: 95.00 },
          { id: 3, name: "Scissor Lift", unit: "day", price: 210.00 },
          { id: 4, name: "Compressor", unit: "day", price: 75.00 },
          { id: 5, name: "Generator", unit: "day", price: 65.00 }
        ];
        this.saveEquipmentDB(defaultEquipment);
      }
      
      // Initialize tickets storage if it doesn't exist
      if (!localStorage.getItem(this.ticketsKey)) {
        localStorage.setItem(this.ticketsKey, JSON.stringify([]));
      }
    }
    
    /**
     * Get materials database
     * @returns {Array} Array of material objects
     */
    getMaterialsDB() {
      try {
        const data = localStorage.getItem(this.materialsKey);
        return data ? JSON.parse(data) : [];
      } catch (error) {
        console.error('Error getting materials database:', error);
        return [];
      }
    }
    
    /**
     * Save materials database
     * @param {Array} materials - Array of material objects
     * @returns {boolean} Success status
     */
    saveMaterialsDB(materials) {
      try {
        localStorage.setItem(this.materialsKey, JSON.stringify(materials));
        return true;
      } catch (error) {
        console.error('Error saving materials database:', error);
        return false;
      }
    }
    
    /**
     * Get equipment database
     * @returns {Array} Array of equipment objects
     */
    getEquipmentDB() {
      try {
        const data = localStorage.getItem(this.equipmentKey);
        return data ? JSON.parse(data) : [];
      } catch (error) {
        console.error('Error getting equipment database:', error);
        return [];
      }
    }
    
    /**
     * Save equipment database
     * @param {Array} equipment - Array of equipment objects
     * @returns {boolean} Success status
     */
    saveEquipmentDB(equipment) {
      try {
        localStorage.setItem(this.equipmentKey, JSON.stringify(equipment));
        return true;
      } catch (error) {
        console.error('Error saving equipment database:', error);
        return false;
      }
    }
    
    /**
     * Get saved tickets
     * @returns {Array} Array of saved tickets
     */
    getSavedTickets() {
      try {
        const data = localStorage.getItem(this.ticketsKey);
        return data ? JSON.parse(data) : [];
      } catch (error) {
        console.error('Error getting saved tickets:', error);
        return [];
      }
    }
    
    /**
     * Save a ticket
     * @param {Object} ticket - Ticket data
     * @returns {Object} Saved ticket with ID
     */
    saveTicket(ticket) {
      try {
        const tickets = this.getSavedTickets();
        
        // Add ID and timestamp if it's a new ticket
        if (!ticket.id) {
          ticket.id = Date.now().toString();
          ticket.createdAt = new Date().toISOString();
        }
        
        ticket.updatedAt = new Date().toISOString();
        
        // Check if ticket already exists
        const existingIndex = tickets.findIndex(t => t.id === ticket.id);
        
        if (existingIndex >= 0) {
          // Update existing ticket
          tickets[existingIndex] = ticket;
        } else {
          // Add new ticket
          tickets.push(ticket);
        }
        
        localStorage.setItem(this.ticketsKey, JSON.stringify(tickets));
        return ticket;
      } catch (error) {
        console.error('Error saving ticket:', error);
        throw error;
      }
    }
    
    /**
     * Delete a ticket
     * @param {string} ticketId - ID of the ticket to delete
     * @returns {boolean} Success status
     */
    deleteTicket(ticketId) {
      try {
        const tickets = this.getSavedTickets();
        const filteredTickets = tickets.filter(ticket => ticket.id !== ticketId);
        
        localStorage.setItem(this.ticketsKey, JSON.stringify(filteredTickets));
        return true;
      } catch (error) {
        console.error('Error deleting ticket:', error);
        return false;
      }
    }
    
    /**
     * Clear all stored data (use with caution)
     */
    clearAllData() {
      localStorage.removeItem(this.materialsKey);
      localStorage.removeItem(this.equipmentKey);
      localStorage.removeItem(this.ticketsKey);
      this.initDatabase();
    }
  }
  
  // Create and export a singleton instance
  const dbService = new DBService();
  export default dbService;