import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Rota inexistente — antes exibia tela em branco.
function NotFound() {
  return (
    <>
      <Header />
      <div className="bg-[#F3F3F3] flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="text-6xl font-extrabold text-[#0f3e58] mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-3">
          Página não encontrada
        </h2>
        <p className="text-gray-500 mb-8 max-w-md">
          O endereço que você acessou não existe ou foi movido.
        </p>
        <Link
          to="/"
          className="bg-[#80703c] text-white py-2 px-6 rounded-full font-bold shadow-md hover:bg-[#6b5e33] transition"
        >
          Ver imóveis disponíveis
        </Link>
      </div>
      <Footer />
    </>
  );
}

export default NotFound;
