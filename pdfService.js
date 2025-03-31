/**
 * PDF Service for T&M Ticket Generator
 * Handles PDF generation and formatting
 */

class PDFService {
    constructor() {
      this.pdfLib = window.jspdf;
    }
    
    /**
     * Generate PDF from HTML element
     * @param {HTMLElement} element - The HTML element to convert
     * @param {Object} options - PDF options
     * @returns {Promise<string>} - Base64 encoded PDF data
     */
    async generatePDF(element, options = {}) {
      if (!element) {
        throw new Error('Element is required for PDF generation');
      }
      
      const {
        filename = 'T&M_Ticket.pdf',
        format = 'a4',
        orientation = 'portrait',
        save = true
      } = options;
      
      // Create new PDF document
      const { jsPDF } = this.pdfLib;
      const doc = new jsPDF(orientation, 'mm', format);
      
      try {
        // Generate PDF from HTML using html2canvas
        const canvas = await html2canvas(element, {
          scale: 2, // Higher scale for better quality
          useCORS: true,
          logging: false
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = orientation === 'portrait' ? 210 : 297; // A4 width in mm
        const pageHeight = orientation === 'portrait' ? 297 : 210; // A4 height in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
  
        // Add first page
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
  
        // Add additional pages if needed
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          doc.addPage();
          doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        
        // Save the PDF if save option is true
        if (save) {
          doc.save(filename);
        }
        
        // Return the PDF as base64 string
        return doc.output('datauristring');
      } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
      }
    }
    
    /**
     * Format PDF with additional metadata
     * @param {Object} data - Ticket data to include in metadata
     * @param {jsPDF} doc - The PDF document
     */
    formatPDF(data, doc) {
      if (!doc) return;
      
      // Add metadata
      doc.setProperties({
        title: `T&M Ticket - ${data.projectName || 'Project'}`,
        subject: `T&M Ticket #${data.ticketNumber || ''}`,
        author: 'T&M Ticket Generator',
        keywords: 'construction, time and materials, change order',
        creator: 'T&M Ticket Generator'
      });
      
      // Add footer with page numbers
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Page ${i} of ${totalPages}`, doc.internal.pageSize.getWidth() - 30, 
                 doc.internal.pageSize.getHeight() - 10);
      }
    }
  }
  
  // Create and export a singleton instance
  const pdfService = new PDFService();
  export default pdfService;