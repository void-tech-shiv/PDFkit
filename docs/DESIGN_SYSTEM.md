# PDFKit - Design System & Tokens

## 1. Typography
- **Primary Font:** Inter / system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif.
- **Code / Monospace:** JetBrains Mono, "Fira Code", monospace.
- **Scale:**
  - `text-xs`: 12px (0.75rem) - Badges, metadata, fine print
  - `text-sm`: 14px (0.875rem) - Secondary descriptions, helper text, form labels
  - `text-base`: 16px (1.0rem) - Body text, standard inputs, buttons
  - `text-lg`: 18px (1.125rem) - Card titles, subheadings
  - `text-xl`: 20px (1.25rem) - Tool titles, section headings
  - `text-2xl`: 24px (1.5rem) - Hero secondary, modal titles
  - `text-4xl` / `text-5xl`: 36px - 48px - Main Hero Title

---

## 2. Color Palette & Tokens

### Light Theme
- **Background (`--bg-primary`):** `#F8FAFC` (Slate-50)
- **Card Background (`--bg-card`):** `#FFFFFF` (White)
- **Card Border (`--border`):** `#E2E8F0` (Slate-200)
- **Primary Text (`--text-primary`):** `#0F172A` (Slate-900)
- **Secondary Text (`--text-secondary`):** `#64748B` (Slate-500)
- **Primary Accent (`--primary`):** `#2563EB` (Blue-600)
- **Primary Accent Hover (`--primary-hover`):** `#1D4ED8` (Blue-700)
- **Success (`--success`):** `#10B981` (Emerald-500)
- **Warning (`--warning`):** `#F59E0B` (Amber-500)
- **Destructive/Error (`--destructive`):** `#EF4444` (Red-500)

### Dark Theme
- **Background (`--bg-primary`):** `#0B0F19` (Deep Slate-950)
- **Card Background (`--bg-card`):** `#111827` (Gray-900)
- **Card Border (`--border`):** `#1F2937` (Gray-800)
- **Primary Text (`--text-primary`):** `#F9FAFB` (Gray-50)
- **Secondary Text (`--text-secondary`):** `#9CA3AF` (Gray-400)
- **Primary Accent (`--primary`):** `#3B82F6` (Blue-500)
- **Primary Accent Hover (`--primary-hover`):** `#60A5FA` (Blue-400)
- **Success (`--success`):** `#34D399` (Emerald-400)
- **Warning (`--warning`):** `#FBBF24` (Amber-400)
- **Destructive/Error (`--destructive`):** `#F87171` (Red-400)

---

## 3. Shadows, Radii & Depth
- **Border Radii:**
  - `rounded-lg`: 8px (Standard buttons, inputs, tags)
  - `rounded-xl`: 12px (Cards, tool sections, dialogs)
  - `rounded-2xl`: 16px (Dropzones, hero panels, modal containers)
  - `rounded-full`: 9999px (Pill tags, avatars, toggle switches)
- **Shadows:**
  - `shadow-sm`: `0 1px 2px 0 rgb(0 0 0 / 0.05)`
  - `shadow-md`: `0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)`
  - `shadow-xl`: `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)`
  - `shadow-glow`: `0 0 20px -3px rgba(37, 99, 235, 0.25)`

---

## 4. UI Components Specification
- **Button:** Variants (`primary`, `secondary`, `outline`, `ghost`, `destructive`), Sizes (`sm`, `md`, `lg`), with loading spinner slot.
- **Dropzone:** Dashed 2px border, transition on drag-over, animated upload icon, format chips.
- **Badge:** Status pill indicators (`Success`, `Beta`, `Popular`, `Protected`).
- **Page Thumbnail:** Rendered canvas thumbnail with page badge, select checkbox, and rotate/delete action overlays.
- **ProgressBar:** Smooth CSS transition, indeterminate animated pulse state, percentage counter.
- **Modal / Dialog:** Accessible backdrop blur, keyboard ESC dismissal, focus trap.
