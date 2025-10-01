# MySQL Workbench Setup for AutoFuel Lanka

## ✅ **Application Status**
Your Spring Boot application is now running on **http://localhost:8080**

## 🔧 **MySQL Workbench Connection**

### **Step 1: Connect to Database**
1. Open **MySQL Workbench**
2. Create new connection:
   - **Connection Name:** `AutoFuel Lanka`
   - **Hostname:** `localhost`
   - **Port:** `3306`
   - **Username:** `root`
   - **Password:** `root123`
   - **Default Schema:** `autofuellanka`

### **Step 2: Create Database (if needed)**
Run this query in MySQL Workbench:
```sql
CREATE DATABASE IF NOT EXISTS autofuellanka;
USE autofuellanka;
```

### **Step 3: Verify Tables Created**
The application automatically created tables. Check them:
```sql
SHOW TABLES;
```

You should see these tables:
- `invoices`
- `invoice_lines`
- `payments`
- `finance_ledger`
- `stock_moves`
- `vehicle_types`
- `inventory_items`
- `users`
- `roles`
- `user_roles`
- `bookings`
- `service_types`
- `customers`
- `vehicles`
- And other existing tables...

## 🎯 **Test the Application**

### **Frontend:**
1. Open **http://localhost:3000** (if frontend is running)
2. Login with existing credentials
3. Navigate to finance pages

### **Backend API:**
Test these endpoints:
- **http://localhost:8080/api/billing/invoices**
- **http://localhost:8080/api/finance/ledger**
- **http://localhost:8080/api/vehicle-types**
- **http://localhost:8080/api/inventory/items**

## 🔍 **Troubleshooting**

### **If you get 500 errors:**
1. **Check MySQL connection** in Workbench
2. **Verify database exists:** `autofuellanka`
3. **Check application logs** for specific errors
4. **Ensure MySQL service is running**

### **If tables are empty:**
The tables will be empty initially. This is normal! The repositories will handle empty results gracefully.

### **If you need sample data:**
You can add data directly in MySQL Workbench:
```sql
-- Add a FINANCE role
INSERT INTO roles (name, description) VALUES ('FINANCE', 'Finance Manager');

-- Add a finance user
INSERT INTO users (username, email, password, enabled, created_at) 
VALUES ('finance_user', 'finance@autofuellanka.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', true, NOW());

-- Assign FINANCE role
INSERT INTO user_roles (user_id, role_id) 
VALUES ((SELECT id FROM users WHERE username = 'finance_user'), (SELECT id FROM roles WHERE name = 'FINANCE'));
```

## 📊 **Repository Pattern Benefits**

Your application uses the repository pattern correctly:
- **JPA repositories** automatically handle database operations
- **Hibernate** creates tables from entity annotations
- **Spring Data JPA** provides query methods
- **Automatic table creation** with `ddl-auto=update`

## 🚀 **Next Steps**

1. **Verify connection** in MySQL Workbench
2. **Test the application** endpoints
3. **Add sample data** if needed
4. **Test finance features** with FINANCE user

The application should now work without 500 errors!
