// Card cinza animado — aparece no lugar dos imóveis enquanto carrega
export default function SkeletonCard() {
  return (
    <div className="bg-white min-h-[400px] rounded-xl p-4 shadow-md text-left w-[360px] mb-4 animate-pulse">
      {/* Imagem */}
      <div className="w-full h-[170px] bg-gray-200 rounded-lg mb-3" />

      {/* Tipo */}
      <div className="h-3 bg-gray-200 rounded w-1/4 mb-2" />

      {/* Endereço */}
      <div className="flex items-center gap-2 mb-1">
        <div className="h-6 w-6 bg-gray-200 rounded-full flex-shrink-0" />
        <div className="h-5 bg-gray-200 rounded w-4/5" />
      </div>

      {/* Quartos / Banheiros / Vagas */}
      <div className="flex justify-between mt-3 mb-3">
        <div className="h-4 bg-gray-200 rounded w-[30%]" />
        <div className="h-4 bg-gray-200 rounded w-[30%]" />
        <div className="h-4 bg-gray-200 rounded w-[30%]" />
      </div>

      {/* Preço */}
      <div className="h-6 bg-gray-200 rounded w-2/5 mb-4" />

      {/* Botão Ver Detalhes */}
      <div className="h-10 bg-gray-200 rounded-lg w-full mb-2" />

      {/* Botão Entrar em Contato */}
      <div className="h-10 bg-gray-200 rounded-lg w-full" />
    </div>
  );
}
