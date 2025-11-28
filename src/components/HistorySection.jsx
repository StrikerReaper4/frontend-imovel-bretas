import { FaRegBuilding } from "react-icons/fa"; // ícone similar ao da imagem
import nossaHistoria from "../assets/nossa-historia.png";
function HistorySection() {
  return (
    <div className="flex flex-col md:flex-row items-center bg-white shadow-md rounded-lg p-6 mt-10">
      {/* Caixa da Imagem */}
      <div className="w-full md:w-1/2 flex justify-center mb-6 md:mb-0">
        <img
          src={nossaHistoria} // <- Coloque aqui o caminho da sua imagem
          alt="|Nossa História|"
          className="rounded-lg w-80 h-60 md:w-96 md:h-72 object-cover"
        />
      </div>

      {/* Texto */}
      <div className="w-full md:w-1/2 md:pl-8 text-center md:text-left">
        <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center justify-center md:justify-start gap-2">
          Nossa História <FaRegBuilding className="text-xl" />
        </h2>
        <p className="text-gray-700 leading-relaxed text-sm md:text-base">
          Surgida como uma ideia de facilitar de maneira segura a compra de
          imóveis no Brasil e Exterior, a empresa do mercado imobiliário Imóveis
          Bretas criou uma rede de contatos com corretores de diversos países, a
          fim de que possa atuar no mercado ofertando sempre, da melhor maneira
          possível, casas, apartamentos e lugares únicos para que seus
          compradores desfrutem da beleza, conforto e paz de se ter um lar.
        </p>
      </div>
    </div>
  );
}

export default HistorySection;
