# PPDB Components Documentation

## Overview

Komponen-komponen modular untuk halaman Pendaftaran Peserta Didik Baru (PPDB) SMP IP Yakin Jakarta. Semua komponen dibuat mengikuti best practices dengan menggunakan TypeScript, React Hooks, dan Tailwind CSS.

## Struktur Komponen

### 1. PPDBHero.tsx

**Hero section dengan gradient background dan animasi**

- Menampilkan judul utama dan deskripsi PPDB
- Highlight cards dengan informasi penting
- Call-to-action buttons
- Wave pattern di bagian bawah untuk transisi smooth

**Features:**

- Responsive design (mobile-first)
- CSS animations dengan fade-in effects
- Gradient background dengan pattern overlay
- Icon highlights menggunakan Lucide React

### 2. PPDBInfo.tsx

**Section informasi penting PPDB**

- Langkah-langkah pendaftaran
- Tanggal-tanggal penting
- Persyaratan dokumen
- Button download panduan PDF

**Props:**

```typescript
interface PPDBInfoProps {
  onDownloadGuide: () => void;
}
```

**Features:**

- 3-column responsive grid
- Interactive hover effects
- Status indicators untuk timeline
- Checklist dengan icons

### 3. PPDBForm.tsx

**Formulir pendaftaran siswa baru**

- Form validation dengan HTML5 required attributes
- Success/error message handling
- Loading states dengan animations
- Organized sections (Data Pribadi, Informasi Tambahan)

**Props:**

```typescript
interface PPDBFormProps {
  formData: FormData;
  isSubmitting: boolean;
  submitStatus: "idle" | "success" | "error";
  onInputChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}
```

**Features:**

- Form sectioning dengan icons
- Input icons menggunakan Lucide React
- Custom styled form elements
- Smooth transitions dan hover effects
- Auto-scroll ke success message

### 4. PPDBStatus.tsx

**Komponen untuk cek status pendaftaran**

- Input NISN dengan validation
- Info cards dengan benefit highlights
- Status explanation guide

**Props:**

```typescript
interface PPDBStatusProps {
  statusNISN: string;
  onNISNChange: (value: string) => void;
  onStatusCheck: () => void;
}
```

**Features:**

- NISN format validation
- Status indicator examples
- Info cards dengan color coding
- Responsive design

### 5. PPDBHelp.tsx

**Section bantuan dan kontak**

- Multiple contact methods (WhatsApp, Phone, Email)
- FAQ section
- Office information dengan jam operasional
- CTA section

**Props:**

```typescript
interface PPDBHelpProps {
  onWhatsAppChat: () => void;
}
```

**Features:**

- Contact cards dengan action buttons
- FAQ dengan expandable design
- Social proof dan office info
- Call-to-action dengan WhatsApp integration

### 6. PPDBTestimonials.tsx

**Testimonial dari orang tua siswa**

- Cards dengan quote design
- Star ratings
- Avatar placeholders
- Statistics section

**Features:**

- 3-column testimonial grid
- Star rating display
- Hover animations
- Statistics showcasing

## Design System

### Colors

- **Primary Blue**: `from-blue-600 to-blue-700`
- **Accent Yellow**: `text-yellow-300`, `bg-yellow-400`
- **Success Green**: `text-green-600`, `bg-green-500`
- **Error Red**: `text-red-600`, `bg-red-500`
- **Gray Scale**: `text-gray-600`, `bg-gray-50`

### Typography

- **Headlines**: `text-3xl md:text-4xl font-bold`
- **Subheadlines**: `text-xl font-semibold`
- **Body Text**: `text-gray-600 leading-relaxed`
- **Small Text**: `text-sm text-gray-500`

### Spacing

- **Section Padding**: `py-16` (64px vertical)
- **Container Max Width**: `max-w-7xl mx-auto`
- **Card Padding**: `p-6` atau `p-8`
- **Grid Gaps**: `gap-6` atau `gap-8`

### Animations

- **Fade In Up**: Custom CSS animation untuk entrance effects
- **Hover Scales**: `hover:scale-105` untuk interactive elements
- **Transitions**: `transition-all duration-300` untuk smooth effects
- **Loading States**: Spinner animations dengan `animate-spin`

## Usage Example

```tsx
import PPDBHero from "@/components/ppdb/PPDBHero";
import PPDBInfo from "@/components/ppdb/PPDBInfo";
import PPDBForm from "@/components/ppdb/PPDBForm";
import PPDBStatus from "@/components/ppdb/PPDBStatus";
import PPDBHelp from "@/components/ppdb/PPDBHelp";
import PPDBTestimonials from "@/components/ppdb/PPDBTestimonials";

export default function PPDBPage() {
  // State management
  const [formData, setFormData] = useState({...});

  // Event handlers
  const handleSubmit = (e) => {...};
  const handleDownloadGuide = () => {...};
  const handleWhatsAppChat = () => {...};

  return (
    <div className="min-h-screen bg-gray-50">
      <PPDBHero />
      <PPDBInfo onDownloadGuide={handleDownloadGuide} />
      <PPDBForm {...formProps} />
      <PPDBStatus {...statusProps} />
      <PPDBTestimonials />
      <PPDBHelp onWhatsAppChat={handleWhatsAppChat} />
    </div>
  );
}
```

## Mobile Responsiveness

Semua komponen menggunakan mobile-first approach dengan breakpoints:

- **Mobile**: Default styles
- **Tablet**: `md:` prefix (768px+)
- **Desktop**: `lg:` prefix (1024px+)
- **Large Desktop**: `xl:` prefix (1280px+)

## Accessibility Features

- Semantic HTML elements
- Proper ARIA labels
- Focus states untuk keyboard navigation
- Color contrast yang memenuhi WCAG guidelines
- Alt text untuk icons (handled by Lucide React)

## Performance Optimizations

- Lazy loading untuk heavy components
- Optimized images dengan Next.js Image component
- CSS-in-JS minimal (menggunakan Tailwind classes)
- Component splitting untuk better code splitting
- Memoization untuk expensive operations (jika diperlukan)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- React 18+
- TypeScript 5+
- Tailwind CSS 4+
- Lucide React untuk icons
- Next.js 15+ untuk routing dan optimizations
