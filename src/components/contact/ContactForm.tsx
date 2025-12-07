import { useState } from "react";
import { Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import emailjs from "@emailjs/browser";
import { sanitizeInput, isValidEmail, isValidPhone } from "@/utils/security";
import { useAntiBot } from "@/hooks/useAntiBot";
import AntiBotComponents from "@/components/shared/AntiBotComponents";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Anti-bot validation
  const antiBot = useAntiBot("contact", {
    enableCaptcha: true,
    enableHoneypot: true,
    enableRateLimit: true,
  });

  const validateForm = (): boolean => {
    // Anti-bot validation
    const antiBotResult = antiBot.validateAntiBot();
    if (!antiBotResult.isValid) {
      setErrorMessage(antiBotResult.error || "Validasi keamanan gagal.");
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
        to_email: "info@smpipyakin.sch.id", // Your school email
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

      // Reset anti-bot
      antiBot.setUserCaptchaAnswer("");
      antiBot.generateCaptcha();
      antiBot.setHoneypot("");
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

        {/* Anti-Bot Security */}
        <AntiBotComponents
          captcha={antiBot.captcha}
          userCaptchaAnswer={antiBot.userCaptchaAnswer}
          onCaptchaAnswerChange={antiBot.setUserCaptchaAnswer}
          onCaptchaRefresh={antiBot.generateCaptcha}
          honeypot={antiBot.honeypot}
          onHoneypotChange={antiBot.setHoneypot}
          honeypotFieldName={antiBot.honeypotFieldName}
          isClient={antiBot.isClient}
          captchaLabel="Verifikasi Anti-Spam"
          size="md"
          showCaptcha={true}
          showHoneypot={true}
        />

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
