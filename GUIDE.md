# 🚌 BusBook — Full Stack Bus Booking App
## Complete Setup, Run & Hosting Guide

---

## 📁 Project Structure

```
busbook/
├── backend/                  ← Django + Python + MySQL
│   ├── core/                 ← Django project config
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── users/                ← Auth app (register, login, profile)
│   ├── buses/                ← Bus, Route, Trip, Seat models
│   ├── bookings/             ← Booking, Passenger, Review models
│   ├── manage.py
│   └── requirements.txt
└── frontend/                 ← React + CSS
    ├── public/
    ├── src/
    │   ├── pages/            ← Home, Search, SeatSelection, Payment…
    │   ├── components/       ← Navbar, Footer
    │   ├── context/          ← AuthContext (JWT)
    │   └── utils/api.js      ← Axios with JWT interceptors
    └── package.json
```

---

## ⚙️ PART 1 — LOCAL DEVELOPMENT SETUP

### Step 1 · Prerequisites — Install these first

| Tool | Version | Download |
|------|---------|----------|
| Python | 3.10+ | https://python.org |
| Node.js | 18+ | https://nodejs.org |
| MySQL | 8.0+ | https://dev.mysql.com |
| Git | latest | https://git-scm.com |

---

### Step 2 · MySQL Database Setup

Open MySQL shell (or MySQL Workbench) and run:

```sql
-- Create the database
CREATE DATABASE busbook_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create a dedicated user
CREATE USER 'busbook_user'@'localhost' IDENTIFIED BY 'StrongPass123!';
GRANT ALL PRIVILEGES ON busbook_db.* TO 'busbook_user'@'localhost';
FLUSH PRIVILEGES;

-- Verify
SHOW DATABASES;
```

---

### Step 3 · Backend Setup (Django)

```bash
# Clone / navigate to project
cd busbook/backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install all Python packages
pip install -r requirements.txt

# Create a manage.py file in the backend root
# (see manage.py content below)
```

Create `backend/manage.py`:
```python
#!/usr/bin/env python
import os
import sys

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError("Django not installed.") from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
```

```bash
# Update DB credentials in core/settings.py (lines ~40-50)
# Change DB_USER, DB_PASSWORD, DB_NAME to match what you created above

# Run database migrations
python manage.py makemigrations users buses bookings
python manage.py migrate

# Create Django admin superuser
python manage.py createsuperuser
# Enter: email, username, password when prompted

# Load sample data (buses, routes, trips, seats)
python manage.py seed_data

# Collect static files
python manage.py collectstatic --no-input

# Start Django server
python manage.py runserver
# → Backend running at: http://localhost:8000
# → Admin panel at:     http://localhost:8000/admin
```

---

### Step 4 · Frontend Setup (React)

Open a **new terminal**:

```bash
cd busbook/frontend

# Install Node packages
npm install

# Create environment file
# Create a file called .env in the frontend folder:
echo "REACT_APP_API_URL=http://localhost:8000/api" > .env

# Start React development server
npm start
# → Frontend running at: http://localhost:3000
```

Your app is now live locally:
- 🌐 **Frontend:** http://localhost:3000
- 🔧 **API:**      http://localhost:8000/api
- 🛠️ **Admin:**   http://localhost:8000/admin

---

## 🔑 PART 2 — KEY FEATURES OVERVIEW

### Feature List (Unique & Complete)

| Feature | Description |
|---------|-------------|
| 🔍 Smart Search | Autocomplete city search with filters (type, price, rating, date) |
| 💺 Interactive Seat Map | Visual bus layout with real-time seat availability |
| 👥 Multi-passenger Booking | Book up to 6 seats with individual passenger details |
| 🎫 E-Ticket Generation | Downloadable/printable ticket with QR placeholder |
| 🎟️ Coupon System | FIRST50, BUSBOOK20, SAVE100 discount codes |
| 🔐 JWT Authentication | Secure login/register with auto token refresh |
| 📧 Email Confirmation | Auto email on booking confirmed |
| ❌ Cancellation + Refund | Cancel booking with auto refund tracking |
| ⭐ Review System | Rate cleanliness, punctuality, staff per trip |
| 📱 Fully Responsive | Works on mobile, tablet, and desktop |
| 🌙 Multiple Bus Types | Sleeper, AC, Volvo, Luxury, Semi-sleeper, Seater |
| 📊 Admin Dashboard | Manage buses, routes, trips via Django Admin |

---

## 🌐 PART 3 — PRODUCTION HOSTING

### Option A · Railway (Easiest — Free Tier Available) ⭐ RECOMMENDED

**Deploy Backend:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# From backend folder
cd busbook/backend
railway init

# Add MySQL plugin in Railway dashboard:
# → New Project → Add Plugin → MySQL
# Copy the DATABASE_URL from Railway dashboard

