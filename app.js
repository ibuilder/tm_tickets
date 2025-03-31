/**
 * Construction T&M Ticket Generator
 * Main JavaScript file
 */

// Sample data
let materialsDatabase = [
    { id: 1, name: "2x4 Lumber", unit: "ft", price: 0.89 },
    { id: 2, name: "Plywood 4x8 Sheet", unit: "ea", price: 45.99 },
    { id: 3, name: "Drywall 4x8 Sheet", unit: "ea", price: 15.50 },
    { id: 4, name: "Concrete Mix", unit: "bag", price: 12.75 },
    { id: 5, name: "PVC Pipe 1\"", unit: "ft", price: 2.30 }
];

let equipmentDatabase = [
    { id: 1, name: "Backhoe", unit: "hour", price: 120.00 },
    { id: 2, name: "Concrete Mixer", unit: "day", price: 95.00 },
    { id: 3, name: "Scissor Lift", unit: "day", price: 210.00 },
    { id: 4, name: "Compressor", unit: "day", price: 75.00 },
    { id: 5, name: "Generator", unit: "day", price: 65.00 }
];

// Labor rates
const laborRates = {
    "Journeyman": 45.00,
    "Apprentice": 32.00,
    "Master": 65.00
};

// Initialize signature pads
let signaturePad, approvalSignaturePad;

document.addEventListener('DOMContentLoaded', function() {
    // Load databases from localStorage if available
    const savedMaterials = localStorage.getItem('materialsDatabase');
    if (savedMaterials) {
        materialsDatabase = JSON.parse(savedMaterials);
    }
    
    const savedEquipment = localStorage.getItem('equipmentDatabase');
    if (savedEquipment) {
        equipmentDatabase = JSON.parse(savedEquipment);
    }
    
    // Initialize signature pads
    const signatureCanvas = document.getElementById('signatureCanvas');
    const approvalSignatureCanvas = document.getElementById('approvalSignatureCanvas');
    
    signaturePad = new SignaturePad(signatureCanvas);
    approvalSignaturePad = new SignaturePad(approvalSignatureCanvas);
    
    // Clear signature buttons
    document.getElementById('clearSignatureBtn').addEventListener('click', function() {
        signaturePad.clear();
    });
    
    document.getElementById('clearApprovalSignatureBtn').addEventListener('click', function() {
        approvalSignaturePad.clear();
    });

    // Initialize the databases
    loadMaterialsDatabase();
    loadEquipmentDatabase();

    // Set today's date as default
    document.getElementById('ticketDate').valueAsDate = new Date();

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
    document.getElementById('emailBtn').addEventListener('click', function() {
        new bootstrap.Modal(document.getElementById('emailModal')).show();
    });
    
    document.getElementById('sendEmailBtn').addEventListener('click', sendEmail);
    document.getElementById('pdfBtn').addEventListener('click', generatePDF);
    document.getElementById('printBtn').addEventListener('click', printTicket);

    // Add initial rows
    addLabor();
    addMaterial();
    addEquipment();
});

// Add a new labor row
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

// Update labor rate based on selected type
function updateLaborRate(event) {
    const laborId = event.target.getAttribute('data-id');
    const laborType = event.target.value;
    const rate = laborRates[laborType];
    
    const rateInput = document.querySelector(`.labor-rate[data-id="${laborId}"]`);
    rateInput.value = rate.toFixed(2);
    
    calculateLaborAmount({ target: rateInput });
}

// Calculate labor amount
function calculateLaborAmount(event) {
    const laborId = event.target.getAttribute('data-id');
    const hours = parseFloat(document.querySelector(`.labor-hours[data-id="${laborId}"]`).value) || 0;
    const rate = parseFloat(document.querySelector(`.labor-rate[data-id="${laborId}"]`).value) || 0;
    
    const amount = hours * rate;
    document.querySelector(`.labor-amount[data-id="${laborId}"]`).value = amount.toFixed(2);
}

