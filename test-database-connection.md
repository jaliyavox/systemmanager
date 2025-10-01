# Test Database Connection and Tables

## 🔍 **Check Application Status**

Your application is running on **http://localhost:8080**

## 🧪 **Test Database Connection**

### **Step 1: Test Basic Endpoints**

Open these URLs in your browser to test if the database tables exist:

1. **Finance Ledger:** http://localhost:8080/api/finance/ledger
2. **Invoices:** http://localhost:8080/api/billing/invoices  
3. **Vehicle Types:** http://localhost:8080/api/vehicle-types
4. **Inventory Items:** http://localhost:8080/api/inventory/items

### **Expected Results:**

- **Empty arrays `[]`** = Tables exist but are empty (GOOD)
- **500 errors** = Tables don't exist or connection issues (BAD)
- **404 errors** = Endpoint not found (BAD)

### **Step 2: Check MySQL Workbench**

1. **Connect to MySQL Workbench**
2. **Run this query:**
   ```sql
   USE autofuellanka;
   SHOW TABLES;
   ```

You should see these tables:
- `finance_ledger`
- `invoices`
- `invoice_lines`
- `payments`
- `stock_moves`
- `vehicle_types`
- `inventory_items`
- `users`
- `roles`
- `bookings`
- `service_types`
- `customers`
- `vehicles`

### **Step 3: Check Table Structure**

```sql
DESCRIBE finance_ledger;
DESCRIBE invoices;
DESCRIBE vehicle_types;
DESCRIBE inventory_items;
```

## 🔧 **If You Get 500 Errors**

### **Check Application Logs**
Look for error messages in your application console/logs.

### **Common Issues:**

1. **Database doesn't exist:**
   ```sql
   CREATE DATABASE autofuellanka;
   ```

2. **Wrong credentials:**
   - Check `application.properties`
   - Username: `root`
   - Password: `root123`
   - Database: `autofuellanka`

3. **MySQL service not running:**
   - Start MySQL service
   - Check port 3306 is open

4. **Tables not created:**
   - Restart the application
   - Check `spring.jpa.hibernate.ddl-auto=update` in properties

## ✅ **Success Indicators**

- **Empty arrays returned** from API endpoints
- **Tables visible** in MySQL Workbench
- **No 500 errors** in browser
- **Application logs** show successful startup

## 🎯 **Next Steps**

Once tables are created and working:

1. **Add FINANCE role** in MySQL Workbench:
   ```sql
   INSERT INTO roles (name, description) VALUES ('FINANCE', 'Finance Manager');
   ```

2. **Create finance user:**
   ```sql
   INSERT INTO users (username, email, password, enabled, created_at) 
   VALUES ('finance_user', 'finance@autofuellanka.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', true, NOW());
   
   INSERT INTO user_roles (user_id, role_id) 
   VALUES ((SELECT id FROM users WHERE username = 'finance_user'), (SELECT id FROM roles WHERE name = 'FINANCE'));
   ```

3. **Test login** with `finance_user` / `password123`

The repository pattern will handle all database operations automatically!