# Set environment variables in Railway dashboard:
DJANGO_SETTINGS_MODULE=core.settings
SECRET_KEY=your-secret-key-here-50chars
DEBUG=False
DB_NAME=railway (from Railway MySQL)
DB_USER=root
DB_PASSWORD=<from Railway>
DB_HOST=<from Railway>
DB_PORT=3306

# Create Procfile in backend/
echo "web: gunicorn core.wsgi:application --bind 0.0.0.0:\$PORT" > Procfile

# Deploy
railway up
# → Your API is live at: https://yourapp.railway.app
```

**Deploy Frontend:**
```bash
cd busbook/frontend

# Update .env for production
echo "REACT_APP_API_URL=https://yourapp.railway.app/api" > .env.production

# Build React app
npm run build

# Deploy frontend to Vercel (free)
npm install -g vercel
vercel --prod
# → Frontend live at: https://busbook.vercel.app
```

---

### Option B · Render (Free Tier)

**Backend on Render:**
1. Push code to GitHub
2. Go to https://render.com → New → Web Service
3. Connect GitHub repo, choose `busbook/backend`
4. Settings:
   - Build Command: `pip install -r requirements.txt && python manage.py collectstatic --no-input && python manage.py migrate`
   - Start Command: `gunicorn core.wsgi:application`
5. Add Environment Variables (same as Railway above)
6. Add PostgreSQL or use external MySQL

**Frontend on Render (Static Site):**
1. New → Static Site
2. Connect same repo, choose `busbook/frontend`
3. Build Command: `npm run build`
4. Publish Directory: `build`

---

### Option C · VPS (DigitalOcean / AWS / Hostinger) — Full Control

#### 3.1 — Server Setup (Ubuntu 22.04)

```bash
# SSH into your server
ssh root@YOUR_SERVER_IP

# Update system
apt update && apt upgrade -y

# Install required software
apt install -y python3-pip python3-venv nginx mysql-server nodejs npm certbot python3-certbot-nginx

# Secure MySQL
mysql_secure_installation

# Create database (same SQL as Step 2 above)
mysql -u root -p
> CREATE DATABASE busbook_db CHARACTER SET utf8mb4;
> CREATE USER 'busbook_user'@'localhost' IDENTIFIED BY 'StrongPass123!';
> GRANT ALL PRIVILEGES ON busbook_db.* TO 'busbook_user'@'localhost';
> FLUSH PRIVILEGES;
> EXIT;
```

#### 3.2 — Deploy Backend

```bash
# Create app directory
mkdir -p /var/www/busbook
cd /var/www/busbook

# Upload your code (from local machine):
# scp -r busbook/backend root@YOUR_IP:/var/www/busbook/

# OR clone from GitHub:
git clone https://github.com/yourusername/busbook.git .

cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file
cat > .env << 'EOF'
SECRET_KEY=your-super-secret-50char-key-here
DEBUG=False
DB_NAME=busbook_db
DB_USER=busbook_user
DB_PASSWORD=StrongPass123!
DB_HOST=localhost
DB_PORT=3306
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your-gmail-app-password
EOF

# Update settings.py to read from .env:
pip install python-decouple

# Migrate and seed
python manage.py migrate
python manage.py createsuperuser
python manage.py seed_data
python manage.py collectstatic --no-input
```

#### 3.3 — Gunicorn Service (keeps Django running)

```bash
# Create systemd service
cat > /etc/systemd/system/busbook.service << 'EOF'
[Unit]
Description=BusBook Django App
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/busbook/backend
Environment="PATH=/var/www/busbook/backend/venv/bin"
ExecStart=/var/www/busbook/backend/venv/bin/gunicorn \
    --workers 3 \
    --bind unix:/run/busbook.sock \
    core.wsgi:application

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable busbook
systemctl start busbook
systemctl status busbook
```

#### 3.4 — Deploy Frontend

```bash
cd /var/www/busbook/frontend
npm install

# Set API URL to your domain
echo "REACT_APP_API_URL=https://yourdomain.com/api" > .env.production

npm run build
# Built files are in: frontend/build/
```

#### 3.5 — Nginx Configuration

```bash
cat > /etc/nginx/sites-available/busbook << 'EOF'
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # React Frontend
    location / {
        root /var/www/busbook/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;  # SPA routing
    }

    # Django API
    location /api/ {
        include proxy_params;
        proxy_pass http://unix:/run/busbook.sock;
    }

    # Django Admin
    location /admin/ {
        include proxy_params;
        proxy_pass http://unix:/run/busbook.sock;
    }

    # Django Static Files
    location /static/ {
        alias /var/www/busbook/backend/staticfiles/;
    }

    # Media Files
    location /media/ {
        alias /var/www/busbook/backend/media/;
    }
}
EOF

