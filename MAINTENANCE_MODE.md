# Maintenance Mode

## How to Enable/Disable Maintenance Mode

The application includes a maintenance mode that displays a user-friendly "Under Maintenance" page instead of the normal login and application.

### Configuration

Maintenance mode is controlled by the `VITE_MAINTENANCE_MODE` environment variable in your `.env.local` file.

#### To Enable Maintenance Mode:

1. Open `.env.local` file
2. Set `VITE_MAINTENANCE_MODE=true`
3. Restart your development server or rebuild the app

```env
VITE_MAINTENANCE_MODE=true
```

#### To Disable Maintenance Mode (Normal Operation):

1. Open `.env.local` file
2. Set `VITE_MAINTENANCE_MODE=false` or remove the line entirely
3. Restart your development server or rebuild the app

```env
VITE_MAINTENANCE_MODE=false
```

### Important Notes

- After changing the environment variable, you must **restart the development server** for changes to take effect
- For production deployments, set the environment variable in your hosting platform (Vercel, Netlify, etc.)
- When maintenance mode is active, users will see the maintenance page **before** the login screen
- The maintenance page includes:
  - Animated wrench icon
  - Clear messaging about scheduled maintenance
  - Pulsing status indicator
  - Responsive design for mobile and desktop

### Production Deployment (Vercel)

When deploying to Vercel, add the environment variable in your project settings:

1. Go to your Vercel project
2. Navigate to Settings → Environment Variables
3. Add `VITE_MAINTENANCE_MODE` with value `true` or `false`
4. Redeploy your application

This allows you to enable/disable maintenance mode without code changes!