// Add a new material row
function addMaterial() {
    const materialsContainer = document.getElementById('materialsContainer');
    const materialId = Date.now();
    
    let materialOptions = '';
    materialsDatabase.forEach(material => {
        materialOptions += `<option value="${material.id}" data-unit="${material.unit}" data-price="${material.price.toFixed(2)}">${material.name} ($${material.price.toFixed(2)}/${material.unit})</option>`;
    });
    
    const materialHtml = `
        <div class="item-row" id="material-${materialId}">
            <div class="row">
                <div class="col-md-4">
                    <label class="form-label">Material</label>
                    <select class="form-select material-type" data-id="${materialId}">
                        <option value="">Select Material</option>
                        ${materialOptions}
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label">Quantity</label>
                    <input type="number" class="form-control material-quantity" min="0" step="0.01" value="0" data-id="${materialId}">
                </div>
                <div class="col-md-2">
                    <label class="form-label">Unit</label>
                    <input type="text" class="form-control material-unit" value="" readonly data-id="${materialId}">
                </div>
                <div class="col-md-2">
                    <label class="form-label">Price ($)</label>
                    <input type="number" class="form-control material-price" value="0.00" readonly data-id="${materialId}">
                </div>
                <div class="col-md-1">
                    <label class="form-label">Amount ($)</label>
                    <input type="text" class="form-control material-amount" value="0.00" readonly data-id="${materialId}">
                </div>
                <div class="col-md-1 d-flex align-items-end justify-content-end">
                    <a class="remove-btn" onclick="removeRow('material-${materialId}')">
                        <i class="fas fa-times"></i>
                    </a>
                </div>
            </div>
        </div>
    `;
    
    materialsContainer.insertAdjacentHTML('beforeend', materialHtml);
    
    // Add event listeners to the new inputs
    document.querySelector(`.material-type[data-id="${materialId}"]`).addEventListener('change', updateMaterialInfo);
    document.querySelector(`.material-quantity[data-id="${materialId}"]`).addEventListener('input', calculateMaterialAmount);
}

// Update material information based on selection
function updateMaterialInfo(event) {
    const materialId = event.target.getAttribute('data-id');
    const selectedOption = event.target.options[event.target.selectedIndex];
    
    if (selectedOption.value) {
        const unit = selectedOption.getAttribute('data-unit');
        const price = parseFloat(selectedOption.getAttribute('data-price'));
        
        document.querySelector(`.material-unit[data-id="${materialId}"]`).value = unit;
        document.querySelector(`.material-price[data-id="${materialId}"]`).value = price.toFixed(2);
        
        calculateMaterialAmount({ target: event.target });
    } else {
        document.querySelector(`.material-unit[data-id="${materialId}"]`).value = '';
        document.querySelector(`.material-price[data-id="${materialId}"]`).value = '0.00';
        document.querySelector(`.material-amount[data-id="${materialId}"]`).value = '0.00';
    }
}

// Calculate material amount
function calculateMaterialAmount(event) {
    const materialId = event.target.getAttribute('data-id');
    const quantity = parseFloat(document.querySelector(`.material-quantity[data-id="${materialId}"]`).value) || 0;
    const price = parseFloat(document.querySelector(`.material-price[data-id="${materialId}"]`).value) || 0;
    
    const amount = quantity * price;
    document.querySelector(`.material-amount[data-id="${materialId}"]`).value = amount.toFixed(2);
}

