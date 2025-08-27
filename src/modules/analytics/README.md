# Analytics Module

This module integrates [Umami Analytics](https://umami.is/) into the Borzolini Clinic API to provide privacy-focused, GDPR-compliant analytics tracking.

## Features

- **Privacy-Focused Analytics**: Umami is a privacy-first alternative to Google Analytics
- **Automatic API Tracking**: Tracks all API requests automatically via interceptor
- **Custom Event Tracking**: Support for custom business events
- **Role-Based Access**: Admin-only access to analytics status and configuration
- **Comprehensive Logging**: Detailed logging for debugging and monitoring

## Configuration

Add the following environment variables to your `.env.local` file:

```bash
# Umami Analytics Configuration
UMAMI_ENABLED=true
UMAMI_WEBSITE_ID=your_umami_website_id
UMAMI_API_URL=https://your-umami-instance.com/api/collect
```

### Getting Your Umami Website ID

1. Set up Umami on your server or use [umami.is](https://umami.is/)
2. Create a new website in your Umami dashboard
3. Copy the website ID from the tracking script
4. Use the API endpoint URL (usually `/api/collect`)

## API Endpoints

### Public Endpoints

#### Track Custom Event

```http
POST /api/v1/analytics/track/event
Content-Type: application/json

{
  "eventName": "user_action",
  "eventData": { "action": "button_click", "page": "dashboard" },
  "url": "https://clinic.com/dashboard"
}
```

#### Track Page View

```http
POST /api/v1/analytics/track/pageview
Content-Type: application/json

{
  "url": "https://clinic.com/dashboard",
  "referrer": "https://clinic.com/login"
}
```

#### Track Authentication Event

```http
POST /api/v1/analytics/track/auth/login?userId=123
```

#### Track Appointment Event

```http
POST /api/v1/analytics/track/appointment/created?appointmentId=456&clinicId=789
```

#### Track Health Event

```http
POST /api/v1/analytics/track/health/checkup?petId=101&clinicId=789
```

#### Track Clinic Event

```http
POST /api/v1/analytics/track/clinic/updated?clinicId=789
```

#### Health Check

```http
GET /api/v1/analytics/health
```

### Admin-Only Endpoints

#### Get Analytics Status

```http
GET /api/v1/analytics/status
Authorization: Bearer <jwt_token>
```

**Note**: Requires ADMIN role.

## Automatic Tracking

The module automatically tracks:

- **API Requests**: All incoming API calls with performance metrics
- **User Actions**: Authentication, appointments, health events, clinic management
- **Performance**: Response times, status codes, error rates

## Integration Examples

### Frontend Integration

```typescript
// Track custom events
const trackEvent = async (eventName: string, data?: any) => {
  await fetch('/api/v1/analytics/track/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventName, eventData: data }),
  });
};

// Track page views
const trackPageView = async (url: string) => {
  await fetch('/api/v1/analytics/track/pageview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
};
```

### Service Integration

```typescript
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class AppointmentService {
  constructor(private readonly analyticsService: AnalyticsService) {}

  async createAppointment(data: CreateAppointmentDto) {
    const appointment = await this.appointmentRepository.save(data);

    // Track the event
    await this.analyticsService.trackAppointmentEvent('created', appointment.id, appointment.clinicId);

    return appointment;
  }
}
```

## Privacy & Compliance

- **No Personal Data**: Only tracks anonymous usage patterns
- **GDPR Compliant**: Respects user privacy and data protection regulations
- **Self-Hosted Option**: Can be deployed on your own infrastructure
- **No Cookies**: Uses fingerprinting-free tracking methods

## Monitoring & Debugging

### Logs

The module provides comprehensive logging:

```bash
# Enable debug logging
LOG_LEVEL=debug

# View analytics logs
tail -f logs/app.log | grep Analytics
```

### Health Checks

Monitor the analytics service health:

```bash
curl http://localhost:3001/api/v1/analytics/health
```

### Status Check

Admin users can check configuration status:

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/v1/analytics/status
```

## Troubleshooting

### Common Issues

1. **Analytics Not Working**
   - Check `UMAMI_ENABLED` is set to `true`
   - Verify `UMAMI_WEBSITE_ID` and `UMAMI_API_URL` are correct
   - Check network connectivity to Umami instance

2. **Permission Denied**
   - Ensure user has ADMIN role for status endpoint
   - Check JWT token validity

3. **High Latency**
   - Monitor API response times
   - Check Umami instance performance
   - Consider using local Umami deployment

### Debug Mode

Enable debug logging for detailed tracking information:

```bash
LOG_LEVEL=debug
UMAMI_DEBUG=true
```

## Performance Considerations

- **Asynchronous Tracking**: All analytics calls are non-blocking
- **Error Handling**: Analytics failures don't affect main application
- **Rate Limiting**: Respects existing rate limiting configuration
- **Resource Usage**: Minimal memory and CPU overhead

## Future Enhancements

- [ ] Real-time analytics dashboard
- [ ] Custom metrics and KPIs
- [ ] Export functionality
- [ ] Advanced filtering and segmentation
- [ ] Integration with other analytics platforms
