# 🔒 Panduan Lengkap Penetration Testing

## Website School SMP IT Pyakin

### 📋 **Quick Start Guide**

#### **Prerequisites**

```bash
# Pastikan Node.js sudah terinstall
node --version

# Clone dan setup project (jika belum)
cd website-school-smpipyakin
npm install

# Setup database
npx prisma migrate dev
npx prisma db seed
```

#### **Start Testing Environment**

```bash
# Start development server
npm run dev

# Server akan running di http://localhost:3000
# Pastikan server accessible sebelum testing
```

---

## 🛠️ **3 Cara Melakukan Penetration Testing**

### **1. Manual Testing via Browser** ⭐ **RECOMMENDED**

#### **📱 Akses Security Testing Suite**

```
http://localhost:3000/security-testing-suite.html
```

**Features:**

- ✅ Interactive UI untuk semua jenis testing
- ✅ Real-time results dan logging
- ✅ Automated test execution
- ✅ Export hasil testing
- ✅ Visual progress tracking

**Step by Step:**

1. Buka URL di browser
2. Pilih jenis test yang ingin dijalankan
3. Klik tombol test yang sesuai
4. Monitor results di log area
5. Generate dan export report

---

### **2. Brute Force Testing Tool**

#### **📱 Akses Brute Force Tester**

```
http://localhost:3000/brute-force-test.html
```

**Features:**

- ✅ Database-backed rate limiting test
- ✅ Real-time attempt tracking
- ✅ IP-based protection testing
- ✅ Cannot be bypassed dengan incognito mode

**How to Use:**

1. Buka URL brute force tester
2. Klik "Simulate Failed Login" berulang kali
3. Amati kapan rate limiting trigger
4. Check database logs untuk verification

---

### **3. Automated Command Line Testing**

#### **💻 Run Automated Tests**

```bash
# Jalankan comprehensive security test
node security-test.js

# Atau dengan custom configuration
node -e "
const config = require('./security-test.js');
config.CONFIG.maxAttempts = 15;
config.runSecurityTests();
"
```

**Features:**

- ✅ Comprehensive automated testing
- ✅ JSON report generation
- ✅ Command line interface
- ✅ Scriptable dan customizable

---

## 🔍 **Testing Scenarios & Expected Results**

### **1. Brute Force Attack Testing**

#### **Test Case:** Rate Limiting Protection

```javascript
// Expected behavior:
// - 5 failed attempts → Rate limited for 15 minutes
// - 10 failed attempts → Account locked for 1 hour
// - Database tracking semua attempts
```

#### **How to Test:**

1. **Via Browser:**
   - Go to `http://localhost:3000/security-testing-suite.html`
   - Click "Start Brute Force Test"
   - Set attempts = 10, delay = 1000ms
   - Observe rate limiting activation

2. **Via Brute Force Tool:**
   - Go to `http://localhost:3000/brute-force-test.html`
   - Click "Simulate Failed Login" 6+ times
   - Watch for rate limiting message

3. **Manual Login:**
   - Go to `http://localhost:3000/login`
   - Try wrong credentials 6+ times
   - Should get rate limited

#### **✅ Expected Results:**

- Rate limiting triggers after 5 attempts
- Error message shows remaining attempts
- Database logs all attempts
- IP-based tracking active

---

### **2. SQL Injection Testing**

#### **Test Payloads:**

```sql
admin' OR '1'='1' --
admin'; DROP TABLE users; --
' UNION SELECT * FROM users --
admin' AND (SELECT COUNT(*) FROM users) > 0 --
```

#### **How to Test:**

1. **Via Security Suite:**
   - Use built-in SQL injection tester
   - Input payloads dalam username field
   - Check results

2. **Manual Testing:**
   ```bash
   # Using curl
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username": "admin'\'' OR '\''1'\''='\''1'\'' --", "password": "test", "role": "admin"}'
   ```

#### **✅ Expected Results:**

