import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Rota inexistente — antes exibia tela em branco.
function NotFound() {
  return (
    <>
      <Header />
      <div className="bg-canvas flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-16">
        <h1 className="text-6xl font-extrabold text-navy mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-3">
          Página não encontrada
        </h2>
        <p className="text-gray-500 mb-8 max-w-md">
          O endereço que você acessou não existe ou foi movido.
        </p>
        <Link
          to="/"
          className="bg-navy text-white py-3 px-6 rounded-full font-semibold hover:bg-navy-dark transition-colors"
        >
          Ver imóveis disponíveis
        </Link>
      </div>
      <Footer />
    </>
  );
}

export default NotFound;
