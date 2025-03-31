/**
 * Main entry point for the T&M Ticket Generator application
 * Initializes modules and services
 */

// Import services
import dbService from './dbService.js';
import emailService from './emailService.js';
import pdfService from './pdfService.js';

// Labor rates configuration
const laborRates = {
  "Journeyman": 45.00,
  "Apprentice": 32.00,
  "Master": 65.00
};

// Markup percentages configuration
const markupRates = {
  "generalConditions": 0.05, // 5%
  "insurance": 0.02, // 2%
  "overhead": 0.10, // 10%
  "fee": 0.05 // 5%
};

// Global state
let state = {
  materialsDatabase: [],
  equipmentDatabase: [],
  signaturePad: null,
  approvalSignaturePad: null,
  currentTicketId: null
};

/**
 * Initialize the application
 */
function initApp() {
  // Load databases
  loadDatabases();
  
  // Set today's date as default
  document.getElementById('ticketDate').valueAsDate = new Date();
  
  // Initialize signature pads
  initSignaturePads();
  
  // Add event listeners
  setupEventListeners();
  
  // Add initial rows
  addLabor();
  addMaterial();
  addEquipment();
  
  // Check for URL parameters
  checkUrlParameters();
  
  console.log('T&M Ticket Generator initialized');
}

/**
 * Load materials and equipment databases
 */
function loadDatabases() {
  // Load from DB service
  state.materialsDatabase = dbService.getMaterialsDB();
  state.equipmentDatabase = dbService.getEquipmentDB();
  
  // Initialize the database tables
  loadMaterialsDatabase();
  loadEquipmentDatabase();
}

/**
 * Initialize signature pads
 */
function initSignaturePads() {
  try {
    const signatureCanvas = document.getElementById('signatureCanvas');
    const approvalSignatureCanvas = document.getElementById('approvalSignatureCanvas');
    
    state.signaturePad = new SignaturePad(signatureCanvas, {
      penColor: 'black',
      backgroundColor: 'rgba(255, 255, 255, 0)'
    });
    
    state.approvalSignaturePad = new SignaturePad(approvalSignatureCanvas, {
      penColor: 'black',
      backgroundColor: 'rgba(255, 255, 255, 0)'
    });
  } catch (error) {
    console.error('Error initializing signature pads:', error);
  }
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
  // Clear signature buttons
  document.getElementById('clearSignatureBtn').addEventListener('click', () => {
    if (state.signaturePad) state.signaturePad.clear();
  });
  
  document.getElementById('clearApprovalSignatureBtn').addEventListener('click', () => {
    if (state.approvalSignaturePad) state.approvalSignaturePad.clear();
  });

  // Add labor, material, equipment buttons
  document.getElementById('addLaborBtn').addEventListener('click', addLabor);
  document.getElementById('addMaterialBtn').addEventListener('click', addMaterial);
  document.getElementById('addEquipmentBtn').addEventListener('click', addEquipment);

  // Database management
  document.getElementById('addMaterialToDbBtn').addEventListener('click', addMaterialToDatabase);
  document.getElementById('addEquipmentToDbBtn').addEventListener('click', addEquipmentToDatabase);
  document.getElementById('saveMaterialsDbBtn').addEventListener('click', saveMaterialsDatabase);
  document.getElementById('saveEquipmentDbBtn').addEventListener('click', saveEquipmentDatabase);

  // Preview button
  document.getElementById('previewBtn').addEventListener('click', generatePreview);

  // Markup checkboxes
  document.querySelectorAll('.form-check-input').forEach(checkbox => {
    checkbox.addEventListener('change', generatePreview);
  });

  // Output options
  document.getElementById('emailBtn').addEventListener('click', () => {
    new bootstrap.Modal(document.getElementById('emailModal')).show();
  });
  
  document.getElementById('sendEmailBtn').addEventListener('click', sendEmail);
  document.getElementById('pdfBtn').addEventListener('click', generateAndSavePDF);
  document.getElementById('printBtn').addEventListener('click', printTicket);
}

/**
 * Check URL parameters for loaded ticket
 */
function checkUrlParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const ticketId = urlParams.get('ticketId');
  
  if (ticketId) {
    loadTicket(ticketId);
  }
}

/**
 * Load a saved ticket by ID
 * @param {string} ticketId - ID of the ticket to load
 */
