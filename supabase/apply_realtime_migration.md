# Enable Real-time for Messages

## Steps to Apply the Migration

1. **Apply the migration to your Supabase database:**
   ```bash
   supabase db push
   ```

2. **Or apply the migration manually in Supabase Dashboard:**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `20250102_enable_realtime_messages.sql`
   - Run the SQL

## Verify Real-time is Working

1. **Check if real-time is enabled:**
   - Go to Database > Replication in Supabase Dashboard
   - Verify that `messages` table is listed under "Replicated Tables"

2. **Test the connection:**
   - Open browser console in your app
   - Send a message
   - Check if you see real-time subscription logs

## Troubleshooting

If real-time still doesn't work:

1. **Check Supabase project settings:**
   - Ensure your project is not on the free tier (real-time has limitations on free tier)
   - Verify API keys are correct

2. **Check RLS policies:**
   - Ensure the user has proper permissions to read messages
   - Test with a simple query first

3. **Check network connectivity:**
   - Ensure WebSocket connections are not blocked
   - Check browser console for connection errors

## Alternative: Manual Refresh

If real-time continues to not work, you can implement a polling mechanism as a fallback:

```javascript
// Poll for new messages every 5 seconds
useEffect(() => {
  const interval = setInterval(() => {
    // Refetch messages
    loadMessages();
  }, 5000);
  
  return () => clearInterval(interval);
}, []);
```
