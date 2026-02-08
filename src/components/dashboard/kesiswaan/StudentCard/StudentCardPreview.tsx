"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";

interface Student {
  id: string;
  nisn: string;
  name: string;
  class: string | null;
  year: number | null;
  gender: string | null;
  birthDate: string | null;
  birthPlace: string | null;
  qrData?: string;
}

interface StudentCardPreviewProps {
  student: Student;
}

export default function StudentCardPreview({
  student,
}: StudentCardPreviewProps) {
  // Use HMAC-signed QR payload from server (compact ~60 chars = fast scan)
  // Falls back to NISN-only if qrData not provided
  const qrValue = student.qrData || student.nisn;

  // Tahun ajaran
  const currentYear = new Date().getFullYear();
  const academicYear = `${currentYear}/${currentYear + 1}`;

  return (
    <div
      className="student-card"
      style={{
        width: "85.6mm",
        height: "54mm",
        backgroundColor: "rgb(255, 255, 255)",
        border: "1px solid rgb(229, 231, 235)",
        borderRadius: "3.175mm",
        overflow: "hidden",
        position: "relative",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        pageBreakInside: "avoid",
      }}
    >
      {/* Header dengan gradient */}
      <div
        style={{
          background:
            "linear-gradient(135deg, rgb(38, 117, 244) 0%, rgb(30, 91, 191) 100%)",
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "2px solid rgb(245, 158, 11)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Logo Sekolah */}
          <div
            style={{
              width: "36px",
              height: "36px",
              backgroundColor: "rgb(255, 255, 255)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "4px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <img
              src="/logo.png"
              alt="Logo SMP IP YAKIN"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </div>
          <div>
            <div
              style={{
                color: "rgb(255, 255, 255)",
                fontSize: "11px",
                fontWeight: "700",
                lineHeight: "1.2",
              }}
            >
              SMP IP YAKIN
            </div>
            <div
              style={{
                color: "rgb(224, 231, 255)",
                fontSize: "8px",
                fontWeight: "500",
                lineHeight: "1.2",
              }}
            >
              Kartu Tanda Siswa
            </div>
          </div>
        </div>
        <div
          style={{
            color: "rgb(255, 255, 255)",
            fontSize: "8px",
            fontWeight: "600",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            padding: "2px 6px",
            borderRadius: "4px",
          }}
        >
          {academicYear}
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          display: "flex",
          padding: "10px 12px",
          gap: "10px",
          alignItems: "flex-start",
        }}
      >
        {/* Avatar berdasarkan gender */}
        <div
          style={{
            width: "60px",
            height: "75px",
            backgroundColor:
              student.gender === "MALE"
                ? "rgb(219, 234, 254)"
                : "rgb(252, 231, 243)",
            borderRadius: "6px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: `2px solid ${student.gender === "MALE" ? "rgb(38, 117, 244)" : "rgb(236, 72, 153)"}`,
            flexShrink: 0,
          }}
        >
          {student.gender === "MALE" ? (
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgb(38, 117, 244)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          ) : (
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgb(236, 72, 153)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="5" />
              <path d="M20 21a8 8 0 1 0-16 0" />
            </svg>
          )}
          <div
            style={{
              fontSize: "7px",
              color:
                student.gender === "MALE"
                  ? "rgb(30, 64, 175)"
                  : "rgb(190, 24, 93)",
              fontWeight: "600",
              marginTop: "2px",
            }}
          >
            {student.gender === "MALE" ? "L" : "P"}
          </div>
        </div>

        {/* Student Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "rgb(31, 41, 55)",
              marginBottom: "4px",
              lineHeight: "1.2",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {student.name}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <div style={{ display: "flex", gap: "4px" }}>
              <span
                style={{
                  fontSize: "9px",
                  color: "rgb(107, 114, 128)",
                  fontWeight: "600",
                  minWidth: "32px",
                }}
              >
                NISN:
              </span>
              <span
                style={{
                  fontSize: "9px",
                  color: "rgb(31, 41, 55)",
                  fontWeight: "500",
                }}
              >
                {student.nisn}
              </span>
            </div>

            <div style={{ display: "flex", gap: "4px" }}>
              <span
                style={{
                  fontSize: "9px",
                  color: "rgb(107, 114, 128)",
                  fontWeight: "600",
                  minWidth: "32px",
                }}
              >
                Kelas:
              </span>
              <span
                style={{
                  fontSize: "9px",
                  color: "rgb(31, 41, 55)",
                  fontWeight: "500",
                }}
              >
                {student.class || "N/A"}
              </span>
            </div>

            <div style={{ display: "flex", gap: "4px" }}>
              <span
                style={{
                  fontSize: "9px",
                  color: "rgb(107, 114, 128)",
                  fontWeight: "600",
                  minWidth: "32px",
                }}
              >
                Tahun:
              </span>
              <span
                style={{
                  fontSize: "9px",
                  color: "rgb(31, 41, 55)",
                  fontWeight: "500",
                }}
              >
                {student.year || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2px",
          }}
        >
          <div
            style={{
              padding: "4px",
              backgroundColor: "rgb(255, 255, 255)",
              borderRadius: "4px",
              border: "2px solid rgb(229, 231, 235)",
            }}
          >
            <QRCodeSVG
              value={qrValue}
              size={64}
              level="L"
              includeMargin={false}
              style={{
                display: "block",
              }}
            />
          </div>
          <div
            style={{
              fontSize: "7px",
              color: "rgb(107, 114, 128)",
              fontWeight: "600",
            }}
          >
            Scan Me
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "rgb(249, 250, 251)",
          borderTop: "1px solid rgb(229, 231, 235)",
          padding: "4px 12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: "7px",
            color: "rgb(107, 114, 128)",
            fontWeight: "500",
          }}
        >
          ID: {student.id.substring(0, 8).toUpperCase()}
        </div>
        <div
          style={{
            fontSize: "7px",
            color: "rgb(16, 185, 129)",
            fontWeight: "600",
            backgroundColor: "rgb(209, 250, 229)",
            padding: "2px 6px",
            borderRadius: "3px",
          }}
        >
          Valid until Jun {currentYear + 1}
        </div>
      </div>
    </div>
  );
}
