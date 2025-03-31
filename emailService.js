/**
 * Email Service for T&M Ticket Generator
 * This service integrates with the backend server for sending emails
 */

class EmailService {
    constructor() {
      this.apiEndpoint = '/api/send-email';
      this.isServerAvailable = false;
      
      // Check if server is available
      this.checkServerAvailability();
    }
    
    /**
     * Check if the email server is available
     */
    async checkServerAvailability() {
      try {
        const response = await fetch('/api/health', { method: 'GET' });
        this.isServerAvailable = response.status === 200;
      } catch (error) {
        console.warn('Email server not available. Will use fallback method.');
        this.isServerAvailable = false;
      }
    }
    
    /**
     * Send email with T&M Ticket
     * @param {Object} emailData - Email data including recipient, subject, message and PDF
     * @returns {Promise<Object>} - Response from the server
     */
    async sendEmail(emailData) {
      const { to, cc, subject, message, pdfData } = emailData;
      
      if (!to) {
        throw new Error('Recipient email is required');
      }
      
      if (this.isServerAvailable) {
        // Server is available, so send via API
        try {
          const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              to,
              cc,
              subject,
              message,
              pdfData
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to send email');
          }
          
          const result = await response.json();
          return result;
        } catch (error) {
          console.error('Error sending email via server:', error);
          this.fallbackEmailMethod(emailData);
          return { success: false, error: error.message };
        }
      } else {
        // Server not available, use fallback method
        return this.fallbackEmailMethod(emailData);
      }
    }
    
    /**
     * Fallback method for email when server is not available
     * Uses mailto: protocol to open default email client
     * @param {Object} emailData - Email data
     * @returns {Object} - Status object
     */
    fallbackEmailMethod(emailData) {
      const { to, cc, subject, message } = emailData;
      
      try {
        let mailtoUrl = `mailto:${to}`;
        
        if (cc) {
          mailtoUrl += `?cc=${cc}`;
        }
        
        const params = new URLSearchParams();
        if (subject) params.append('subject', subject);
        if (message) params.append('body', message);
        
        if (params.toString()) {
          mailtoUrl += `${mailtoUrl.includes('?') ? '&' : '?'}${params.toString()}`;
        }
        
        // Open default mail client
        window.open(mailtoUrl);
        
        return { 
          success: true, 
          message: 'Email client opened with pre-filled content',
          fallback: true
        };
      } catch (error) {
        console.error('Error using fallback email method:', error);
        return { success: false, error: error.message, fallback: true };
      }
    }
  }
  
  // Create and export a singleton instance
  const emailService = new EmailService();
  export default emailService;