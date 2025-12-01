import Header from "../components/Header";
import Footer from "../components/Footer";
import Button from "../components/Button";
import { useLocation } from "react-router-dom";
import { FaAngleLeft, FaAngleRight, FaBath, FaCarAlt } from "react-icons/fa";
import { IoIosBed } from "react-icons/io";
import { useState, useEffect, useRef } from "react";
import { getImoveis } from "../services/imovelService";
import Loading from "../components/Loading";

function PropertySelected() {
  const location = useLocation();
  const propertyId = location.pathname.split("/property/")[1];
  const intervalRef = useRef(null);

  function formatPrice(valor, pais) {
    const num = Number(valor) || 0;
    if (pais === "Brasil") {
      return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }
    if (pais === "Estados Unidos") {
      return num
        .toLocaleString("en-US", { style: "currency", currency: "USD" })
        .replace("$", "U$ ");
    }
    if (pais === "Portugal") {
      return num.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
    }
    return num.toLocaleString();
  }

  const [imageSelected, setImageSelected] = useState(0);
  const [properties, setProperties] = useState([]);
  const [property, setProperty] = useState(null);

  const icons = [
    <IoIosBed size={55} className="inline-block ml-2" />,
    <FaBath size={55} className="inline-block ml-2" />,
    <FaCarAlt size={55} className="inline-block ml-2" />,
  ];

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await getImoveis();
        setProperties(data);
      } catch (err) {}
    };
    fetchProperties();
  }, []);

  const stopImageChange = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (properties.length > 0) {
      const found = properties.find(
        (prop) => prop.ind === parseInt(propertyId)
      );
      setProperty(found || null);
    }
  }, [properties, propertyId]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!property?.imagem || property.imagem.length <= 1) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setImageSelected((prev) =>
        prev === property.imagem.length - 1 ? 0 : prev + 1
      );
    }, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [property]);

  if (!property) return <Loading />;

  let imagens = [];
  if (property.imagem && Array.isArray(property.imagem)) {
    imagens = property.imagem.map((img) => `data:image/jpeg;base64,${img}`);
  } else if (property.imagem) {
    imagens = [`data:image/jpeg;base64,${property.imagem}`];
  } else {
    imagens = ["/placeholder_house.jpg"];
  }

  const imageUrl = imagens[imageSelected];
  const address = `${property.rua}, ${property.bairro} ${property.cidade} ${property.estado}`;

  const redirectToWhatsapp = () => {
    const phoneNumber = "5567992609967";
    const message = `Olá, gostaria de saber mais sobre o imóvel do endereço ${address} e do ID ${property.ind}`;
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener noreferrer"
    );
  };

  return (
    <>
      <Header />
      <div className="bg-[#F3F3F3] w-full min-h-96 p-4 pb-28 flex flex-col items-center justify-center text-center">
        <div className="bg-white w-full max-w-[1300px] rounded-2xl p-6 sm:p-8 shadow-md grid grid-cols-1 lg:grid-cols-2 gap-2">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="flex items-center justify-center gap-1 flex-wrap">
              <div
                className="bg-[#0f3e58] hidden lg:flex rounded-full mb-2 p-2 justify-center items-center h-[45px] w-[50px] cursor-pointer hover:bg-[#14506e] transition"
                onClick={() =>
                  setImageSelected(
                    imageSelected === 0 ? imagens.length - 1 : imageSelected - 1
                  )
                }
              >
                <FaAngleLeft className="text-white" size={26} />
              </div>

              <img
                src={imageUrl}
                className="w-[500px] h-[250px] sm:h-[300px] md:h-[350px] rounded-lg object-cover cursor-pointer"
                alt="Imagem do imóvel"
                title="Clique para pausar a troca"
                onClick={() => {
                  stopImageChange();
                }}
              />

              <div
                className="bg-[#0f3e58] hidden lg:flex rounded-full p-2 justify-center items-center h-[45px] w-[50px] cursor-pointer hover:bg-[#14506e] transition"
                onClick={() =>
                  setImageSelected(
                    imageSelected === imagens.length - 1 ? 0 : imageSelected + 1
                  )
                }
              >
                <FaAngleRight className="text-white" size={26} />
              </div>
            </div>

            <div className="mt-2 flex justify-center items-center gap-2">
              {imagens.map((_, index) => (
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

          <div className="bg-[#0f3e58] text-left text-white rounded-2xl p-6 sm:p-8 shadow-md mx-auto flex flex-col max-w-[500px] h-[400px]">
            <span className="text-[#efd16e] font-bold text-md mt-2 block">
              {property.tipo}
            </span>
            <p className="text-xl sm:text-3xl font-bold mb-2">
              Endereço: {address}
            </p>
            <p className="text-3xl sm:text-4xl text-[#efd16e] font-extrabold mb-2">
              {formatPrice(property?.valor, property?.pais)}
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

          <div className="grid justify-center items-center w-full mt-6 col-span-1 lg:col-span-2 grid-cols-1">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 w-full text-center">
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
