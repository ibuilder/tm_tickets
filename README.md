# Construction Time & Materials Ticket System

A complete web-based solution for generating, managing, and outputting Time & Materials (T&M) tickets for construction project change orders.

## Features

- **Comprehensive Data Collection**: Capture all necessary project details including labor, materials, and equipment costs.
- **Repeatable Fields**: Add multiple entries for labor, materials, and equipment with appropriate details for each.
- **Customizable Databases**: Edit and manage both materials and equipment databases.
- **Labor Type Selection**: Choose from predefined labor types (Journeyman, Apprentice, Master) with associated rates.
- **Real-time Calculations**: Automatically calculate subtotals and final amounts based on quantities and rates.
- **Markup Options**: Apply standard construction markup percentages (general conditions, insurance, overhead, fee).
- **Preview Functionality**: Review the complete ticket before finalizing.
- **Multiple Output Options**: Email, print, or save as PDF.
- **Digital Signatures**: Add digital signatures for validation.

## Implementation Options

This application can be implemented in two ways:

1. **Standalone Implementation** - Client-side only, using 3 files:
   - `index.html`
   - `styles.css`
   - `app.js`

2. **Modular Implementation** - More advanced with server support for email:
   - All standalone files plus:
   - `dbService.js`, `emailService.js`, `pdfService.js`, `main.js`
   - `server.js`, `package.json`

Choose the implementation that fits your needs. See `implementation-comparison.md` for details.

## Setup Instructions

### Standalone Implementation

1. Download the following files to your local machine or web server:
   - `index.html`
   - `styles.css`
   - `app.js`
2. Open `index.html` in any modern web browser.

### Modular Implementation

1. Download all files to your web server with Node.js support.
2. Run `npm install` to install the required dependencies.
3. Start the server with `npm start`.
4. Open your browser and navigate to the server address (default: http://localhost:3000).

See `deployment-guide.md` for detailed deployment instructions.

## Using the Application

### Creating a New T&M Ticket

1. Fill in the project information (Name, Number, Date, etc.).
2. Add labor entries by clicking the "Add Labor" button.
   - Select labor type (Journeyman, Apprentice, Master)
   - Enter hours worked
3. Add material entries by clicking the "Add Material" button.
   - Select material from the dropdown
   - Enter quantity
4. Add equipment entries by clicking the "Add Equipment" button.
   - Select equipment from the dropdown
   - Enter quantity
5. Select any applicable markup options.
6. Click "Preview Ticket" to review the completed ticket.

### Managing Databases

1. Click "Edit Materials DB" or "Edit Equipment DB" to open the respective database editor.
2. Add new items by filling in the form at the top and clicking "Add".
3. Remove items by clicking the trash icon next to each entry.
4. Click "Save Changes" to update the database.

### Outputting the Ticket

From the preview panel, you can:
1. **Email**: Click the Email button to open the email form, fill in recipient information and send.
2. **Save as PDF**: Click the PDF button to generate and download a PDF version.
3. **Print**: Click the Print button to open the browser's print dialog.

### Digital Signatures

1. In the preview panel, sign in the "Prepared By" signature field.
2. Have the approver sign in the "Approved By" signature field.
3. Use the "Clear" buttons to reset signatures if needed.

## Customization

### Labor Rates

Labor rates are defined in the JavaScript code. To modify them, edit the `laborRates` object:

```javascript
const laborRates = {
    "Journeyman": 45.00,
    "Apprentice": 32.00,
    "Master": 65.00
};
```

### Markup Percentages

Markup percentages are defined in both the HTML and JavaScript. To modify them:

1. Update the text in the checkbox labels in the HTML.
2. Update the calculation factors in the `calculateTotals` function.

## Browser Compatibility

This application is compatible with all modern browsers including:
- Google Chrome
- Mozilla Firefox
- Microsoft Edge
- Safari

## Technical Details

This application uses:
- HTML5
- CSS3 with Bootstrap 5
- Vanilla JavaScript
- Font Awesome for icons
- jsPDF for PDF generation
- html2canvas for HTML-to-image conversion
- signature_pad for digital signatures
- Express.js (for modular implementation with server)
- Nodemailer (for email functionality in modular implementation)

## Data Storage

- **Standalone Implementation**: The application stores material and equipment databases in the browser's localStorage.
- **Modular Implementation**: Includes the option to store data server-side.

## Troubleshooting

If you encounter issues:

1. **JavaScript Console Errors**: Open your browser's developer tools (F12) and check the console for errors.
2. **Email Functionality**: When using the modular implementation, verify SMTP settings in the server configuration.
3. **PDF Generation**: Ensure all required libraries are properly loaded.
4. **Local Storage**: If database entries disappear, check that your browser settings allow localStorage.

## Future Enhancements

Potential improvements for future versions:
- Server-side storage for tickets and databases
- User authentication
- Project-specific databases
- Custom labor types
- Historical ticket tracking
- Integration with accounting systems

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.