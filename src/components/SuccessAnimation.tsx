'use client';

interface SuccessAnimationProps {
  uploadedCount?: number;
  onSendMore: () => void;
  onGoHome: () => void;
}

export default function SuccessAnimation({
  uploadedCount = 1,
  onSendMore,
  onGoHome,
}: SuccessAnimationProps) {
  const isMultiple = uploadedCount > 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm animate-fade-in">
      <div className="text-center px-6 animate-scale-in">
        {/* Animated checkmark */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-emerald-500 animate-draw-check"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
              style={{
                strokeDasharray: 24,
                strokeDashoffset: 24,
                animation: 'drawCheck 0.5s ease-out 0.3s forwards',
              }}
            />
          </svg>
        </div>

        {/* Decorative sparkles */}
        <div className="relative mb-4">
          <span className="absolute -top-8 -left-4 text-2xl animate-float-sparkle" style={{ animationDelay: '0s' }}>✨</span>
          <span className="absolute -top-6 right-0 text-xl animate-float-sparkle" style={{ animationDelay: '0.3s' }}>💛</span>
          <span className="absolute -top-10 left-1/2 text-lg animate-float-sparkle" style={{ animationDelay: '0.6s' }}>✨</span>
        </div>

        <h2 className="font-serif text-2xl text-[#2a2a2a] mb-2">
          {isMultiple ? 'Arquivos enviados com sucesso!' : 'Enviado com sucesso!'}
        </h2>
        <p className="text-[#777] mb-8">
          {isMultiple
            ? `Obrigado por compartilhar ${uploadedCount} momentos especiais.`
            : 'Obrigado por compartilhar esse momento especial.'}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onSendMore}
            className="w-full py-3.5 px-6 bg-[#c9a84c] text-white rounded-xl font-medium
                       shadow-md shadow-[#c9a84c]/25 hover:bg-[#b8963e] transition-all
                       active:scale-[0.98]"
          >
            Enviar mais arquivos
          </button>
          <button
            onClick={onGoHome}
            className="w-full py-3.5 px-6 bg-white text-[#555] rounded-xl font-medium
                       border border-[#e0d5c1] hover:bg-[#f8f5f0] transition-all
                       active:scale-[0.98]"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    </div>
  );
}
