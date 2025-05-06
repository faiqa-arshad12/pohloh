// components/layout/footer.tsx
export function Footer() {
    return (
      <footer className="bg-[#0d0d0d] text-gray-400 text-center py-4 text-sm border-t border-gray-800">
        © {new Date().getFullYear()} Pohloh. All rights reserved.
      </footer>
    );
  }
