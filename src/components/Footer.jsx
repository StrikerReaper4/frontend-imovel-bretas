import React from "react";
import {
  FaPhoneAlt,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaGithub,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <footer className="bg-[#0f3e58] text-white py-8">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        {/* Navegação */}
        <div>
          <h3 className="text-lg font-bold mb-4">Navegue no site</h3>
          <ul className="space-y-2">
            <li>
              <a
                onClick={() => {
                  navigate("/");
                }}
                className={`hover:underline cursor-pointer ${
                  location.pathname === "/"
                    ? "bg-white text-blue-900 px-3 py-1 rounded-lg font-semibold"
                    : ""
                }`}
              >
                Início
              </a>
            </li>
            <li>
              <a
                onClick={() => {
                  navigate("/about");
                }}
                className={`hover:underline cursor-pointer ${
                  location.pathname === "/about"
                    ? "bg-white text-blue-900 px-3 py-1 rounded-lg font-semibold"
                    : ""
                }`}
              >
                Sobre nós
              </a>
            </li>
          </ul>
        </div>

        {/* Endereço */}
        <div>
          <h3 className="text-lg font-bold mb-4">Endereço</h3>
          <p className="flex items-center justify-center md:justify-start gap-2">
            <FaMapMarkerAlt /> Campo Grande - MS - Brasil <br />
            CEP: 79002363-24
          </p>
        </div>

        {/* Contato */}
        <div>
          <h3 className="text-lg font-bold mb-4">Fale Conosco</h3>
          <p className="flex items-center justify-center md:justify-start gap-2">
            <FaPhoneAlt /> (67) 99260-9967
          </p>
          <p className="flex items-center justify-center md:justify-start gap-2 mt-4">
            <FaWhatsapp /> (67) 99260-9967
          </p>
        </div>
      </div>
      <div className="font-bold mt-8 text-center text-md justify-center">
        Desenvolvido por:
      </div>
      <div className="text-center flex items-center justify-center gap-4">
        <FaGithub
          size={30}
          className="text-white cursor-pointer block border-2 border-red-600 rounded-full"
          onClick={() =>
            window.open("https://github.com/felipe27-dev", "_blank")
          }
        />
        <FaGithub
          size={30}
          className="text-white cursor-pointer block border-2 border-green-600 rounded-full"
          onClick={() =>
            window.open("https://github.com/StrikerReaper4", "_blank")
          }
        />
        <FaGithub
          size={30}
          className="text-white  cursor-pointer block border-2 border-black rounded-full"
          onClick={() => window.open("https://github.com/sartho-dev", "_blank")}
        />
      </div>
      <img
        src="/cyber_castle_logo.jpg"
        className="justify-center mx-auto w-20 h-20 rounded-full border-2 border-white mt-2"
      />
      {/* Copyright */}
      <div className="text-center text-sm mt-6 border-t border-gray-300 pt-4">
        © 2025 Bretas Imóveis – Todos direitos reservados
      </div>
    </footer>
  );
}
