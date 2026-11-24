import {
  FaPhoneAlt,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaInstagram,
} from "react-icons/fa";
import { SiGmail } from "react-icons/si";
import { useNavigate } from "react-router-dom";

const DEVS = [
  "https://github.com/felipe27-dev",
  "https://github.com/StrikerReaper4",
  "https://github.com/sartho-dev",
];

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="grao relative isolate overflow-hidden border-t border-gold/40 bg-navy-deep text-white/65">
      <div className="mx-auto w-full max-w-[1320px] px-6 py-14 max-[700px]:px-4 max-[700px]:py-10">
        <div className="grid grid-cols-[1.5fr_1fr_1fr] gap-10 max-[760px]:grid-cols-1 max-[760px]:gap-8">
          <div>
            <img
              src="/logo-nobg.png"
              alt="Bretas Imóveis"
              className="mb-5 h-[60px] w-auto cursor-pointer"
              onClick={() => navigate("/")}
            />
            <p className="display m-0 mb-5 max-w-[14ch] text-[clamp(26px,3vw,40px)] text-white">
              Brasil, Estados Unidos e Portugal.
            </p>
            <p className="m-0 flex items-start gap-2 text-[15px]">
              <FaMapMarkerAlt className="mt-1 shrink-0 text-gold" />
              <span>
                Campo Grande — Mato Grosso do Sul, Brasil
                <br />
                CEP 79002-363
              </span>
            </p>
          </div>

          <nav aria-label="Rodapé">
            <h3 className="etiqueta m-0 mb-4">
              Navegue
            </h3>
            <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[15px]">
              <li>
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="cursor-pointer underline-offset-4 hover:text-gold hover:underline"
                >
                  Imóveis
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate("/about")}
                  className="cursor-pointer underline-offset-4 hover:text-gold hover:underline"
                >
                  Sobre nós
                </button>
              </li>
            </ul>
          </nav>

          <div>
            <h3 className="etiqueta m-0 mb-4">
              Fale conosco
            </h3>
            <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[15px]">
              <li>
                <a
                  href="tel:+5567992609967"
                  className="flex items-center gap-2 underline-offset-4 hover:text-gold hover:underline"
                >
                  <FaPhoneAlt className="text-gold" /> (67) 99260-9967
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/5567992609967"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 underline-offset-4 hover:text-gold hover:underline"
                >
                  <FaWhatsapp className="text-gold" /> WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="mailto:imoveisbretas@gmail.com"
                  className="flex items-center gap-2 underline-offset-4 hover:text-gold hover:underline"
                >
                  <SiGmail className="text-gold" /> imoveisbretas@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/imoveisbretas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 underline-offset-4 hover:text-gold hover:underline"
                >
                  <FaInstagram className="text-gold" /> @imoveisbretas
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-[13px] text-[#88a1b3]">
          <span>© Bretas Imóveis — todos os direitos reservados</span>
          <span className="flex items-center gap-3">
            Desenvolvido por
            {DEVS.map((url, i) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:text-gold hover:underline"
              >
                Dev {i + 1}
              </a>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}
