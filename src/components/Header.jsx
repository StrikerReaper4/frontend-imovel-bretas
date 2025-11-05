import { FaWhatsapp, FaInstagram, FaSun, FaMoon } from "react-icons/fa";
import { IoMenu, IoExitOutline } from "react-icons/io5";
import { useNavigate, useLocation } from "react-router-dom";
import { SiGmail } from "react-icons/si";
import { useState } from "react";
import { IoIosClose } from "react-icons/io";
import { useTheme } from "next-themes";

export default function Header({ admin }) {
  const navigate = useNavigate();
  const location = useLocation();
  //const [atualTheme, setAtualTheme] = useState(localStorage.getItem("theme"));
  const [menuStatus, setMenuStatus] = useState(false);

  /*const changeTheme = () => {
    alert("Trocando tema:"+atualTheme);
    const opositeTheme = atualTheme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", opositeTheme);
    setAtualTheme(opositeTheme);
  };*/

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
            <div className="flex justify-end mt-8 flex-col space-y-8">
              <div className="pt-1 flex space-x-3 gap-3 justify-end mr-10">
                <img
                  src="/Bandeira_Brasil.png"
                  className="w-[50px] h-[50px] rounded-[100%]"
                  alt="Bandeira do Brasil"
                />
                <img
                  src="/Bandeira_EUA.png"
                  className="w-[50px] h-[50px] rounded-[100%]"
                  alt="Bandeira dos Estados Unidos"
                />
                <img
                  src="/Bandeira_Portugal.png"
                  className="w-[50px] h-[50px] rounded-[100%]"
                  alt="Bandeira do Reino Unido"
                />
                {/*<button id="trade-theme"  onClick={() => changeTheme()} className="bg-white text-[#0f3e58] w-[50px] h-[50px] font-bold rounded-full  hover:bg-[#e3c668] hover:text-white transition-colors duration-300 place-items-center cursor-pointer">
              {atualTheme === "dark" ? (
                <FaSun size={30} />
              ) : (
                <FaMoon size={30} />
              )}            
            </button>*/}
              </div>

              <div className="flex justify-end mr-10 mb-2">
                <h3 className="text-white font-bold">
                  © 2025 - Bretas Imóveis
                </h3>
              </div>
            </div>
          </header>
          <header className="hidden  max-[710px]:flex justify-center w-full min-h-[150px] bg-[#0f3e58]">
            <div className="p-8 flex justify-start">
              <img
                src="/logo-nobg.png"
                className="w-[240px] h-[90px] cursor-pointer"
                alt="Logo do site"
                onClick={() => navigate("/")}
              />
            </div>
            <div className="flex  justify-end">
              <button
                onClick={() => {
                  menuStatus ? setMenuStatus(false) : setMenuStatus(true);
                }}
                className="bg-white text-[#0f3e58] w-15 h-15 font-bold rounded-4xl m-8 hover:bg-[#e3c668] hover:text-white transition-colors duration-300 place-items-center cursor-pointer"
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
                  <img
                    src="/Bandeira_Brasil.png"
                    className="w-[40px] h-[40px] rounded-full"
                    alt="Brasil"
                  />
                  <img
                    src="/Bandeira_EUA.png"
                    className="w-[40px] h-[40px] rounded-full"
                    alt="EUA"
                  />
                  <img
                    src="/Bandeira_Portugal.png"
                    className="w-[40px] h-[40px] rounded-full"
                    alt="Portugal"
                  />
                </div>

                <div className="mt-6 text-sm text-[#0f3e58] font-semibold">
                  © 2025 - Bretas Imóveis
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
            <div
              className="flex justify-end mr-8 mb-2 gap-1 cursor-pointer align-middle"
              onClick={() => navigate("/")}
            >
              <IoExitOutline size={40} className="text-white" />
              <h3 className="text-white font-bold text-2xl mt-1.5 align-middle">
                Sair
              </h3>
            </div>
          </header>
        </>
      )}
    </>
  );
}