- All SQL injection attempts blocked
- Prisma ORM prevents injection
- No database errors atau leakage
- Input treated as literal strings

---

### **3. XSS (Cross-Site Scripting) Testing**

#### **Test Payloads:**

```html
<script>
  alert("XSS");
</script>
<img src="x" onerror="alert('XSS')" />
javascript:alert('XSS')
<svg onload="alert('XSS')"></svg>
```

#### **How to Test:**

1. **Via Security Suite:**
   - Use XSS testing module
   - Input berbagai payloads
   - Check sanitization

2. **Manual Form Testing:**
   - Input XSS payload di login form
   - Submit dan check if script executes
   - Inspect sanitized output

#### **✅ Expected Results:**

- Script tags dihapus
- Event handlers stripped
- javascript: protocol removed
- Input length limited to 1000 chars

---

### **4. Authorization Testing (RBAC)**

#### **Test Matrix:**

| Role      | Dashboard Access    | Expected Result            |
| --------- | ------------------- | -------------------------- |
| admin     | dashboard-admin     | ✅ Allowed                 |
| admin     | dashboard-kesiswaan | ❌ Blocked → /unauthorized |
| kesiswaan | dashboard-kesiswaan | ✅ Allowed                 |
| kesiswaan | dashboard-admin     | ❌ Blocked → /unauthorized |
| siswa     | dashboard-siswa     | ✅ Allowed                 |
| siswa     | dashboard-admin     | ❌ Blocked → /unauthorized |

#### **How to Test:**

1. **Via Security Suite:**
   - Use Authorization Testing module
   - Select role dan target dashboard
   - Run test

2. **Manual Testing:**
   ```bash
   # Test steps:
   1. Login sebagai admin: admin/admin123/admin
   2. Try access: http://localhost:3000/dashboard-kesiswaan
   3. Should redirect to: http://localhost:3000/unauthorized
   ```

#### **✅ Expected Results:**

- Cross-role access blocked
- Proper redirects to /unauthorized
- Middleware logs unauthorized attempts

---

### **5. Session Security Testing**

#### **How to Test:**

1. **Cookie Security:**

   ```javascript
   // Di browser console after login
   document.cookie; // Should NOT show auth-token
   localStorage.getItem("auth-token"); // Should be null
   ```

2. **Session Management:**
   - Login dan verify HTTP-only cookies
   - Test automatic logout after 24 hours
   - Check secure session cleanup

#### **✅ Expected Results:**

- HTTP-only cookies (tidak bisa diakses JavaScript)
- No sensitive data in localStorage
- Automatic session expiration
- Secure cookie policies

---

## 📊 **Database Monitoring & Logs**

### **Check Security Logs:**

```sql
-- View recent login attempts
SELECT * FROM login_attempts
ORDER BY "createdAt" DESC
LIMIT 20;

-- Check failed login patterns
SELECT ip, username, COUNT(*) as attempts
FROM login_attempts
WHERE success = false
AND "createdAt" > NOW() - INTERVAL '1 hour'
GROUP BY ip, username;

-- Check rate limiting effectiveness
SELECT
    DATE("createdAt") as date,
    COUNT(*) as total_attempts,
    COUNT(CASE WHEN success = false THEN 1 END) as failed_attempts
FROM login_attempts
GROUP BY DATE("createdAt")
ORDER BY date DESC;
```

### **Access Database:**

```bash
# Open Prisma Studio
npx prisma studio

# Or connect directly
npx prisma db studio
```

---

## 🎯 **Common Test Scenarios**

### **Scenario 1: Penetration Test Simulation**

```bash
# Complete testing sequence
1. Start server: npm run dev
2. Open: http://localhost:3000/security-testing-suite.html
3. Run all tests in sequence:
   - Brute Force Test
   - SQL Injection Test
   - XSS Test
   - Authorization Test
   - Session Security Test
4. Generate comprehensive report
5. Review database logs
```

### **Scenario 2: Automated Security Audit**

