from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
import uuid
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import threading

app = Flask(__name__, static_folder='.')
CORS(app)

BOOKINGS_FILE = os.path.join(os.path.dirname(__file__), 'bookings.json')

# Configuration
SMTP_HOST = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
SMTP_PORT = int(os.environ.get('SMTP_PORT', '587'))
SMTP_USER = os.environ.get('SMTP_USER', 'your-email@gmail.com')
SMTP_PASS = os.environ.get('SMTP_PASS', 'your-app-password')
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'support@rentcars.ae')

def load_bookings():
    try:
        if os.path.exists(BOOKINGS_FILE):
            with open(BOOKINGS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
    except:
        pass
    return []

def save_bookings(bookings):
    with open(BOOKINGS_FILE, 'w', encoding='utf-8') as f:
        json.dump(bookings, f, indent=2, ensure_ascii=False)

def send_email(to_email, subject, html_content):
    """Send email notification"""
    try:
        msg = MIMEMultipart('alternative')
        msg['From'] = SMTP_USER
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(html_content, 'html'))

        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False

def send_customer_email(booking):
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">DubaiRentCars</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Booking Confirmation</p>
        </div>
        <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
            <p style="font-size: 16px; color: #333;">Dear {booking['customer']['fullName']},</p>
            <p style="color: #666;">Your supercar booking has been confirmed!</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2563eb; margin-top: 0;">Order Details</h3>
                <p><strong>Order ID:</strong> {booking['id']}</p>
                <p><strong>Car:</strong> {booking['carName']}</p>
                <p><strong>Duration:</strong> {booking['days']} day{'s' if booking['days'] > 1 else ''}</p>
                <p><strong>Total:</strong> ${booking['totalAmount']}</p>
                <p><strong>Payment:</strong> {'Credit/Debit Card' if booking['paymentMethod'] == 'card' else 'USDT (TRC20)'}</p>
                <p><strong>Delivery Address:</strong> {booking['customer']['address']}</p>
                <p><strong>Delivery Date:</strong> {booking['customer']['deliveryDate']}</p>
            </div>
            <p style="color: #666; font-size: 14px;">We will contact you shortly to confirm the delivery details.</p>
            <p style="color: #666; font-size: 14px;">Best regards,<br><strong>DubaiRentCars Team</strong></p>
        </div>
        <div style="background: #1e293b; padding: 20px; text-align: center; border-radius: 0 0 12px 12px;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; 2026 DubaiRentCars. All rights reserved.</p>
        </div>
    </div>
    """
    threading.Thread(target=send_email, args=(booking['customer']['email'], f"Booking Confirmed - {booking['id']}", html)).start()

def send_admin_email(booking):
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2 style="color: #2563eb;">New Booking Received</h2>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
            <p><strong>Order ID:</strong> {booking['id']}</p>
            <p><strong>Car:</strong> {booking['carName']}</p>
            <p><strong>Customer:</strong> {booking['customer']['fullName']}</p>
            <p><strong>Phone:</strong> {booking['customer']['phone']}</p>
            <p><strong>Email:</strong> {booking['customer']['email']}</p>
            <p><strong>Address:</strong> {booking['customer']['address']}</p>
            <p><strong>Days:</strong> {booking['days']}</p>
            <p><strong>Total:</strong> ${booking['totalAmount']}</p>
            <p><strong>Payment:</strong> {'Credit/Debit Card' if booking['paymentMethod'] == 'card' else 'USDT (TRC20)'}</p>
        </div>
    </div>
    """
    threading.Thread(target=send_email, args=(ADMIN_EMAIL, f"New Booking - {booking['id']} - {booking['carName']}", html)).start()

# ============================================
# API ROUTES
# ============================================

@app.route('/api/bookings', methods=['POST'])
def create_booking():
    try:
        data = request.json

        required = ['carName', 'fullName', 'phone', 'email', 'address', 'days', 'paymentMethod']
        for field in required:
            if not data.get(field):
                return jsonify({'success': False, 'message': f'Missing required field: {field}'}), 400

        if data['days'] < 1:
            return jsonify({'success': False, 'message': 'Rental duration must be at least 1 day'}), 400

        order_id = 'DRC-' + str(uuid.uuid4())[:8].upper()
        booking = {
            'id': order_id,
            'carName': data['carName'],
            'carImage': data.get('carImage', ''),
            'pricePerDay': data.get('pricePerDay', 0),
            'days': data['days'],
            'totalAmount': data.get('totalAmount', '0'),
            'paymentMethod': data['paymentMethod'],
            'customer': {
                'fullName': data['fullName'],
                'phone': data['phone'],
                'email': data['email'],
                'address': data['address'],
                'deliveryDate': data.get('deliveryDate', datetime.now().strftime('%Y-%m-%d'))
            },
            'status': 'pending',
            'createdAt': datetime.now().isoformat()
        }

        bookings = load_bookings()
        bookings.append(booking)
        save_bookings(bookings)

        # Send emails
        send_customer_email(booking)
        send_admin_email(booking)

        return jsonify({
            'success': True,
            'message': 'Booking created successfully',
            'orderId': order_id,
            'booking': booking
        }), 201

    except Exception as e:
        print(f"Booking error: {e}")
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

@app.route('/api/bookings', methods=['GET'])
def get_bookings():
    bookings = load_bookings()
    return jsonify({
        'success': True,
        'count': len(bookings),
        'bookings': bookings
    })

@app.route('/api/bookings/<booking_id>', methods=['GET'])
def get_booking(booking_id):
    bookings = load_bookings()
    booking = next((b for b in bookings if b['id'] == booking_id), None)

    if not booking:
        return jsonify({'success': False, 'message': 'Booking not found'}), 404

    return jsonify({'success': True, 'booking': booking})

@app.route('/api/bookings/<booking_id>/status', methods=['PATCH'])
def update_booking_status(booking_id):
    data = request.json
    status = data.get('status')
    valid_statuses = ['pending', 'confirmed', 'delivered', 'completed', 'cancelled']

    if status not in valid_statuses:
        return jsonify({'success': False, 'message': 'Invalid status'}), 400

    bookings = load_bookings()
    booking = next((b for b in bookings if b['id'] == booking_id), None)

    if not booking:
        return jsonify({'success': False, 'message': 'Booking not found'}), 404

    booking['status'] = status
    booking['updatedAt'] = datetime.now().isoformat()
    save_bookings(bookings)

    return jsonify({'success': True, 'message': 'Status updated', 'booking': booking})

@app.route('/api/bookings/<booking_id>', methods=['DELETE'])
def delete_booking(booking_id):
    bookings = load_bookings()
    booking = next((b for b in bookings if b['id'] == booking_id), None)

    if not booking:
        return jsonify({'success': False, 'message': 'Booking not found'}), 404

    bookings.remove(booking)
    save_bookings(bookings)

    return jsonify({'success': True, 'message': 'Booking deleted'})

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'timestamp': datetime.now().isoformat()})

# Serve frontend
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    print("\n========================================")
    print("  DubaiRentCars Backend Server")
    print("  Running on: http://localhost:5000")
    print("  API: http://localhost:5000/api")
    print("========================================\n")
    app.run(host='0.0.0.0', port=5000, debug=True)
