import React from "react";
import { RefreshCw } from "lucide-react";

interface AntiBotComponentsProps {
  // Math Captcha
  captcha: {
    num1: number;
    num2: number;
    answer: number;
  };
  userCaptchaAnswer: string;
  onCaptchaAnswerChange: (answer: string) => void;
  onCaptchaRefresh: () => void;

  // Honeypot
  honeypot: string;
  onHoneypotChange: (value: string) => void;
  honeypotFieldName: string;
  isClient?: boolean;

  // Display options
  showCaptcha?: boolean;
  showHoneypot?: boolean;
  captchaLabel?: string;
  size?: "sm" | "md" | "lg";
}

export default function AntiBotComponents({
  captcha,
  userCaptchaAnswer,
  onCaptchaAnswerChange,
  onCaptchaRefresh,
  honeypot,
  onHoneypotChange,
  honeypotFieldName,
  isClient = true,
  showCaptcha = true,
  showHoneypot = true,
  captchaLabel = "Verifikasi",
  size = "md",
}: AntiBotComponentsProps) {
  const sizeClasses = {
    sm: {
      input: "text-sm py-2 px-3",
      button: "p-1",
      text: "text-sm",
      captcha: "text-base",
      captchaContainer: "px-3 py-2",
      inputWidth: "w-20",
    },
    md: {
      input: "text-base py-2 px-3",
      button: "p-1",
      text: "text-sm",
      captcha: "text-lg",
      captchaContainer: "px-4 py-2",
      inputWidth: "w-24",
    },
    lg: {
      input: "text-lg py-3 px-4",
      button: "p-1.5",
      text: "text-base",
      captcha: "text-xl",
      captchaContainer: "px-5 py-3",
      inputWidth: "w-28",
    },
  };

  const classes = sizeClasses[size];

  return (
    <>
      {/* Math Captcha */}
      {showCaptcha && (
        <div>
          <label
            className={`block font-medium text-gray-700 mb-1 ${classes.text}`}
          >
            {captchaLabel} <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 bg-gray-100 border border-gray-300 rounded-lg ${classes.captchaContainer}`}
            >
              <span
                className={`font-mono font-bold text-gray-800 ${classes.captcha}`}
              >
                {captcha.num1} + {captcha.num2} = ?
              </span>
              <button
                type="button"
                onClick={onCaptchaRefresh}
                className={`text-gray-600 hover:text-blue-600 transition-colors ${classes.button}`}
                title="Generate captcha baru"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <input
              type="number"
              value={userCaptchaAnswer}
              onChange={(e) => onCaptchaAnswerChange(e.target.value)}
              placeholder="Jawaban"
              className={`border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${classes.input} ${classes.inputWidth}`}
              required
              min="0"
              max="20"
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            💡 Masukkan hasil penjumlahan di atas untuk verifikasi
          </div>
        </div>
      )}

      {/* Honeypot Field (Hidden) */}
      {showHoneypot && isClient && (
        <div style={{ display: "none" }} aria-hidden="true">
          <label htmlFor={honeypotFieldName}>Website</label>
          <input
            type="text"
            id={honeypotFieldName}
            name={honeypotFieldName}
            value={honeypot}
            onChange={(e) => onHoneypotChange(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>
      )}
    </>
  );
}
