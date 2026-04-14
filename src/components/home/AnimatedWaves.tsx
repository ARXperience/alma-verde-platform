'use client'

export function AnimatedWaves() {
    return (
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden opacity-50">
            {/* Distributed Waves across the document height */}
            {/* Wave group 1 - Top */}
            <svg className="absolute w-[200%] top-[10%] left-0" style={{ animation: 'waveFloat1 25s ease-in-out infinite' }} viewBox="0 0 1440 320" preserveAspectRatio="none">
                <path fill="url(#waveGrad)" d="M0,224L48,208C96,192,192,160,288,165.3C384,171,480,213,576,218.7C672,224,768,192,864,176C960,160,1056,160,1152,176C1248,192,1344,224,1392,240L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
            </svg>
            
            {/* Wave group 2 */}
            <svg className="absolute w-[200%] top-[35%] left-0" style={{ animation: 'waveFloat2 18s ease-in-out infinite' }} viewBox="0 0 1440 320" preserveAspectRatio="none">
                <path fill="url(#waveGrad2)" d="M0,96L48,112C96,128,192,160,288,154.7C384,149,480,107,576,101.3C672,96,768,128,864,149.3C960,171,1056,181,1152,170.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
            </svg>

            {/* Wave group 3 */}
            <svg className="absolute w-[200%] top-[60%] left-0" style={{ animation: 'waveFloat3 30s ease-in-out infinite' }} viewBox="0 0 1440 320" preserveAspectRatio="none">
                <path fill="url(#waveGrad)" d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
            </svg>

            {/* Wave group 4 - Bottom */}
            <svg className="absolute w-[200%] bottom-[5%] left-0" style={{ animation: 'waveFloat1 22s ease-in-out infinite' }} viewBox="0 0 1440 320" preserveAspectRatio="none">
                <path fill="url(#waveGrad2)" d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,149.3C672,149,768,203,864,218.7C960,235,1056,213,1152,192C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
            </svg>

            <svg className="hidden">
                <defs>
                    <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#13ec5b" stopOpacity="0.10" />
                        <stop offset="50%" stopColor="#10b981" stopOpacity="0.05" />
                        <stop offset="100%" stopColor="#13ec5b" stopOpacity="0.10" />
                    </linearGradient>
                    <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#34d399" stopOpacity="0.08" />
                        <stop offset="50%" stopColor="#13ec5b" stopOpacity="0.04" />
                        <stop offset="100%" stopColor="#34d399" stopOpacity="0.08" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Distributed Blobs */}
            <div className="absolute w-[600px] h-[600px] rounded-full top-[15%] left-[-10%] mix-blend-multiply" style={{ background: 'radial-gradient(circle, rgba(19,236,91,0.08) 0%, transparent 70%)', animation: 'blobFloat1 20s ease-in-out infinite' }} />
            <div className="absolute w-[500px] h-[500px] rounded-full top-[40%] right-[-5%] mix-blend-multiply" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)', animation: 'blobFloat2 25s ease-in-out infinite' }} />
            <div className="absolute w-[700px] h-[700px] rounded-full top-[65%] left-[20%] mix-blend-multiply" style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.05) 0%, transparent 70%)', animation: 'blobFloat3 22s ease-in-out infinite' }} />
            <div className="absolute w-[450px] h-[450px] rounded-full bottom-[10%] right-[10%] mix-blend-multiply" style={{ background: 'radial-gradient(circle, rgba(19,236,91,0.07) 0%, transparent 70%)', animation: 'blobFloat1 28s ease-in-out infinite' }} />

            <style jsx global>{`
                @keyframes waveFloat1 {
                    0%, 100% { transform: translateX(0) translateY(0); }
                    25% { transform: translateX(-5%) translateY(-15px); }
                    50% { transform: translateX(-10%) translateY(0); }
                    75% { transform: translateX(-5%) translateY(15px); }
                }
                @keyframes waveFloat2 {
                    0%, 100% { transform: translateX(0) translateY(0); }
                    25% { transform: translateX(-8%) translateY(10px); }
                    50% { transform: translateX(-15%) translateY(0); }
                    75% { transform: translateX(-8%) translateY(-10px); }
                }
                @keyframes waveFloat3 {
                    0%, 100% { transform: translateX(0) translateY(0) rotate(0deg); }
                    33% { transform: translateX(-5%) translateY(-20px) rotate(1deg); }
                    66% { transform: translateX(-10%) translateY(20px) rotate(-1deg); }
                }
                @keyframes blobFloat1 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(50px, 40px) scale(1.1); }
                    66% { transform: translate(-30px, -20px) scale(0.9); }
                }
                @keyframes blobFloat2 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(-40px, 30px) scale(1.15); }
                    66% { transform: translate(30px, -40px) scale(0.85); }
                }
                @keyframes blobFloat3 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(40px, -30px) scale(1.05); }
                }
            `}</style>
        </div>
    )
}