// Add a new equipment row
function addEquipment() {
    const equipmentContainer = document.getElementById('equipmentContainer');
    const equipmentId = Date.now();
    
    let equipmentOptions = '';
    equipmentDatabase.forEach(equipment => {
        equipmentOptions += `<option value="${equipment.id}" data-unit="${equipment.unit}" data-price="${equipment.price.toFixed(2)}">${equipment.name} ($${equipment.price.toFixed(2)}/${equipment.unit})</option>`;
    });
    
    const equipmentHtml = `
        <div class="item-row" id="equipment-${equipmentId}">
            <div class="row">
                <div class="col-md-4">
                    <label class="form-label">Equipment</label>
                    <select class="form-select equipment-type" data-id="${equipmentId}">
                        <option value="">Select Equipment</option>
                        ${equipmentOptions}
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label">Quantity</label>
                    <input type="number" class="form-control equipment-quantity" min="0" step="0.01" value="0" data-id="${equipmentId}">
                </div>
                <div class="col-md-2">
                    <label class="form-label">Unit</label>
                    <input type="text" class="form-control equipment-unit" value="" readonly data-id="${equipmentId}">
                </div>
                <div class="col-md-2">
                    <label class="form-label">Price ($)</label>
                    <input type="number" class="form-control equipment-price" value="0.00" readonly data-id="${equipmentId}">
                </div>
                <div class="col-md-1">
                    <label class="form-label">Amount ($)</label>
                    <input type="text" class="form-control equipment-amount" value="0.00" readonly data-id="${equipmentId}">
                </div>
                <div class="col-md-1 d-flex align-items-end justify-content-end">
                    <a class="remove-btn" onclick="removeRow('equipment-${equipmentId}')">
                        <i class="fas fa-times"></i>
                    </a>
                </div>
            </div>
        </div>
    `;
    
    equipmentContainer.insertAdjacentHTML('beforeend', equipmentHtml);
    
    // Add event listeners to the new inputs
    document.querySelector(`.equipment-type[data-id="${equipmentId}"]`).addEventListener('change', updateEquipmentInfo);
    document.querySelector(`.equipment-quantity[data-id="${equipmentId}"]`).addEventListener('input', calculateEquipmentAmount);
}

// Update equipment information based on selection
function updateEquipmentInfo(event) {
    const equipmentId = event.target.getAttribute('data-id');
    const selectedOption = event.target.options[event.target.selectedIndex];
    
    if (selectedOption.value) {
        const unit = selectedOption.getAttribute('data-unit');
        const price = parseFloat(selectedOption.getAttribute('data-price'));
        
        document.querySelector(`.equipment-unit[data-id="${equipmentId}"]`).value = unit;
        document.querySelector(`.equipment-price[data-id="${equipmentId}"]`).value = price.toFixed(2);
        
        calculateEquipmentAmount({ target: event.target });
    } else {
        document.querySelector(`.equipment-unit[data-id="${equipmentId}"]`).value = '';
        document.querySelector(`.equipment-price[data-id="${equipmentId}"]`).value = '0.00';
        document.querySelector(`.equipment-amount[data-id="${equipmentId}"]`).value = '0.00';
    }
}

// Calculate equipment amount
function calculateEquipmentAmount(event) {
    const equipmentId = event.target.getAttribute('data-id');
    const quantity = parseFloat(document.querySelector(`.equipment-quantity[data-id="${equipmentId}"]`).value) || 0;
    const price = parseFloat(document.querySelector(`.equipment-price[data-id="${equipmentId}"]`).value) || 0;
    
    const amount = quantity * price;
    document.querySelector(`.equipment-amount[data-id="${equipmentId}"]`).value = amount.toFixed(2);
}

// Remove a row
function removeRow(rowId) {
    document.getElementById(rowId).remove();
    generatePreview();
}

