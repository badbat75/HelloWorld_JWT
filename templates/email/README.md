# Email Templates for HelloWorld JWT

This directory contains HTML email templates for use with Supabase authentication.

## Templates

### Magic Link Template (`magic-link.html`)

A professional, responsive HTML email template for magic link authentication that matches the design system of the HelloWorld JWT application.

**Features:**
- 🎨 Consistent branding with the main application
- 📱 Fully responsive design
- 🔒 Security-focused messaging
- ✨ Professional gradient styling
- 🚀 Clear call-to-action button
- 📧 Fallback link for email clients that don't support buttons

## How to Use with Supabase

### 1. Access Supabase Dashboard
1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Navigate to your project
3. Go to **Authentication** → **Email Templates**

### 2. Upload the Template
1. Select **Magic Link** from the template dropdown
2. Replace the default template with the content from `magic-link.html`
3. The template uses the following Supabase variables:
   - `{{ .ConfirmationURL }}` - The magic link URL
   - `{{ .Email }}` - User's email address (optional)
   - `{{ .Token }}` - Authentication token (optional)

### 3. Template Variables
The template is designed to work with Supabase's default template variables:
- `{{ .ConfirmationURL }}` - Required for the magic link functionality

### 4. Customization
You can customize the template by:
- Updating the branding colors in the CSS
- Modifying the header title and description
- Changing the greeting message
- Adjusting the security note text
- Updating the footer content

## Design System

The template uses the same design system as the main application:

### Colors
- **Primary**: `#3b82f6` (Blue-500)
- **Primary Dark**: `#2563eb` (Blue-600)
- **Text**: `#374151` (Gray-700)
- **Background**: `#f9fafb` (Gray-50)
- **Info**: `#dbeafe` (Blue-100)
- **Warning**: `#fef3c7` (Amber-100)

### Typography
- **Font Family**: Inter, system fonts fallback
- **Responsive font sizes**: 14px - 28px
- **Line height**: 1.6 - 1.7

### Components
- **Buttons**: Gradient background with hover effects
- **Cards**: Rounded corners with subtle shadows
- **Info boxes**: Colored backgrounds with matching borders
- **Responsive design**: Mobile-first approach

## Testing

Test the email template by:
1. Sending a test magic link email from your application
2. Checking the email in different email clients (Gmail, Outlook, Apple Mail)
3. Verifying the responsive design on mobile devices
4. Testing the magic link functionality

## Browser Support

The template is compatible with:
- ✅ Gmail (Web, Mobile)
- ✅ Outlook (Web, Desktop, Mobile)
- ✅ Apple Mail (macOS, iOS)
- ✅ Yahoo Mail
- ✅ Thunderbird
- ✅ Other major email clients

## Notes

- The template includes inline CSS for maximum email client compatibility
- Fallback fonts ensure consistent rendering across platforms
- The magic link button includes a fallback text link
- Security messaging helps users understand the authentication process
