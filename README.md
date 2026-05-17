# DubaiRentCars - Supercar Rental Website

## Project Structure

```
RENTCAR/
├── index.html              # Main website frontend
├── tracking-pixels.js      # Tracking pixels (FB, Snap, TikTok, Google, Insta)
├── server.py               # Python Flask backend server
├── server.js               # Node.js backend (alternative)
├── package.json            # Node.js dependencies (alternative)
├── .env                    # Environment variables
├── bookings.json           # Booking data storage
└── README.md               # This file
```

## Quick Start

### 1. Install Python Dependencies

```bash
cd C:\Users\azerty\Desktop\RENTCAR
pip install flask flask-cors
```

### 2. Configure Environment

Edit `.env` file with your settings:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=support@rentcars.ae
```

### 3. Start the Server

```bash
python server.py
```

The website will be available at: `http://localhost:5000`

## Tracking Pixels Setup

Open `tracking-pixels.js` and replace the placeholder IDs with your actual pixel IDs:

```javascript
const TRACKING_PIXELS = {
    facebook: {
        enabled: true,
        pixelId: '123456789012345',  // Your FB Pixel ID
    },
    snapchat: {
        enabled: true,
        pixelId: 'a1b2c3d4-e5f6-...',  // Your Snap Pixel ID
    },
    tiktok: {
        enabled: true,
        pixelId: 'CABCDEFGHIJKLMN',  // Your TikTok Pixel ID
    },
    google: {
        enabled: true,
        measurementId: 'G-XXXXXXXXXX',  // Your GA4 Measurement ID
        googleAdsId: 'AW-XXXXXXXXXX',   // Your Google Ads ID
    }
};
```

### Where to Find Your Pixel IDs:

- **Facebook/Instagram**: Facebook Events Manager > Pixels > Create Pixel
- **Snapchat**: Snapchat Ads Manager > Pixels > Create Pixel
- **TikTok**: TikTok Ads Manager > Events > Web Events > Create Pixel
- **Google Analytics**: Google Analytics > Admin > Data Streams > Measurement ID
- **Google Ads**: Google Ads > Tools > Conversions > Tag Setup

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create a new booking |
| GET | `/api/bookings` | Get all bookings |
| GET | `/api/bookings/:id` | Get booking by ID |
| PATCH | `/api/bookings/:id/status` | Update booking status |
| DELETE | `/api/bookings/:id` | Delete a booking |
| GET | `/api/health` | Health check |

### Create Booking Example

```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "carName": "Lamborghini Huracan",
    "carImage": "image-url.jpg",
    "pricePerDay": 589.56,
    "days": 3,
    "totalAmount": "1768.68",
    "paymentMethod": "card",
    "fullName": "John Doe",
    "phone": "+971501234567",
    "email": "john@example.com",
    "address": "Dubai Marina, Tower A, Apt 1201",
    "deliveryDate": "2026-06-01"
  }'
```

## Email Setup (Gmail)

1. Go to your Google Account > Security
2. Enable 2-Step Verification
3. Generate an App Password: https://myaccount.google.com/apppasswords
4. Use the app password in `.env` as `SMTP_PASS`

## Features

- 58 supercars with real images
- USD pricing with 20% discount
- Brand filtering
- Price/name sorting
- Booking form with validation
- Card payment (declined simulation)
- USDT TRC20 crypto payment with 30-min countdown
- Email notifications (customer + admin)
- Fully responsive (mobile, tablet, desktop)
- Tracking pixels (FB, Snap, TikTok, Google, Insta)

## Production Deployment

For production, consider:

1. **Hosting**: Deploy to VPS, Heroku, DigitalOcean, or AWS
2. **Database**: Replace JSON file with MongoDB/PostgreSQL
3. **Payment Gateway**: Integrate Stripe for real card payments
4. **Crypto Payments**: Integrate NowPayments or CoinPayments API
5. **SSL**: Use Let's Encrypt for HTTPS
6. **Security**: Add rate limiting, input sanitization, authentication