```bash
# Run automated tests
node security-test.js

# Check generated report
cat security-report-YYYY-MM-DD.json

# Review results dan recommendations
```

### **Scenario 3: Role-Based Access Testing**

```bash
# Test all role combinations
1. Login as each role:
   - admin/admin123/admin
   - kesiswaan/admin123/kesiswaan
   - siswa001/admin123/siswa
   - osis001/admin123/osis
   - ppdb001/admin123/ppdb-officer

2. Try accessing each dashboard:
   - /dashboard-admin
   - /dashboard-kesiswaan
   - /dashboard-siswa
   - /dashboard-osis
   - /dashboard-ppdb

3. Verify proper access control
```

---

## 📋 **Test Results Checklist**

### **✅ Security Features Working:**

- [ ] Rate limiting (5 attempts/15 min)
- [ ] Account lockout (10 attempts/1 hour)
- [ ] SQL injection prevention (Prisma ORM)
- [ ] XSS protection (input sanitization)
- [ ] RBAC authorization (role isolation)
- [ ] HTTP-only cookies
- [ ] Session management
- [ ] Password hashing (bcrypt salt 12)
- [ ] Security logging
- [ ] IP tracking

### **❌ Missing Features (Recommendations):**

- [ ] Multi-Factor Authentication (MFA)
- [ ] Email encryption verification
- [ ] Advanced CAPTCHA
- [ ] Geographic rate limiting
- [ ] Real-time security alerts

---

## 🔧 **Troubleshooting**

### **Server Not Accessible:**

```bash
# Check if server is running
curl http://localhost:3000

# Restart server
npm run dev

# Check port conflicts
netstat -tulpn | grep :3000
```

### **Database Issues:**

```bash
# Reset database
npx prisma migrate reset

# Regenerate client
npx prisma generate

# Seed default data
npx prisma db seed
```

### **Testing Tool Not Working:**

```bash
# Clear browser cache
# Disable browser extensions
# Check browser console for errors
# Try different browser
```

---

## 📄 **Report Generation**

### **Automated Report:**

```bash
# Generate comprehensive security report
node security-test.js

# Output files:
# - security-report-YYYY-MM-DD.json
# - Console output dengan summary
```

### **Manual Report:**

1. Use Security Testing Suite
2. Run all tests
3. Click "Generate Complete Security Report"
4. Export results as JSON
5. Review dan document findings

---

## 🎓 **Tips untuk Presentasi/Demo**

### **Live Demo Sequence:**

1. **Show Security Features:**
   - Open `PENETRATION_TESTING_DOCUMENTATION.md`
   - Explain security implementations

2. **Demonstrate Testing:**
   - Open security testing suite
   - Run brute force test live
   - Show rate limiting in action

3. **Show Results:**
   - Display database logs
   - Explain protection mechanisms
   - Highlight security score

4. **Discuss Recommendations:**
   - Review failed tests
   - Explain improvement suggestions
   - Highlight best practices implemented

---

## 📞 **Support & Documentation**

### **Project Files:**

- `PENETRATION_TESTING_DOCUMENTATION.md` - Full analysis
- `AUTH_DOCUMENTATION.md` - Authentication details
- `ANTI_BOT_SECURITY_IMPLEMENTATION.md` - Anti-bot protection
- `public/security-testing-suite.html` - Interactive testing
- `public/brute-force-test.html` - Brute force tester
- `security-test.js` - Automated testing script

### **Key Implementation Files:**

- `src/middleware.ts` - Route protection
- `src/utils/security.ts` - Security utilities
- `src/hooks/useAntiBot.ts` - Anti-bot protection
- `src/app/api/auth/login/route.ts` - Login security
- `prisma/schema.prisma` - Database security model

---

**Ready untuk Penetration Testing! 🛡️**

Gunakan tools dan panduan ini untuk melakukan comprehensive security testing pada website sekolah. Semua fitur security sudah diimplementasikan dengan best practices untuk demonstrasi kemampuan cybersecurity yang solid.
