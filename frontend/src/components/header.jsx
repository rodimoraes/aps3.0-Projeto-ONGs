import { Menu } from 'lucide-react';

function Header() {
    return (
            <div className="bg-gray-500 text-white p-1 text-4xl font-bold shadow-md relative">
                <button><Menu /></button>

                <p className="absolute inset-x-20 top-0 text-xl">EncontreONG</p>
            </div>

    )
}

export default Header;