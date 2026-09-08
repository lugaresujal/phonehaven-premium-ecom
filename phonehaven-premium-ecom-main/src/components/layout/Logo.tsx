import logo from "@/assets/images/house-of-phones-logo.png";
import { Link } from "@tanstack/react-router";

export function Logo({ size = 80, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <Link 
      to="/" 
      className="flex items-center gap-3 group justify-start md:justify-center pl-4 md:pl-0"
    >
      <img
        src={logo}
        alt="House of Phones"
        width={size}
        height={size}
        className="object-contain transition-transform group-hover:scale-105"
        style={{ width: size, height: size }}
      />
      {/* Text wapas add karo (agar showText true hai) */}
      {showText && (
        <span className="text-xl font-bold text-gray-800 hidden sm:inline">
          
        </span>
      )}
    </Link>
  );
}