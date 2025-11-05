import { useEffect, useState } from "react";

export default function Loading() {
  const [dots, setDots] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev === 3 ? 1 : prev + 1));
    }, 2000);
    return () => clearInterval(interval);
  }, []);


  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0f3e58] text-white">
      <div className="relative w-40 h-40 flex items-center justify-center mb-8">
        {/* Círculos giratórios */}
        <div className="absolute w-24 h-24 border-4 border-t-[#c5ac5c] border-r-transparent border-b-[#c5ac5c] border-l-transparent rounded-full animate-spin-slow"></div>
        <div className="absolute w-16 h-16 border-4 border-t-[#c5ac5c] border-r-transparent border-b-[#c5ac5c] border-l-transparent rounded-full animate-spin-reverse"></div>
        <div className="absolute w-8 h-8 border-4 border-t-[#c5ac5c] border-r-transparent border-b-[#c5ac5c] border-l-transparent rounded-full animate-spin-fast"></div>
      </div>

      {/* Texto animado com pontos */}
      <div className="text-[#c5ac5c] text-lg font-semibold">
        Por favor, aguarde{".".repeat(dots)}
      </div>

      {/* Linha de progresso animada */}
      <div className="mt-8 w-64 h-1 bg-[#978b62] rounded-full overflow-hidden">
        <div className="h-full bg-[#c5ac5c] animate-progress"></div>
      </div>

      <style>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        @keyframes spin-fast {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(720deg); }
        }
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0); }
        }
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
        .animate-spin-reverse {
          animation: spin-reverse 3s linear infinite;
        }
        .animate-spin-fast {
          animation: spin-fast 1.5s linear infinite;
        }
        .animate-progress {
          animation: progress 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
