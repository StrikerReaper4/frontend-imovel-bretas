import Header from "../components/Header";
import FilterCard from "../components/FilterCard";
import Footer from "../components/Footer";
import CardProperty from "../components/CardProperty";
import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";
import {
  getImoveis,
  filterImoveis,
  deleteImovel,
  createImovel,
} from "../services/imovelService";
import Loading from "../components/Loading";

function Home() {
  const [showExtra, setShowExtra] = useState(false);
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // 👈 controle de carregamento

  const recieveFilterProperties = (items) => {
    console.log("Recebendo filtro", items);
    setProperties(items);
  };

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        const data = await getImoveis();

        // 🔒 Garante que o resultado sempre seja um array
        if (Array.isArray(data)) {
          setProperties(data);
        } else if (data && typeof data === "object") {
          setProperties([data]);
        } else {
          setProperties([]);
        }
      } catch (err) {
        console.error("Erro ao pegar imóveis:", err);
        setProperties([]); // evita travar o loading se a API falhar
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
  }, []);

  // Exibe o botão "Voltar aos Filtros" após rolar 500px
  const handleScroll = () => {
    const position = window.scrollY;
    setShowExtra(position > 500);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Função para rolar até o filtro
  const scrollToFilters = () => {
    setShowExtra(false);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // 👇 Estados de renderização com segurança
  if (isLoading) return <Loading />;

  if (!isLoading && properties.length === 0)
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">
            Nenhum imóvel encontrado
          </h2>
          <p className="text-gray-500 mb-8">
            Tente ajustar os filtros ou cadastrar um novo imóvel.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#80703c] text-white py-2 px-6 rounded-full font-bold shadow-md"
          >
            Recarregar Página
          </button>
        </div>
        <Footer />
      </>
    );

  return (
    <>
      <Header />

      {showExtra && (
        <div className="max-[710px]:flex hidden justify-center fixed top-4 z-50 w-full">
          <button
            onClick={scrollToFilters}
            className="bg-[#80703c] text-white text-center py-2 px-6 rounded-full font-bold shadow-md align-middle"
          >
            <FaArrowUp className="inline-block mr-2" />
            Voltar aos Filtros
          </button>
        </div>
      )}

      <div className="bg-[#F3F3F3] grid grid-cols-[400px_3fr] max-[870px]:grid-cols-1 p-4 pb-28">
        <div className="sticky top-4 self-start max-[870px]:static max-[710px]:mb-8">
          <FilterCard admin={false} onFilter={recieveFilterProperties} />
        </div>

        <div className="space-y-1 items-center justify-center text-center">
          <h2 className="text-3xl mb-4 title">Destaques</h2>
          <div className="flex flex-wrap gap-4 justify-center items-center ">
            {properties.map((property, index) => (
              <CardProperty key={index} property={property} />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Home;