# Enable the site
ln -s /etc/nginx/sites-available/busbook /etc/nginx/sites-enabled/
nginx -t        # Test config
systemctl restart nginx
```

#### 3.6 — Free SSL with Let's Encrypt

```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
# Follow prompts — it auto-configures HTTPS!

# Auto-renew
systemctl enable certbot.timer
```

Your site is now live at **https://yourdomain.com** 🎉

---

## 📤 PART 4 — SHARING WITH MENTORS

### Option A · Share via Deployed URL (Best)
After deploying, simply share the URL:
```
🌐 Live Site: https://busbook.vercel.app (or your domain)
🔧 API Docs:  https://yourapi.railway.app/api/
🛠️ Admin:    https://yourapi.railway.app/admin
             Username: admin@busbook.com
             Password: Admin@123
```

### Option B · Share via GitHub (Code Review)

```bash
# In project root
git init
git add .
git commit -m "feat: BusBook full-stack bus booking app"

# Create repo on GitHub, then:
git remote add origin https://github.com/yourusername/busbook.git
git branch -M main
git push -u origin main
```

Share the GitHub link with mentors:
```
📦 GitHub:  https://github.com/yourusername/busbook
```

### Option C · Share via ZIP

```bash
# Exclude node_modules and venv
zip -r busbook_project.zip busbook/ \
    --exclude "*/node_modules/*" \
    --exclude "*/venv/*" \
    --exclude "*/__pycache__/*" \
    --exclude "*/.git/*" \
    --exclude "*/build/*"
```

---

## 🔌 PART 5 — API ENDPOINT REFERENCE

### Auth Endpoints
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/auth/register/` | Create account |
| POST | `/api/auth/login/` | Login → returns JWT tokens |
| POST | `/api/auth/token/refresh/` | Refresh access token |
| GET/PATCH | `/api/auth/profile/` | Get/Update profile |
| POST | `/api/auth/change-password/` | Change password |

### Bus / Search Endpoints
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/buses/cities/` | All available cities |
| GET | `/api/buses/routes/` | All routes |
| GET | `/api/buses/routes/popular/` | Popular routes |
| GET | `/api/buses/search/?source=Chennai&destination=Bangalore&date=2025-12-01` | Search trips |
| GET | `/api/buses/trips/<id>/` | Trip details |
| GET | `/api/buses/trips/<id>/seats/` | Seat availability |

### Booking Endpoints (Auth Required)
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/bookings/` | My bookings list |
| POST | `/api/bookings/create/` | Create booking |
| GET | `/api/bookings/<id>/` | Booking detail |
| POST | `/api/bookings/<id>/cancel/` | Cancel booking |
| POST | `/api/bookings/reviews/` | Submit review |

---

## 🎟️ PART 6 — TEST CREDENTIALS & DEMO COUPONS

### Demo Coupon Codes
| Code | Discount |
|------|----------|
| `FIRST50` | ₹50 off (or 10% of fare) |
| `BUSBOOK20` | 20% off base fare |
| `SAVE100` | ₹100 off |

### Sample Search (After seeding)
- **From:** Chennai → **To:** Bangalore → **Date:** any future date
- **From:** Mumbai → **To:** Pune

---

## 🛠️ PART 7 — TROUBLESHOOTING

| Problem | Fix |
|---------|-----|
| `ModuleNotFoundError: mysqlclient` | `pip install mysqlclient` (needs MySQL dev headers: `apt install libmysqlclient-dev`) |
| `CORS errors` in browser | Check `CORS_ALLOWED_ORIGINS` in settings.py matches your React URL |
| React shows blank page | Check `REACT_APP_API_URL` in `.env` matches your Django server |
| JWT 401 Unauthorized | Token expired — API auto-refreshes; if issue persists, re-login |
| `Port already in use` | Kill process: `lsof -ti:8000 \| xargs kill -9` |
| MySQL connection refused | Start MySQL: `sudo service mysql start` |
| Seats not showing | Run `python manage.py seed_data` to populate test data |

---

## 📝 PART 8 — MENTOR DEMO SCRIPT

When presenting to mentors, follow this flow:

1. **Home Page** → Show hero section, statistics, popular routes
2. **Search** → Search Chennai → Bangalore, demo filters (AC, price sort)
3. **Trip Card** → Expand details, show amenities
4. **Register** → Create account live
5. **Seat Selection** → Show visual seat map, select 2 seats
6. **Passenger Details** → Fill passenger info
7. **Payment** → Apply coupon `BUSBOOK20`, proceed
8. **E-Ticket** → Show confirmation, download ticket
9. **My Bookings** → Show booking history, cancel flow
10. **Admin Panel** → Show Django admin (buses, trips, bookings)

---

*BusBook v1.0 — Built with ❤️ using React, Django REST Framework, MySQL*
