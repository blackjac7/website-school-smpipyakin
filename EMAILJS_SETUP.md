# 📧 EmailJS Setup Guide untuk SMP IP Yakin

## 🚀 Quick Setup (5 menit)

### 1. Daftar EmailJS Account
1. Kunjungi [EmailJS.com](https://www.emailjs.com/)
2. Klik "Sign Up" dan daftar dengan email sekolah
3. Verifikasi email Anda

### 2. Setup Email Service
1. Login ke dashboard EmailJS
2. Klik "Email Services" → "Add New Service"
3. Pilih provider email Anda:
   - **Gmail** (recommended untuk testing)
   - **Outlook** 
   - **Yahoo**
4. Ikuti instruksi untuk connect email
5. **Copy SERVICE_ID** yang dihasilkan

### 3. Create Email Templates
Buat 2 template untuk sistem yang lebih profesional:

#### Template 1: Notifikasi ke Sekolah
1. Klik "Email Templates" → "Create New Template"  
2. **Template Name**: `school_notification`
3. **Subject**: `[SMP IP Yakin] Pesan Baru dari {{from_name}} - {{subject}}`
4. **Content**:

```html
<div style="font-family: system-ui, sans-serif, Arial; font-size: 16px; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
  <!-- Header dengan Logo -->
  <div style="background-color: #1e40af; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
    <h2 style="color: white; margin: 0; font-size: 24px;">SMP IP Yakin Jakarta</h2>
    <p style="color: #93c5fd; margin: 5px 0 0 0; font-size: 14px;">Pesan Baru dari Website</p>
  </div>
  
  <!-- Content -->
  <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
    <h3 style="color: #1f2937; margin-top: 0; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
      📧 Detail Pesan
    </h3>
    
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr>
        <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 120px;">Nama:</td>
        <td style="padding: 8px 0; color: #1f2937;">{{from_name}}</td>
      </tr>
      <tr style="background-color: #f9fafb;">
        <td style="padding: 8px 0; font-weight: bold; color: #374151;">Email:</td>
        <td style="padding: 8px 0; color: #1f2937;">{{from_email}}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-weight: bold; color: #374151;">Telepon:</td>
        <td style="padding: 8px 0; color: #1f2937;">{{phone}}</td>
      </tr>
      <tr style="background-color: #f9fafb;">
        <td style="padding: 8px 0; font-weight: bold; color: #374151;">Subjek:</td>
        <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">{{subject}}</td>
      </tr>
    </table>
    
    <h4 style="color: #1f2937; margin: 25px 0 10px 0;">💬 Pesan:</h4>
    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6; font-style: italic; color: #374151; line-height: 1.6;">
      {{message}}
    </div>
    
    <!-- Action Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="mailto:{{from_email}}?subject=Re: {{subject}}" 
         style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
        📤 Balas Email
      </a>
    </div>
  </div>
  
  <!-- Footer -->
  <div style="text-align: center; margin-top: 20px; padding: 15px; color: #6b7280; font-size: 12px;">
    <p style="margin: 0;">Dikirim melalui website SMP IP Yakin Jakarta</p>
    <p style="margin: 5px 0 0 0;">Jl. Bangun Nusa Raya No. 10, Cengkareng Timur, Jakarta Barat 11730</p>
    <p style="margin: 5px 0 0 0;">📞 +62 21 6194 381 | 📧 info@smpipyakinjakarta.sch.id</p>
  </div>
</div>
```

#### Template 2: Auto-Reply untuk Pengirim
1. Buat template baru dengan nama: `user_autoresponse`
2. **Subject**: `Terima kasih telah menghubungi SMP IP Yakin Jakarta`
3. **Content**:

```html
<div style="font-family: system-ui, sans-serif, Arial; font-size: 16px; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
  <!-- Header dengan Logo -->
  <div style="background-color: #059669; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
    <h2 style="color: white; margin: 0; font-size: 24px;">SMP IP Yakin Jakarta</h2>
    <p style="color: #a7f3d0; margin: 5px 0 0 0; font-size: 14px;">Pesan Anda Telah Diterima</p>
  </div>
  
  <!-- Content -->
  <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
    <p style="color: #1f2937; font-size: 18px; margin-top: 0;">
      Halo <strong>{{from_name}}</strong>,
    </p>
    
    <p style="color: #374151; line-height: 1.6;">
      Terima kasih telah menghubungi <strong>SMP IP Yakin Jakarta</strong>! 
      Kami telah menerima pesan Anda dengan subjek: <strong style="color: #059669;">"{{subject}}"</strong>
    </p>
    
    <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #065f46; font-weight: bold;">📋 Ringkasan Pesan Anda:</p>
      <p style="margin: 10px 0 0 0; color: #047857; font-style: italic;">{{message}}</p>
    </div>
    
    <p style="color: #374151; line-height: 1.6;">
      Tim kami akan memproses dan membalas pesan Anda dalam waktu <strong>1x24 jam</strong> pada hari kerja. 
      Untuk pertanyaan mendesak, silakan hubungi kami langsung di nomor telepon yang tersedia.
    </p>
    
    <!-- Contact Info -->
    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 25px 0;">
      <h4 style="color: #1f2937; margin: 0 0 15px 0;">📞 Kontak Darurat:</h4>
      <p style="margin: 5px 0; color: #374151;"><strong>Kantor:</strong> +62 21 6194 381</p>
      <p style="margin: 5px 0; color: #374151;"><strong>Email:</strong> info@smpipyakinjakarta.sch.id</p>
      <p style="margin: 5px 0; color: #374151;"><strong>Alamat:</strong> Jl. Bangun Nusa Raya No. 10, Cengkareng Timur, Jakarta Barat 11730</p>
    </div>
    
    <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #1e40af; font-weight: bold;">💡 Tip:</p>
      <p style="margin: 5px 0 0 0; color: #1d4ed8; font-size: 14px;">
        Ikuti media sosial kami untuk update terbaru tentang kegiatan sekolah dan informasi pendaftaran.
      </p>
    </div>
  </div>
  
  <!-- Footer -->
  <div style="text-align: center; margin-top: 20px; padding: 15px;">
    <p style="color: #059669; font-weight: bold; margin: 0;">
      Terima kasih atas kepercayaan Anda kepada SMP IP Yakin Jakarta
    </p>
    <p style="color: #6b7280; font-size: 12px; margin: 10px 0 0 0;">
      Email ini dikirim otomatis, mohon tidak membalas email ini.
    </p>
  </div>
</div>
```

4. **Copy TEMPLATE_ID** dari kedua template yang dibuat

### 4. Get Public Key
1. Klik "Account" → "General"
2. **Copy PUBLIC_KEY** di bagian API Keys

### 5. Update Environment Variables
Edit file `.env.local`:

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxxxxxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xxxxxxx  
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
```

### 6. Test Form
1. Restart development server: `npm run dev`
2. Buka halaman contact
3. Isi form dan kirim test message
4. Check email Anda!

## 🛡️ Security Features yang Sudah Diimplementasi

✅ **Rate Limiting**: 5 submissions per jam per user
✅ **Input Sanitization**: Membersihkan XSS attacks  
✅ **Email Validation**: Format email yang benar
✅ **Phone Validation**: Format Indonesia (+62, 08xx)
✅ **Honeypot**: Anti-spam bot protection
✅ **Field Limits**: Maksimal karakter untuk setiap field
✅ **Real-time Feedback**: Loading states & error messages

## 📊 EmailJS Free Tier Limits

- **200 emails/month** (cukup untuk website sekolah)
- **2 email services**
- **2 email templates** 
- **Basic support**

Upgrade ke paid plan jika butuh lebih banyak email.

## 🔧 Troubleshooting

### Error: "Service is unreachable"
- Check SERVICE_ID benar
- Pastikan email service sudah terconnect

### Error: "Template not found"  
- Check TEMPLATE_ID benar
- Pastikan template sudah published

### Error: "Public key not found"
- Check PUBLIC_KEY benar
- Restart development server

### Tidak menerima email
- Check spam folder
- Pastikan email template variables benar
- Test dengan email berbeda

## 📱 Production Checklist

- [ ] Test form dengan berbagai email providers
- [ ] Set up email notifications untuk admin
- [ ] Configure custom "from" email address  
- [ ] Add email autoresponder template
- [ ] Monitor EmailJS usage quota
- [ ] Set up backup contact method (WhatsApp)

## 🎯 Next Steps (Optional)

1. **Add reCAPTCHA**: Extra bot protection
2. **Database Logging**: Save submissions to database
3. **Admin Dashboard**: View all contact submissions
4. **Auto-reply**: Send confirmation email to users
5. **Analytics**: Track form conversion rates
