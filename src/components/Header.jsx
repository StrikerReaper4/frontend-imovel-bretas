import { FaWhatsapp, FaInstagram, FaSun, FaMoon } from "react-icons/fa";
import { IoMenu, IoExitOutline } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { SiGmail } from "react-icons/si";
import { useState } from "react";
import { IoIosClose } from "react-icons/io";
import { isAdmin, logout } from "../utils/auth";

// Bandeiras clicáveis — o valor de `pais` precisa bater com o salvo no banco.
const FLAGS = [
  { pais: "Brasil", src: "/Bandeira_Brasil.png", alt: "Bandeira do Brasil" },
  { pais: "Estados Unidos", src: "/Bandeira_EUA.png", alt: "Bandeira dos Estados Unidos" },
  { pais: "Portugal", src: "/Bandeira_Portugal.png", alt: "Bandeira de Portugal" },
];

// adminActions: botões extras do painel (ex.: alterar senha, novo admin)
export default function Header({ admin, adminActions }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuStatus, setMenuStatus] = useState(false);
  const [searchParams] = useSearchParams();
  const activePais = location.pathname === "/" ? searchParams.get("pais") : null;
  const adminLogado = isAdmin();

  // Clicar na bandeira filtra por aquele país; clicar de novo remove o filtro.
  const filterByCountry = (pais) => {
    setMenuStatus(false);
    navigate(activePais === pais ? "/" : `/?pais=${encodeURIComponent(pais)}`);
  };

  const renderFlags = (size) =>
    FLAGS.map((f) => (
      <img
        key={f.pais}
        src={f.src}
        alt={f.alt}
        title={`Ver imóveis em ${f.pais}`}
        onClick={() => filterByCountry(f.pais)}
        style={{ width: size, height: size }}
        className={`rounded-full cursor-pointer transition hover:scale-110 ${
          activePais === f.pais ? "ring-4 ring-[#e3c668]" : activePais ? "opacity-60" : ""
        }`}
      />
    ));

  const loginButton = (
    <button
      type="button"
      onClick={() => navigate(adminLogado ? "/admin/logged" : "/login")}
      className="flex items-center gap-2 bg-white text-[#0f3e58] font-bold px-4 py-1.5 rounded-full hover:bg-[#e3c668] hover:text-white transition-colors cursor-pointer"
    >
      <FaUserCircle size={20} />
      {adminLogado ? "Painel" : "Entrar"}
    </button>
  );

  const redirectTo = (url) => {
    window.open(url, "_blank", "noopener noreferrer");
  };
  return (
    <>
      {!admin ? (
        <>
          <header className="flex max-[710px]:hidden justify-center w-full min-h-[150px] bg-[#0f3e58]">
            <div className="flex-0 ml-10 justify-start flex flex-col text-white items-center mt-8">
              <h1 className="font-controller text-3xl title">Contato</h1>
              <div className="pt-1 flex space-x-3 gap-4">
                <FaWhatsapp
                  size={35}
                  onClick={() => redirectTo("https://wa.me/5567992609967")}
                  className={"cursor-pointer"}
                />
                <SiGmail
                  size={35}
                  onClick={() =>
                    redirectTo(
                      "https://mail.google.com/mail/?view=cm&fs=1&to=imoveisbretas@gmail.com&su=Contato%20via%20site"
                    )
                  }
                  className="cursor-pointer"
                />
                <FaInstagram
                  size={35}
                  onClick={() =>
                    redirectTo(
                      "https://www.instagram.com/imoveisbretas?igsh=MWthM28xdTdwMTh1eg=="
                    )
                  }
                  className="cursor-pointer"
                />
              </div>
            </div>
            <div className="flex-7 flex justify-center flex-col items-center">
              <img
                src="/logo-nobg.png"
                className="w-[240px] h-[90px] cursor-pointer"
                alt="Logo do site"
                onClick={() => navigate("/")}
              />
              <nav className="mt-4 bg-white rounded-md flex justify-center">
                <ul className="flex space-x-6 gap-4 text-[#0f3e58] text-lg font-bold px-6">
                  <li
                    onClick={() => navigate("/")}
                    className={`hover:text-[#e3c668] cursor-pointer ${
                      location.pathname === "/" ? "text-[#a46e29]" : ""
                    }`}
                  >
                    Home
                  </li>
                  <li
                    onClick={() => navigate("/about")}
                    className={`hover:text-[#e3c668] cursor-pointer ${
                      location.pathname === "/about" ? "text-[#a46e29]" : ""
                    }`}
                  >
                    Sobre Nós
                  </li>
                </ul>
              </nav>
            </div>
            <div className="flex justify-end mt-4 flex-col space-y-4">
              <div className="flex justify-end mr-10">{loginButton}</div>
              <div className="flex space-x-3 gap-3 justify-end mr-10">
                {renderFlags(50)}
              </div>
              <div className="flex justify-end mr-10 mb-2">
                <h3 className="text-white font-bold">
                  ©Bretas Imóveis
                </h3>
              </div>
            </div>
          </header>
          <header className="hidden  max-[710px]:flex justify-between items-center w-full min-h-[150px] bg-[#0f3e58]">
            <div className="p-6 max-[480px]:p-3 flex justify-start min-w-0">
              <img
                src="/logo-nobg.png"
                className="w-[240px] h-[90px] max-[480px]:w-[150px] max-[480px]:h-auto cursor-pointer"
                alt="Logo do site"
                onClick={() => navigate("/")}
              />
            </div>
            <div className="flex justify-end items-center gap-3 pr-6 max-[480px]:pr-3 shrink-0">
              <button
                type="button"
                aria-label={adminLogado ? "Painel do admin" : "Entrar"}
                onClick={() => navigate(adminLogado ? "/admin/logged" : "/login")}
                className="text-white hover:text-[#e3c668] transition-colors cursor-pointer"
              >
                <FaUserCircle size={40} />
              </button>
              <button
                onClick={() => {
                  menuStatus ? setMenuStatus(false) : setMenuStatus(true);
                }}
                className="bg-white text-[#0f3e58] w-15 h-15 font-bold rounded-4xl hover:bg-[#e3c668] hover:text-white transition-colors duration-300 place-items-center cursor-pointer"
              >
                {menuStatus ? <IoIosClose size={50} /> : <IoMenu size={50} />}
              </button>
            </div>
            {/* Menu Dropdown */}
            {menuStatus && (
              <div className="absolute top-[100px] left-0 w-full bg-white z-50 shadow-md rounded-b-lg px-6 py-4 text-[#0f3e58]">
                <nav className="flex flex-col space-y-4 font-bold text-lg">
                  <button
                    onClick={() => {
                      navigate("/");
                    }}
                    className={`text-left ${
                      location.pathname === "/" ? "text-[#a46e29]" : ""
                    }`}
                  >
                    Home
                  </button>
                  <button
                    onClick={() => {
                      navigate("/about");
                    }}
                    className={`text-left ${
                      location.pathname === "/about" ? "text-[#a46e29]" : ""
                    }`}
                  >
                    Sobre Nós
                  </button>
                </nav>

                <hr className="my-4 border-[#0f3e58]/30" />

                <div className="flex flex-col space-y-2 text-[#0f3e58]">
                  <h2 className="font-controller text-xl mb-2">Contato</h2>
                  <div className="flex space-x-4">
                    <FaWhatsapp
                      size={40}
                      onClick={() => redirectTo("https://wa.me/5567992609967")}
                      className={"cursor-pointer"}
                    />
                    <SiGmail
                      size={40}
                      onClick={() =>
                        redirectTo(
                          "https://mail.google.com/mail/?view=cm&fs=1&to=imoveisbretas@gmail.com&su=Contato%20via%20site"
                        )
                      }
                      className="cursor-pointer"
                    />
                    <FaInstagram
                      size={40}
                      onClick={() =>
                        redirectTo(
                          "https://www.instagram.com/imoveisbretas?igsh=MWthM28xdTdwMTh1eg=="
                        )
                      }
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                <hr className="my-4 border-[#0f3e58]/30" />

                <div className="flex justify-start space-x-4 mt-2">
                  {renderFlags(40)}
                </div>
                <div className="mt-6 text-sm text-[#0f3e58] font-semibold">
                  ©Bretas Imóveis
                </div>
              </div>
            )}
          </header>
        </>
      ) : (
        <>
          <header className="flex items-center justify-between w-full min-h-[150px] bg-[#0f3e58]">
            <div className="p-8 justify-start">
              <img
                src="/logo-nobg.png"
                onClick={() => navigate("/")}
                className="w-[240px] h-[90px] cursor-pointer"
                alt="Logo do site"
              />
            </div>
            <div className="flex items-center justify-end flex-wrap gap-4 mr-8 mb-2">
            {adminActions?.map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={a.onClick}
                className="flex items-center gap-2 bg-white text-[#0f3e58] font-bold px-4 py-1.5 rounded-full hover:bg-[#e3c668] hover:text-white transition-colors cursor-pointer"
              >
                {a.icon}
                {a.label}
              </button>
            ))}
            <div
              className="flex gap-1 cursor-pointer align-middle"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              <IoExitOutline size={40} className="text-white" />
              <h3 className="text-white font-bold text-2xl mt-1.5 align-middle">
                Sair
              </h3>
            </div>
            </div>
          </header>
        </>
      )}
    </>
  );
}
