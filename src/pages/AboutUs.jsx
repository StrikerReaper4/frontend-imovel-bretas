import Header from "../components/Header";
import CardOption from "../components/CardOption";
import { FaHome, FaKey, FaDollarSign, FaRegCheckCircle } from "react-icons/fa";
import HistorySection from "../components/HistorySection";
import Footer from "../components/Footer";
import { useEffect } from "react";

function AboutUs() {
    useEffect(() => {
      window.scrollTo({top:0,behavior:"smooth"});
    }, []);
  return (
    <>
      <Header />
      <div className="flex flex-col items-center p-8 bg-[#F3F3F3]">
        <h1 className="text-2xl font-bold mb-8 text-blue-900">
          Ideal para quem quer:
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <CardOption
            title="Comprar"
            icon={<FaHome />}
            description="Vendemos casas com excelente acabamento, boa localização e um lar seguro."
          />
          <CardOption
            title="Alugar"
            icon={<FaKey />}
            description="Excelente espaço, lazer e acomodação, seja para um indivíduo ou para toda a família."
          />
          <CardOption
            title="Investir"
            icon={<FaDollarSign />}
            description="Também possuímos a opção de investir em um imóvel no exterior."
          />
          <CardOption
            title="Vender"
            icon={<FaRegCheckCircle />}
            description="Também ajudamos quem almeja vender um imóvel."
          />
        </div>
        <HistorySection />
      </div>
      <Footer />
    </>
  );
}
export default AboutUs;
