import { Menu } from "lucide-react";

function Header() {
  return (
    <header className="relative h-16 px-5 bg-[#faf6ee] z-100 flex items-center">
      <button className="absolute left-10">
        <Menu className="w-6 h-6 text-[#170ad16c]" />
      </button>
    </header>
  );
}

export default Header;
