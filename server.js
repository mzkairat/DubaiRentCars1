require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Data storage (JSON file as simple database)
const BOOKINGS_FILE = path.join(__dirname, 'bookings.json');

function loadBookings() {
    try {
        if (fs.existsSync(BOOKINGS_FILE)) {
            return JSON.parse(fs.readFileSync(BOOKINGS_FILE, 'utf8'));
        }
    } catch (e) {}
    return [];
}

function saveBookings(bookings) {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
}

// Email transporter configuration
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER || 'your-email@gmail.com',
        pass: process.env.SMTP_PASS || 'your-app-password'
    }
});

// ============================================
// API ROUTES
// ============================================

// Create a new booking
app.post('/api/bookings', async (req, res) => {
    try {
        const {
            carName,
            carImage,
            pricePerDay,
            days,
            totalAmount,
            paymentMethod,
            fullName,
            phone,
            email,
            address,
            deliveryDate
        } = req.body;

        // Validation
        if (!carName || !fullName || !phone || !email || !address || !days || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        if (days < 1) {
            return res.status(400).json({
                success: false,
                message: 'Rental duration must be at least 1 day'
            });
        }

        const orderId = 'DRC-' + uuidv4().substring(0, 8).toUpperCase();
        const booking = {
            id: orderId,
            carName,
            carImage,
            pricePerDay,
            days,
            totalAmount,
            paymentMethod,
            customer: {
                fullName,
                phone,
                email,
                address,
                deliveryDate: deliveryDate || new Date().toISOString().split('T')[0]
            },
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        // Save booking
        const bookings = loadBookings();
        bookings.push(booking);
        saveBookings(bookings);

        // Send confirmation email to customer
        try {
            await transporter.sendMail({
                from: `"DubaiRentCars" <${process.env.SMTP_USER || 'noreply@dubairentcars.ae'}>`,
                to: email,
                subject: `Booking Confirmed - ${orderId}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                            <h1 style="color: white; margin: 0; font-size: 28px;">DubaiRentCars</h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Booking Confirmation</p>
                        </div>
                        <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
                            <p style="font-size: 16px; color: #333;">Dear ${fullName},</p>
                            <p style="color: #666;">Your supercar booking has been confirmed!</p>
                            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h3 style="color: #2563eb; margin-top: 0;">Order Details</h3>
                                <p><strong>Order ID:</strong> ${orderId}</p>
                                <p><strong>Car:</strong> ${carName}</p>
                                <p><strong>Duration:</strong> ${days} day${days > 1 ? 's' : ''}</p>
                                <p><strong>Total:</strong> $${totalAmount}</p>
                                <p><strong>Payment:</strong> ${paymentMethod === 'card' ? 'Credit/Debit Card' : 'USDT (TRC20)'}</p>
                                <p><strong>Delivery Address:</strong> ${address}</p>
                                <p><strong>Delivery Date:</strong> ${booking.customer.deliveryDate}</p>
                            </div>
                            <p style="color: #666; font-size: 14px;">We will contact you shortly to confirm the delivery details.</p>
                            <p style="color: #666; font-size: 14px;">Best regards,<br><strong>DubaiRentCars Team</strong></p>
                        </div>
                        <div style="background: #1e293b; padding: 20px; text-align: center; border-radius: 0 0 12px 12px;">
                            <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; 2026 DubaiRentCars. All rights reserved.</p>
                        </div>
                    </div>
                `
            });
        } catch (emailError) {
            console.log('Email send failed (this is OK if not configured):', emailError.message);
        }

        // Send notification email to admin
        try {
            await transporter.sendMail({
                from: `"DubaiRentCars" <${process.env.SMTP_USER || 'noreply@dubairentcars.ae'}>`,
                to: process.env.ADMIN_EMAIL || 'support@rentcars.ae',
                subject: `New Booking - ${orderId} - ${carName}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px;">
                        <h2 style="color: #2563eb;">New Booking Received</h2>
                        <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
                            <p><strong>Order ID:</strong> ${orderId}</p>
                            <p><strong>Car:</strong> ${carName}</p>
                            <p><strong>Customer:</strong> ${fullName}</p>
                            <p><strong>Phone:</strong> ${phone}</p>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Address:</strong> ${address}</p>
                            <p><strong>Days:</strong> ${days}</p>
                            <p><strong>Total:</strong> $${totalAmount}</p>
                            <p><strong>Payment:</strong> ${paymentMethod === 'card' ? 'Credit/Debit Card' : 'USDT (TRC20)'}</p>
                        </div>
                    </div>
                `
            });
        } catch (emailError) {
            console.log('Admin email send failed:', emailError.message);
        }

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            orderId: orderId,
            booking: booking
        });

    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get all bookings (admin only - add auth in production)
app.get('/api/bookings', (req, res) => {
    const bookings = loadBookings();
    res.json({
        success: true,
        count: bookings.length,
        bookings: bookings
    });
});

// Get single booking by ID
app.get('/api/bookings/:id', (req, res) => {
    const bookings = loadBookings();
    const booking = bookings.find(b => b.id === req.params.id);

    if (!booking) {
        return res.status(404).json({
            success: false,
            message: 'Booking not found'
        });
    }

    res.json({
        success: true,
        booking: booking
    });
});

// Update booking status
app.patch('/api/bookings/:id/status', (req, res) => {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'delivered', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid status'
        });
    }

    const bookings = loadBookings();
    const index = bookings.findIndex(b => b.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({
            success: false,
            message: 'Booking not found'
        });
    }

    bookings[index].status = status;
    bookings[index].updatedAt = new Date().toISOString();
    saveBookings(bookings);

    res.json({
        success: true,
        message: 'Status updated',
        booking: bookings[index]
    });
});

// Delete booking (admin)
app.delete('/api/bookings/:id', (req, res) => {
    let bookings = loadBookings();
    const index = bookings.findIndex(b => b.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({
            success: false,
            message: 'Booking not found'
        });
    }

    bookings.splice(index, 1);
    saveBookings(bookings);

    res.json({
        success: true,
        message: 'Booking deleted'
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// SERVE FRONTEND
// ============================================
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`  DubaiRentCars Backend Server`);
    console.log(`  Running on: http://localhost:${PORT}`);
    console.log(`  API: http://localhost:${PORT}/api`);
    console.log(`========================================\n`);
});
