# Time & Materials Ticket Generator - Deployment Guide

This guide provides step-by-step instructions for deploying the T&M Ticket Generator application.

## Deployment Options

The application can be deployed in two ways:

1. **Standalone Deployment** - Client-side only, no server required
2. **Full Stack Deployment** - Includes server component for email functionality

## Option 1: Standalone Deployment

This is the simplest deployment option and requires only static file hosting.

### Files Required
- `index.html`
- `styles.css`
- `app.js`

### Deployment Steps

1. **Choose a Static Hosting Service**
   - GitHub Pages
   - Netlify
   - Vercel
   - Amazon S3
   - Any web server (Apache, Nginx, etc.)

2. **Upload the Files**
   - Upload the three files to your chosen hosting service

3. **Test the Application**
   - Open the deployed URL in a browser
   - Ensure all functionality works correctly
   
### Example: Deploying to GitHub Pages

1. Create a new GitHub repository
2. Upload the three files to the repository
3. Go to Settings → Pages
4. Select the main branch as the source
5. Click Save, and your site will be deployed

## Option 2: Full Stack Deployment

This option includes a Node.js server for email functionality.

### Files Required
- All files from Option 1
- `main.js`
- `dbService.js`
- `emailService.js`
- `pdfService.js`
- `server.js`
- `package.json`

### Deployment Steps

1. **Choose a Hosting Service with Node.js Support**
   - Heroku
   - Vercel
   - Netlify (with Functions)
   - DigitalOcean App Platform
   - AWS Elastic Beanstalk

2. **Prepare the Server**
   - Install Node.js (v14 or higher recommended)
   - Install dependencies: `npm install`

3. **Configure Environment Variables** (if needed)
   - For email functionality, configure SMTP settings
   - Example for Heroku:
     ```
     heroku config:set SMTP_HOST=smtp.example.com
     heroku config:set SMTP_PORT=587
     heroku config:set SMTP_USER=user@example.com
     heroku config:set SMTP_PASS=your_password
     ```

4. **Deploy the Application**
   - Push the code to your hosting service
   - Start the server: `npm start`

5. **Test the Application**
   - Open the deployed URL in a browser
   - Test all functionality, including email features

### Example: Deploying to Heroku

1. Create a Heroku account and install the Heroku CLI
2. Create a new Heroku app: `heroku create tm-ticket-generator`
3. Add a Procfile with the content: `web: node server.js`
4. Configure any environment variables
5. Push to Heroku: `git push heroku main`

## Configuration Options

### Email Configuration

For the full stack deployment, you'll need to configure email settings in `server.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'user@example.com',
    pass: process.env.SMTP_PASS || 'password'
  }
});
```

### Customizing Default Values

To customize default labor rates, edit the `laborRates` object in `app.js` or `main.js`:

```javascript
const laborRates = {
  "Journeyman": 45.00,  // Change these values as needed
  "Apprentice": 32.00,
  "Master": 65.00
};
```

To customize markup percentages, modify both the HTML and JavaScript:

1. Update the markup checkboxes in `index.html`
2. Update the calculation factors in the `calculateTotals` function

## Troubleshooting

### CORS Issues
If deploying the server and client separately, you may encounter CORS issues. Update `server.js` to allow cross-origin requests:

```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
```

### Module Loading Issues
If using the modular approach and encountering module loading issues:
1. Ensure all script tags have `type="module"`
2. Verify proper import/export syntax
3. Make sure the server is serving files with correct MIME types

### Email Functionality
If email sending fails:
1. Check SMTP configuration
2. Verify network connectivity to the SMTP server
3. Check for any firewall restrictions

## Performance Optimization

For production, consider these optimizations:

1. Minify JavaScript and CSS files
2. Enable compression on the server
3. Use a CDN for static assets
4. Implement proper caching headers

## Security Considerations

1. Use HTTPS for all deployments
2. Implement rate limiting for API endpoints
3. Validate all user inputs
4. Keep all dependencies updated
