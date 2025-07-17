import { useState, useEffect } from "react";
import {
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import emailjs from "@emailjs/browser";
import {
  RateLimiter,
  sanitizeInput,
  isValidEmail,
  isValidPhone,
  createHoneypot,
  getClientIP,
} from "@/utils/security";

// Initialize rate limiter
const rateLimiter = new RateLimiter(3, 86400000); // 3 submissions per day

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Math Captcha
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, answer: 0 });
  const [userCaptchaAnswer, setUserCaptchaAnswer] = useState("");

  // Generate new captcha
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const answer = num1 + num2;
    setCaptcha({ num1, num2, answer });
    setUserCaptchaAnswer("");
  };

  // Initialize captcha on component mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  const validateForm = (): boolean => {
    // Honeypot check
    if (honeypot) {
      setErrorMessage("Spam terdeteksi. Silakan coba lagi.");
      return false;
    }

    // Rate limiting check
    const clientIP = getClientIP();
    if (!rateLimiter.isAllowed(clientIP)) {
      const remaining = rateLimiter.getRemainingAttempts(clientIP);
      setErrorMessage(
        `Terlalu banyak percobaan. Silakan coba lagi dalam 1 jam. Sisa percobaan: ${remaining}`
      );
      return false;
    }

    // Email validation
    if (!isValidEmail(formData.email)) {
      setErrorMessage("Format email tidak valid.");
      return false;
    }

    // Phone validation
    if (!isValidPhone(formData.phone)) {
      setErrorMessage("Format nomor telepon tidak valid.");
      return false;
    }

    // Required fields
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.subject ||
      !formData.message.trim()
    ) {
      setErrorMessage("Semua field wajib harus diisi.");
      return false;
    }

    // Captcha validation
    if (parseInt(userCaptchaAnswer) !== captcha.answer) {
      setErrorMessage("Jawaban captcha tidak benar. Silakan coba lagi.");
      generateCaptcha(); // Generate new captcha
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validateForm()) {
      setSubmitStatus("error");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // Sanitize inputs
      const sanitizedData = {
        from_name: sanitizeInput(formData.name),
        from_email: sanitizeInput(formData.email),
        phone: sanitizeInput(formData.phone),
        subject: sanitizeInput(formData.subject),
        message: sanitizeInput(formData.message),
        to_email: "info@smpipyakinjakarta.sch.id", // Your school email
      };

      // Send email using EmailJS
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        sanitizedData,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );

      setSubmitStatus("success");

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      setUserCaptchaAnswer("");
      generateCaptcha(); // Generate new captcha after successful submission
    } catch (error) {
      console.error("Email send error:", error);
      setSubmitStatus("error");
      setErrorMessage(
        "Gagal mengirim pesan. Silakan coba lagi atau hubungi kami langsung."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-6">Kirim Pesan</h2>

      {/* Message Container - Fixed height to prevent layout shift */}
      <div className="mb-6 h-16">
        {/* Success Message */}
        {submitStatus === "success" && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center h-full">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
            <span className="text-green-800 text-sm">
              Pesan berhasil dikirim! Kami akan membalas dalam 1x24 jam.
            </span>
          </div>
        )}

        {/* Error Message */}
        {submitStatus === "error" && errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center h-full">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
            <span className="text-red-800 text-sm">{errorMessage}</span>
          </div>
        )}

        {/* Default Guide Message */}
        {submitStatus === "idle" && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center h-full">
            <Send className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
            <span className="text-blue-800 text-sm">
              Silakan isi formulir di bawah ini untuk menghubungi kami. Semua
              field bertanda (*) wajib diisi.
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot field (hidden) */}
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          style={{ display: "none" }}
          tabIndex={-1}
          autoComplete="off"
        />

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nama Lengkap *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            maxLength={100}
            value={formData.name}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            maxLength={254}
            value={formData.email}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nomor Telepon
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            maxLength={20}
            placeholder="Contoh: +62812345678 atau 08123456789"
            value={formData.phone}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label
            htmlFor="subject"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Subjek *
          </label>
          <select
            id="subject"
            name="subject"
            required
            value={formData.subject}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">Pilih Subjek</option>
            <option value="Informasi Pendaftaran">Informasi Pendaftaran</option>
            <option value="Program Akademik">Program Akademik</option>
            <option value="Fasilitas Sekolah">Fasilitas</option>
            <option value="Pertanyaan Lainnya">Lainnya</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Pesan *
          </label>
          <textarea
            id="message"
            name="message"
            required
            maxLength={1000}
            value={formData.message}
            onChange={handleChange}
            disabled={isSubmitting}
            rows={4}
            placeholder="Tulis pesan Anda di sini..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          ></textarea>
          <div className="text-xs text-gray-500 mt-1">
            {formData.message.length}/1000 karakter
          </div>
        </div>

        {/* Math Captcha */}
        <div>
          <label
            htmlFor="captcha"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Verifikasi Anti-Spam *
          </label>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
              <span className="text-lg font-mono font-bold text-gray-800">
                {captcha.num1} + {captcha.num2} = ?
              </span>
              <button
                type="button"
                onClick={generateCaptcha}
                disabled={isSubmitting}
                className="p-1 text-gray-600 hover:text-blue-600 disabled:text-gray-400"
                title="Generate captcha baru"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            <input
              type="number"
              id="captcha"
              name="captcha"
              required
              value={userCaptchaAnswer}
              onChange={(e) => setUserCaptchaAnswer(e.target.value)}
              disabled={isSubmitting}
              placeholder="Jawaban"
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Selesaikan operasi matematika di atas untuk verifikasi
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-orange-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Mengirim...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              Kirim Pesan
            </>
          )}
        </button>

        <div className="text-xs text-gray-500 text-center">
          * Field wajib diisi. Pesan akan dikirim ke email sekolah.
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
