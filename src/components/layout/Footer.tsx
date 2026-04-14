import Link from "next/link"

export function Footer() {
    return (
        <footer className="bg-[#111813] text-white py-12 px-6 lg:px-20 border-t border-white/5">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#13ec5b] text-3xl">eco</span>
                    <h1 className="text-xl font-extrabold tracking-tight uppercase font-display">Alma Verde</h1>
                </div>
                <div className="flex gap-8 text-sm text-slate-400">
                    <Link className="hover:text-[#13ec5b] transition-colors" href="#">Política de Privacidad</Link>
                    <Link className="hover:text-[#13ec5b] transition-colors" href="#">Términos de Servicio</Link>
                    <a className="hover:text-[#13ec5b] transition-colors" href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
                    <a className="hover:text-[#13ec5b] transition-colors" href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                </div>
                <p className="text-sm text-slate-500">© {new Date().getFullYear()} Alma Verde Diseño. Todos los derechos reservados.</p>
            </div>
        </footer>
    )
}