// Load materials database
function loadMaterialsDatabase() {
    const materialsDbTable = document.getElementById('materialsDbTable');
    materialsDbTable.innerHTML = '';
    
    materialsDatabase.forEach(material => {
        const row = `
            <tr>
                <td>${material.name}</td>
                <td>${material.unit}</td>
                <td>${material.price.toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="removeMaterial(${material.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        materialsDbTable.insertAdjacentHTML('beforeend', row);
    });
}

// Load equipment database
function loadEquipmentDatabase() {
    const equipmentDbTable = document.getElementById('equipmentDbTable');
    equipmentDbTable.innerHTML = '';
    
    equipmentDatabase.forEach(equipment => {
        const row = `
            <tr>
                <td>${equipment.name}</td>
                <td>${equipment.unit}</td>
                <td>${equipment.price.toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="removeEquipment(${equipment.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        equipmentDbTable.insertAdjacentHTML('beforeend', row);
    });
}

// Add material to database
function addMaterialToDatabase() {
    const name = document.getElementById('newMaterialName').value.trim();
    const unit = document.getElementById('newMaterialUnit').value.trim();
    const price = parseFloat(document.getElementById('newMaterialPrice').value) || 0;
    
    if (name && unit && price > 0) {
        const newId = materialsDatabase.length > 0 ? Math.max(...materialsDatabase.map(m => m.id)) + 1 : 1;
        
        materialsDatabase.push({
            id: newId,
            name: name,
            unit: unit,
            price: price
        });
        
        loadMaterialsDatabase();
        
        // Clear inputs
        document.getElementById('newMaterialName').value = '';
        document.getElementById('newMaterialUnit').value = '';
        document.getElementById('newMaterialPrice').value = '';
    } else {
        alert('Please enter valid material information');
    }
}

// Add equipment to database
function addEquipmentToDatabase() {
    const name = document.getElementById('newEquipmentName').value.trim();
    const unit = document.getElementById('newEquipmentUnit').value.trim();
    const price = parseFloat(document.getElementById('newEquipmentPrice').value) || 0;
    
    if (name && unit && price > 0) {
        const newId = equipmentDatabase.length > 0 ? Math.max(...equipmentDatabase.map(e => e.id)) + 1 : 1;
        
        equipmentDatabase.push({
            id: newId,
            name: name,
            unit: unit,
            price: price
        });
        
        loadEquipmentDatabase();
        
        // Clear inputs
        document.getElementById('newEquipmentName').value = '';
        document.getElementById('newEquipmentUnit').value = '';
        document.getElementById('newEquipmentPrice').value = '';
    } else {
        alert('Please enter valid equipment information');
    }
}

// Remove material from database
function removeMaterial(id) {
    materialsDatabase = materialsDatabase.filter(material => material.id !== id);
    loadMaterialsDatabase();
}

// Remove equipment from database
function removeEquipment(id) {
    equipmentDatabase = equipmentDatabase.filter(equipment => equipment.id !== id);
    loadEquipmentDatabase();
}

// Save materials database
function saveMaterialsDatabase() {
    // Save to localStorage
    localStorage.setItem('materialsDatabase', JSON.stringify(materialsDatabase));
    alert('Materials database saved successfully');
    
    // Refresh all material dropdowns
    const materialSelects = document.querySelectorAll('.material-type');
    materialSelects.forEach(select => {
        const materialId = select.getAttribute('data-id');
        const selectedValue = select.value;
        
        let materialOptions = '<option value="">Select Material</option>';
        materialsDatabase.forEach(material => {
            materialOptions += `<option value="${material.id}" data-unit="${material.unit}" data-price="${material.price.toFixed(2)}">${material.name} ($${material.price.toFixed(2)}/${material.unit})</option>`;
        });
        
        select.innerHTML = materialOptions;
        select.value = selectedValue;
    });
    
    // Close modal
    const materialsModal = bootstrap.Modal.getInstance(document.getElementById('materialsModal'));
    materialsModal.hide();
}

// Save equipment database
function saveEquipmentDatabase() {
    // Save to localStorage
    localStorage.setItem('equipmentDatabase', JSON.stringify(equipmentDatabase));
    alert('Equipment database saved successfully');
    
    // Refresh all equipment dropdowns
    const equipmentSelects = document.querySelectorAll('.equipment-type');
    equipmentSelects.forEach(select => {
        const equipmentId = select.getAttribute('data-id');
        const selectedValue = select.value;
        
        let equipmentOptions = '<option value="">Select Equipment</option>';
        equipmentDatabase.forEach(equipment => {
            equipmentOptions += `<option value="${equipment.id}" data-unit="${equipment.unit}" data-price="${equipment.price.toFixed(2)}">${equipment.name} ($${equipment.price.toFixed(2)}/${equipment.unit})</option>`;
        });
        
        select.innerHTML = equipmentOptions;
        select.value = selectedValue;
    });
    
    // Close modal
    const equipmentModal = bootstrap.Modal.getInstance(document.getElementById('equipmentModal'));
    equipmentModal.hide();
}

// Generate preview
function generatePreview() {
    // Get form values
    const projectName = document.getElementById('projectName').value;
    const projectNumber = document.getElementById('projectNumber').value;
    const ticketDate = document.getElementById('ticketDate').value;
    const ticketNumber = document.getElementById('ticketNumber').value;
    const contractor = document.getElementById('contractor').value;
    const location = document.getElementById('location').value;
    const workDescription = document.getElementById('workDescription').value;
    
    // Check if required fields are filled
    if (!projectName || !projectNumber || !ticketDate || !ticketNumber || !contractor || !workDescription) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Show preview panel
    document.getElementById('previewPanel').classList.remove('d-none');
    
    // Update preview basic info
    document.getElementById('previewProject').textContent = `${projectName} (${projectNumber})`;
    document.getElementById('previewTicketNumber').textContent = `Ticket #: ${ticketNumber}`;
    document.getElementById('previewDate').textContent = formatDate(ticketDate);
    document.getElementById('previewContractor').textContent = contractor;
    document.getElementById('previewLocation').textContent = location;
    document.getElementById('previewDescription').textContent = workDescription;
    
    // Calculate totals
    calculateTotals();
}

// Calculate all totals
function calculateTotals() {
    // Labor totals
    let laborTotal = 0;
    let laborItems = '';
    
    document.querySelectorAll('.labor-amount').forEach(element => {
        const amount = parseFloat(element.value) || 0;
        laborTotal += amount;
        
        if (amount > 0) {
            const laborId = element.getAttribute('data-id');
            const type = document.querySelector(`.labor-type[data-id="${laborId}"]`).value;
            const hours = document.querySelector(`.labor-hours[data-id="${laborId}"]`).value;
            const rate = document.querySelector(`.labor-rate[data-id="${laborId}"]`).value;
            
            laborItems += `<div>${type}: ${hours} hrs @ $${rate}/hr = $${amount.toFixed(2)}</div>`;
        }
    });
    
    document.getElementById('previewLabor').innerHTML = laborItems || '<div>None</div>';
    
    // Materials totals
    let materialsTotal = 0;
    let materialsItems = '';
    
    document.querySelectorAll('.material-amount').forEach(element => {
        const amount = parseFloat(element.value) || 0;
        materialsTotal += amount;
        
        if (amount > 0) {
            const materialId = element.getAttribute('data-id');
            const select = document.querySelector(`.material-type[data-id="${materialId}"]`);
            const materialName = select.options[select.selectedIndex].text.split(' ($')[0];
            const quantity = document.querySelector(`.material-quantity[data-id="${materialId}"]`).value;
            const unit = document.querySelector(`.material-unit[data-id="${materialId}"]`).value;
            const price = document.querySelector(`.material-price[data-id="${materialId}"]`).value;
            
            materialsItems += `<div>${materialName}: ${quantity} ${unit} @ $${price}/${unit} = $${amount.toFixed(2)}</div>`;
        }
    });
    
    document.getElementById('previewMaterials').innerHTML = materialsItems || '<div>None</div>';
    
    // Equipment totals
    let equipmentTotal = 0;
    let equipmentItems = '';
    
    document.querySelectorAll('.equipment-amount').forEach(element => {
        const amount = parseFloat(element.value) || 0;
        equipmentTotal += amount;
        
        if (amount > 0) {
            const equipmentId = element.getAttribute('data-id');
            const select = document.querySelector(`.equipment-type[data-id="${equipmentId}"]`);
            const equipmentName = select.options[select.selectedIndex].text.split(' ($')[0];
            const quantity = document.querySelector(`.equipment-quantity[data-id="${equipmentId}"]`).value;
            const unit = document.querySelector(`.equipment-unit[data-id="${equipmentId}"]`).value;
            const price = document.querySelector(`.equipment-price[data-id="${equipmentId}"]`).value;
            
            equipmentItems += `<div>${equipmentName}: ${quantity} ${unit} @ $${price}/${unit} = $${amount.toFixed(2)}</div>`;
        }
    });
    
    document.getElementById('previewEquipment').innerHTML = equipmentItems || '<div>None</div>';
    
    // Calculate subtotal
    const subtotal = laborTotal + materialsTotal + equipmentTotal;
    document.getElementById('previewSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    
    // Calculate markups
    let total = subtotal;
    let generalConditionsAmount = 0;
    let insuranceAmount = 0;
    let overheadAmount = 0;
    let feeAmount = 0;
    
    // General Conditions (5%)
    if (document.getElementById('generalConditions').checked) {
        generalConditionsAmount = subtotal * 0.05;
        total += generalConditionsAmount;
        document.getElementById('previewGeneralConditionsRow').classList.remove('d-none');
        document.getElementById('previewGeneralConditions').textContent = `$${generalConditionsAmount.toFixed(2)}`;
    } else {
        document.getElementById('previewGeneralConditionsRow').classList.add('d-none');
    }
    
    // Insurance (2%)
    if (document.getElementById('insurance').checked) {
        insuranceAmount = subtotal * 0.02;
        total += insuranceAmount;
        document.getElementById('previewInsuranceRow').classList.remove('d-none');
        document.getElementById('previewInsurance').textContent = `$${insuranceAmount.toFixed(2)}`;
    } else {
        document.getElementById('previewInsuranceRow').classList.add('d-none');
    }
    
    // Overhead (10%)
    if (document.getElementById('overhead').checked) {
        overheadAmount = subtotal * 0.10;
        total += overheadAmount;
        document.getElementById('previewOverheadRow').classList.remove('d-none');
        document.getElementById('previewOverhead').textContent = `$${overheadAmount.toFixed(2)}`;
    } else {
        document.getElementById('previewOverheadRow').classList.add('d-none');
    }
    
    // Fee (5%)
    if (document.getElementById('fee').checked) {
        feeAmount = subtotal * 0.05;
        total += feeAmount;
        document.getElementById('previewFeeRow').classList.remove('d-none');
        document.getElementById('previewFee').textContent = `$${feeAmount.toFixed(2)}`;
    } else {
        document.getElementById('previewFeeRow').classList.add('d-none');
    }
    
    // Update total
    document.getElementById('previewTotal').textContent = `$${total.toFixed(2)}`;
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Generate PDF
function generatePDF() {
    const { jsPDF } = window.jspdf;
    
    // Create new PDF document
    const doc = new jsPDF('p', 'mm', 'a4');
    const previewPanel = document.getElementById('previewPanel');
    
    // Generate PDF from HTML content
    html2canvas(previewPanel).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            doc.addPage();
            doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        // Save the PDF
        const projectName = document.getElementById('projectName').value;
        const ticketNumber = document.getElementById('ticketNumber').value;
        doc.save(`T&M_Ticket_${projectName}_${ticketNumber}.pdf`);
    });
}

// Send email
function sendEmail() {
    // In a real application, you would submit this to your backend
    const to = document.getElementById('emailTo').value;
    const cc = document.getElementById('emailCc').value;
    const subject = document.getElementById('emailSubject').value;
    const message = document.getElementById('emailMessage').value;
    
    if (!to) {
        alert('Please enter a recipient email address');
        return;
    }
    
    // For this demo, we'll just show an alert
    alert(`Email would be sent to ${to} with subject "${subject}"`);
    
    // Close modal
    const emailModal = bootstrap.Modal.getInstance(document.getElementById('emailModal'));
    emailModal.hide();
}

// Print ticket
function printTicket() {
    window.print();
}