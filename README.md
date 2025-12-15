# NotiBoost React SDK

Official React SDK for NotiBoost - Notification Orchestration Platform.

## Installation

```bash
npm install @notiboost/react-sdk
```

## Requirements

- React 16.8+ (for hooks support)
- @notiboost/browser-sdk (peer dependency)

## Quick Start

```jsx
import React from 'react';
import { NotiBoostProvider, useNotiBoost } from '@notiboost/react-sdk';

function App() {
  return (
    <NotiBoostProvider apiKey="YOUR_API_KEY">
      <OrderComponent />
    </NotiBoostProvider>
  );
}

function OrderComponent() {
  const { ingestEvent } = useNotiBoost();

  const handleOrderCreated = async () => {
    try {
      const result = await ingestEvent({
        event_name: 'order_created',
        event_id: 'evt_001',
        occurred_at: new Date().toISOString(),
        user_id: 'u_123',
        properties: {
          order_id: 'A001',
          amount: 350000
        }
      });
      console.log('Trace ID:', result.trace_id);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <button onClick={handleOrderCreated}>
      Create Order
    </button>
  );
}
```

## API Reference

### NotiBoostProvider

Provider component that wraps your app and provides NotiBoost client to all child components.

```jsx
<NotiBoostProvider
  apiKey="YOUR_API_KEY"
  baseURL="https://api.notiboost.com"  // optional
  timeout={30000}                       // optional
  retries={3}                          // optional
>
  <YourApp />
</NotiBoostProvider>
```

**Props:**
- `apiKey` (string, required) - Your NotiBoost API key
- `baseURL` (string, optional) - Custom API base URL
- `timeout` (number, optional) - Request timeout in milliseconds
- `retries` (number, optional) - Number of retry attempts

### useNotiBoost Hook

Hook to access NotiBoost client methods.

```jsx
const {
  client,
  ingestEvent,
  ingestEventBatch,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  setChannelData,
  setPreferences,
  loading,
  error
} = useNotiBoost();
```

**Returns:**
- `client` - NotiBoost client instance
- `ingestEvent(event)` - Ingest a single event
- `ingestEventBatch(events)` - Ingest multiple events
- `createUser(user)` - Create a new user
- `getUser(userId)` - Get user by ID
- `updateUser(userId, data)` - Update user
- `deleteUser(userId)` - Delete user
- `setChannelData(userId, channelData)` - Set channel data
- `setPreferences(userId, preferences)` - Set user preferences
- `loading` - Loading state
- `error` - Error state

### useEvent Hook

Hook for tracking events with automatic loading and error states.

```jsx
function OrderComponent() {
  const { ingest, loading, error } = useEvent();

  const handleOrderCreated = async () => {
    const result = await ingest({
      event_name: 'order_created',
      event_id: 'evt_001',
      occurred_at: new Date().toISOString(),
      user_id: 'u_123',
      properties: {
        order_id: 'A001',
        amount: 350000
      }
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <button onClick={handleOrderCreated}>Create Order</button>;
}
```

### useUser Hook

Hook for managing users with automatic loading and error states.

```jsx
function UserProfile({ userId }) {
  const { user, loading, error, update, setChannelData } = useUser(userId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <button onClick={() => update({ name: 'New Name' })}>
        Update Name
      </button>
      <button onClick={() => setChannelData({ email: 'new@example.com' })}>
        Update Email
      </button>
    </div>
  );
}
```

## Examples

### Tracking Page Views

```jsx
import { useEffect } from 'react';
import { useNotiBoost } from '@notiboost/react-sdk';

function PageViewTracker() {
  const { ingestEvent } = useNotiBoost();

  useEffect(() => {
    ingestEvent({
      event_name: 'page_viewed',
      event_id: `page_${Date.now()}`,
      occurred_at: new Date().toISOString(),
      user_id: getCurrentUserId(),
      properties: {
        page: window.location.pathname,
        referrer: document.referrer
      }
    });
  }, []);

  return null;
}
```

### User Registration

