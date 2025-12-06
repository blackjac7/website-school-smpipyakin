"use client";

import { useState } from "react";

const VulnerableForm = () => {
  const [userInput, setUserInput] = useState("");
  const [displayedContent, setDisplayedContent] = useState("");
  const [comments, setComments] = useState<string[]>([]);

  // Fungsi yang TIDAK aman - langsung merender HTML tanpa sanitasi
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Vulnerable: Langsung menampilkan input user tanpa sanitasi
    setDisplayedContent(userInput);
    setComments([...comments, userInput]);

    // Reset form
    setUserInput("");
  };

  // Fungsi untuk clear semua data
  const handleClear = () => {
    setDisplayedContent("");
    setComments([]);
    setUserInput("");
  };

  return (
    <div className="mt-8 p-6 bg-red-50 border-2 border-red-200 rounded-lg max-w-md mx-auto">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-red-700 mb-2">
          ⚠️ Form Vulnerable (Untuk Testing Keamanan)
        </h3>
        <p className="text-sm text-red-600 mb-4">
          Form ini sengaja dibuat tidak aman untuk demonstrasi. JANGAN gunakan
          di production!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="vulnerableInput"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Input Bebas (Tidak Aman):
          </label>
          <textarea
            id="vulnerableInput"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Coba masukkan: <script>alert('XSS Attack!')</script> atau <img src=x onerror=alert('XSS')>"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            rows={3}
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition duration-200"
          >
            Submit (Vulnerable)
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-200"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Area untuk menampilkan konten yang di-inject */}
      {displayedContent && (
        <div className="mt-4 p-3 bg-white border border-red-300 rounded">
          <h4 className="text-sm font-medium text-red-700 mb-2">
            Output (Vulnerable):
          </h4>
          {/* VULNERABLE: dangerouslySetInnerHTML tanpa sanitasi */}
          <div
            className="text-sm"
            dangerouslySetInnerHTML={{ __html: displayedContent }}
          />
        </div>
      )}

      {/* Daftar komentar yang vulnerable */}
      {comments.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-red-700 mb-2">
            Komentar Tersimpan:
          </h4>
          <div className="space-y-2">
            {comments.map((comment, index) => (
              <div
                key={index}
                className="p-2 bg-white border border-red-300 rounded text-sm"
                // VULNERABLE: dangerouslySetInnerHTML untuk setiap komentar
                dangerouslySetInnerHTML={{ __html: comment }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Contoh payload XSS untuk testing */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded">
        <h4 className="text-sm font-medium text-yellow-700 mb-2">
          Contoh Payload XSS untuk Testing:
        </h4>
        <div className="text-xs text-yellow-600 space-y-1">
          <p>
            • <code>&lt;script&gt;alert(&apos;XSS!&apos;)&lt;/script&gt;</code>
          </p>
          <p>
            • <code>&lt;img src=x onerror=alert(&apos;XSS&apos;)&gt;</code>
          </p>
          <p>
            • <code>&lt;svg onload=alert(&apos;XSS&apos;)&gt;</code>
          </p>
          <p>
            • <code>&lt;iframe src=javascript:alert(&apos;XSS&apos;)&gt;</code>
          </p>
          <p>
            • <code>&lt;body onload=alert(&apos;XSS&apos;)&gt;</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VulnerableForm;