function loadTicket(ticketId) {
  const tickets = dbService.getSavedTickets();
  const ticket = tickets.find(t => t.id === ticketId);
  
  if (ticket) {
    state.currentTicketId = ticketId;
    
    // Populate form fields with ticket data
    document.getElementById('projectName').value = ticket.projectName || '';
    document.getElementById('projectNumber').value = ticket.projectNumber || '';
    document.getElementById('ticketDate').value = ticket.ticketDate || '';
    document.getElementById('ticketNumber').value = ticket.ticketNumber || '';
    document.getElementById('contractor').value = ticket.contractor || '';
    document.getElementById('location').value = ticket.location || '';
    document.getElementById('workDescription').value = ticket.workDescription || '';
    
    // Generate preview
    generatePreview();
  }
}

/**
 * Generate and save PDF using the pdfService
 */
function generateAndSavePDF() {
  const previewPanel = document.getElementById('previewPanel');
  const projectName = document.getElementById('projectName').value;
  const ticketNumber = document.getElementById('ticketNumber').value;
  
  const options = {
    filename: `T&M_Ticket_${projectName}_${ticketNumber}.pdf`,
    format: 'a4',
    orientation: 'portrait',
    save: true
  };
  
  try {
    pdfService.generatePDF(previewPanel, options)
      .then(pdfData => {
        console.log('PDF generated successfully');
        return pdfData;
      })
      .catch(error => {
        console.error('Error generating PDF:', error);
        alert('There was an error generating the PDF. Please try again.');
      });
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('There was an error generating the PDF. Please try again.');
  }
}

/**
 * Send email with ticket data
 */
async function sendEmail() {
  const to = document.getElementById('emailTo').value;
  const cc = document.getElementById('emailCc').value;
  const subject = document.getElementById('emailSubject').value;
  const message = document.getElementById('emailMessage').value;
  
  if (!to) {
    alert('Please enter a recipient email address');
    return;
  }
  
  try {
    // Generate PDF data for attachment
    const previewPanel = document.getElementById('previewPanel');
    const pdfData = await pdfService.generatePDF(previewPanel, { save: false });
    
    // Send email with PDF attachment
    const emailData = {
      to,
      cc,
      subject,
      message,
      pdfData
    };
    
    const result = await emailService.sendEmail(emailData);
    
    if (result.success) {
      if (result.fallback) {
        alert('Email client opened. Please complete the email and send it manually.');
      } else {
        alert('Email sent successfully!');
      }
      
      // Close modal
      const emailModal = bootstrap.Modal.getInstance(document.getElementById('emailModal'));
      emailModal.hide();
    } else {
      alert(`Error sending email: ${result.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error sending email:', error);
    alert('There was an error sending the email. Please try again.');
  }
}

/**
 * Print the ticket
 */
function printTicket() {
  window.print();
}

// Add labor, materials, equipment management, preview generation, and totals calculation functions
// These will be adapted from app.js to use the state and services

/**
 * Add a new labor row
 */
function addLabor() {
  const laborContainer = document.getElementById('laborContainer');
  const laborId = Date.now();
  
  const laborHtml = `
    <div class="item-row" id="labor-${laborId}">
      <div class="row">
        <div class="col-md-3">
          <label class="form-label">Labor Type</label>
          <select class="form-select labor-type" data-id="${laborId}">
            <option value="Journeyman" selected>Journeyman ($45.00/hr)</option>
            <option value="Apprentice">Apprentice ($32.00/hr)</option>
            <option value="Master">Master ($65.00/hr)</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label">Hours</label>
          <input type="number" class="form-control labor-hours" min="0" step="0.5" value="0" data-id="${laborId}">
        </div>
        <div class="col-md-3">
          <label class="form-label">Rate ($/hr)</label>
          <input type="number" class="form-control labor-rate" value="45.00" readonly data-id="${laborId}">
        </div>
        <div class="col-md-2">
          <label class="form-label">Amount ($)</label>
          <input type="text" class="form-control labor-amount" value="0.00" readonly data-id="${laborId}">
        </div>
        <div class="col-md-1 d-flex align-items-end justify-content-end">
          <a class="remove-btn" onclick="removeRow('labor-${laborId}')">
            <i class="fas fa-times"></i>
          </a>
        </div>
      </div>
    </div>
  `;
  
  laborContainer.insertAdjacentHTML('beforeend', laborHtml);
  
  // Add event listeners to the new inputs
  document.querySelector(`.labor-type[data-id="${laborId}"]`).addEventListener('change', updateLaborRate);
  document.querySelector(`.labor-hours[data-id="${laborId}"]`).addEventListener('input', calculateLaborAmount);
}

// Add remaining functions from app.js adapted to the module structure...
// The rest of the implementation would follow a similar pattern to app.js
// but using the state and imported services

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);