```jsx
import { useState } from 'react';
import { useNotiBoost } from '@notiboost/react-sdk';

function RegisterForm() {
  const { createUser } = useNotiBoost();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createUser({
        user_id: generateUserId(),
        name: e.target.name.value,
        email: e.target.email.value,
        phone: e.target.phone.value
      });
      // Show success message
    } catch (error) {
      // Show error message
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" />
      <input name="email" type="email" placeholder="Email" />
      <input name="phone" placeholder="Phone" />
      <button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}
```

### E-commerce Order Tracking

```jsx
import { useNotiBoost } from '@notiboost/react-sdk';

function CheckoutButton({ order }) {
  const { ingestEvent } = useNotiBoost();

  const handleCheckout = async () => {
    // Process order...
    
    // Track order event
    await ingestEvent({
      event_name: 'order_created',
      event_id: `order_${order.id}`,
      occurred_at: new Date().toISOString(),
      user_id: order.user_id,
      properties: {
        order_id: order.id,
        amount: order.total,
        items: order.items.length,
        currency: 'VND'
      }
    });
  };

  return <button onClick={handleCheckout}>Checkout</button>;
}
```

### Notification Preferences

```jsx
import { useState } from 'react';
import { useNotiBoost } from '@notiboost/react-sdk';

function NotificationSettings({ userId }) {
  const { setPreferences } = useNotiBoost();
  const [preferences, setLocalPreferences] = useState({
    zns: true,
    email: true,
    sms: false,
    push: true
  });

  const handleToggle = async (channel, enabled) => {
    const newPrefs = { ...preferences, [channel]: enabled };
    setLocalPreferences(newPrefs);
    
    await setPreferences(userId, {
      channels: {
        zns: { enabled: newPrefs.zns },
        email: { enabled: newPrefs.email },
        sms: { enabled: newPrefs.sms },
        push: { enabled: newPrefs.push }
      }
    });
  };

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={preferences.zns}
          onChange={(e) => handleToggle('zns', e.target.checked)}
        />
        ZNS
      </label>
      <label>
        <input
          type="checkbox"
          checked={preferences.email}
          onChange={(e) => handleToggle('email', e.target.checked)}
        />
        Email
      </label>
      {/* ... more channels */}
    </div>
  );
}
```

## Error Handling

```jsx
import { useNotiBoost } from '@notiboost/react-sdk';

function MyComponent() {
  const { ingestEvent, error } = useNotiBoost();

  const handleEvent = async () => {
    try {
      await ingestEvent(event);
    } catch (err) {
      if (err.statusCode === 429) {
        console.log('Rate limit exceeded');
      } else if (err.statusCode === 401) {
        console.error('Invalid API key');
      } else {
        console.error('Error:', err.message);
      }
    }
  };

  return (
    <div>
      {error && <div className="error">{error.message}</div>}
      <button onClick={handleEvent}>Send Event</button>
    </div>
  );
}
```

## TypeScript Support

Full TypeScript definitions are included:

```tsx
import React from 'react';
import { NotiBoostProvider, useNotiBoost, Event } from '@notiboost/react-sdk';

function App() {
  return (
    <NotiBoostProvider apiKey="YOUR_API_KEY">
      <OrderComponent />
    </NotiBoostProvider>
  );
}

function OrderComponent() {
  const { ingestEvent } = useNotiBoost();

  const handleOrderCreated = async () => {
    const event: Event = {
      event_name: 'order_created',
      event_id: 'evt_001',
      occurred_at: new Date().toISOString(),
      user_id: 'u_123',
      properties: {
        order_id: 'A001',
        amount: 350000
      }
    };

    const result = await ingestEvent(event);
    console.log(result.trace_id);
  };

  return <button onClick={handleOrderCreated}>Create Order</button>;
}
```

## Best Practices

1. **Wrap your app with NotiBoostProvider** at the root level
2. **Use hooks** for automatic state management
3. **Handle errors** gracefully in your components
4. **Use loading states** for better UX
5. **Never expose API keys** in client-side code - use environment variables
6. **Consider using a backend proxy** for production applications

## Security Note

⚠️ **Important**: For production applications:

1. Never expose your main API key in React code
2. Use environment variables: `process.env.REACT_APP_NOTIBOOST_API_KEY`
3. Consider using a backend proxy to forward requests
4. Implement proper CORS policies
5. Use separate API keys with limited permissions for frontend

