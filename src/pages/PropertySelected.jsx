import Header from "../components/Header";
import Footer from "../components/Footer";
import Button from "../components/Button";
import { useLocation } from "react-router-dom";
import { FaAngleLeft, FaAngleRight, FaBath, FaCarAlt } from "react-icons/fa";
import { IoIosBed } from "react-icons/io";
import { useState, useEffect } from "react";
import { getImoveis } from "../services/imovelService";
import Loading from "../components/Loading";

function PropertySelected() {
  const location = useLocation();
  const propertyId = location.pathname.split("/property/")[1];

  const [imageSelected, setImageSelected] = useState(0);
  const [properties, setProperties] = useState([]);
  const [property, setProperty] = useState(null); // null inicialmente

  const icons = [
    <IoIosBed size={55} className="inline-block ml-2" />,
    <FaBath size={55} className="inline-block ml-2" />,
    <FaCarAlt size={55} className="inline-block ml-2" />,
  ];

  // Buscar todos os imóveis
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await getImoveis();
        setProperties(data);
      } catch (err) {
        console.error("Erro ao pegar imóveis:", err);
      }
    };
    fetchProperties();
  }, []);

  // Atualizar imóvel selecionado quando properties estiver preenchido
  useEffect(() => {
    if (properties.length > 0) {
      const found = properties.find(
        (prop) => prop.ind === parseInt(propertyId)
      );
      setProperty(found || null);
    }
  }, [properties, propertyId]);

  // Troca automática de imagens
  useEffect(() => {
    if (!property?.img) return;
    const intervalo = setInterval(() => {
      setImageSelected((prev) =>
        prev === property.img.length - 1 ? 0 : prev + 1
      );
    }, 5000);
    return () => clearInterval(intervalo);
  }, [property]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const redirectToWhatsapp = () => {
    if (!property) return;
    const address = `${property.rua}, ${property.numero} - ${property.bairro}, ${property.cidade} / ${property.estado}`;
    const phoneNumber = "556784121913";
    const message = `Olá, gostaria de saber mais sobre o imóvel do endereço ${address} e do ID ${property.ind}`;
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener noreferrer"
    );
  };

  // Loading enquanto property não estiver carregado
  if (!property) return <Loading />;

  const address = `${property.rua}, ${property.numero} - ${property.bairro}, ${property.cidade} / ${property.estado}`;

  return (
    <>
      <Header />
      <div className="bg-[#F3F3F3] w-full min-h-96 p-4 pb-28 flex flex-col items-center justify-center text-center">
        <div className="bg-white w-full max-w-[1300px] rounded-2xl p-6 sm:p-8 shadow-md grid grid-cols-1 lg:grid-cols-2 gap-2">
          {/* Galeria de imagens */}
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="flex items-center justify-center gap-1 flex-wrap">
              <div
                className="bg-[#0f3e58] hidden lg:flex rounded-[100%] mb-2 p-2 justify-center items-center h-[45px] w-[50px] cursor-pointer hover:bg-[#14506e] transition"
                onClick={() =>
                  setImageSelected(
                    imageSelected === 0
                      ? (property.img?.length || 1) - 1
                      : imageSelected - 1
                  )
                }
              >
                <FaAngleLeft className="text-white" size={26} />
              </div>

              <img
                src={property.img?.[imageSelected] || "/placeholder_house.jpg"}
                className="w-full max-w-[500px] h-[250px] sm:h-[300px] md:h-[350px] rounded-lg object-cover"
                alt="Imagem do imóvel"
              />

              <div
                className="bg-[#0f3e58] hidden lg:flex lg:mt-2 rounded-[100%] justify-center p-2 items-center h-[45px] w-[50px] cursor-pointer hover:bg-[#14506e] transition"
                onClick={() =>
                  setImageSelected(
                    imageSelected === (property.img?.length || 1) - 1
                      ? 0
                      : imageSelected + 1
                  )
                }
              >
                <FaAngleRight className="text-white" size={26} />
              </div>
            </div>

            <div className="mt-2 flex justify-center items-center gap-2">
              {property.img?.map((item, index) => (
                <div
                  key={index}
                  className={`rounded-full h-4 w-4 cursor-pointer transition ${
                    index === imageSelected ? "bg-[#0f3e58]" : "bg-[#0f3e586c]"
                  }`}
                  onClick={() => setImageSelected(index)}
                ></div>
              ))}
            </div>
          </div>

          {/* Informações principais */}
          <div className="bg-[#0f3e58] text-left text-white rounded-2xl p-6 sm:p-8 shadow-md mx-auto flex flex-col max-w-[500px] h-[400px]">
            <span className="text-[#efd16e] font-bold text-md mt-2 block">
              {property.tipo}
            </span>
            <p className="text-xl sm:text-3xl font-bold mb-2">
              Endereço: {address}
            </p>
            <p className="text-3xl sm:text-4xl text-[#efd16e] font-extrabold mb-2">
              {property.valor?.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              }) || "R$ 0,00"}
            </p>
            <p className="text-base sm:text-lg mt-2">
              <strong>Descrição:</strong>{" "}
              {property.descricao ||
                "Este imóvel não possui uma descrição detalhada no momento."}
            </p>
            <Button
              label="Entrar em Contato"
              wid="full"
              className="p-2 mt-6 bg-[#c5ac5c] hover:bg-[#978b62] transition"
              onClick={redirectToWhatsapp}
            />
          </div>

          {/* Itens adicionais */}
          <div className="flex flex-wrap justify-center items-center gap-4 mt-4 w-full col-span-1 lg:col-span-2">
            {["quartos", "banheiros", "vagas"].map((key, index) => (
              <div
                key={index}
                className="bg-[#0f3e58] text-center text-white rounded-md p-2 sm:p-3 shadow-md w-[45%] sm:w-[30%] md:w-[22%] max-w-[140px] min-h-[100px] mt-4"
              >
                <h2 className="text-lg sm:text-2xl font-bold">
                  {key[0].toUpperCase() + key.slice(1)}
                </h2>
                <div className="grid grid-cols-2 gap-1 justify-center items-center text-center">
                  {icons[index]}
                  <span className="font-bold text-3xl sm:text-5xl inline-block">
                    {property[key]}
                  </span>
                </div>
              </div>
            ))}
            <div className="bg-[#0f3e58] text-center text-white rounded-md px-4 pt-2 pb-3 shadow-md w-[45%] sm:w-[30%] md:w-[22%] max-w-[180px] min-h-[100px] mt-4">
              <h2 className="text-lg sm:text-2xl font-bold">Área (m²)</h2>
              <span className="font-bold text-3xl sm:text-[40px]">
                {property.area}
              </span>
            </div>
          </div>

          {/* Mapa */}
          <div className="grid justify-center items-center w-full mt-6 col-span-1 lg:col-span-2 grid-cols-1">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 w-full text-center col-span-1 lg:col-span-2">
              Localização no Mapa
            </h2>
            <iframe
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                address
              )}&z=17&output=embed`}
              className="w-full h-[250px] sm:h-[300px] md:h-[350px] rounded-lg shadow-md"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default PropertySelected;
