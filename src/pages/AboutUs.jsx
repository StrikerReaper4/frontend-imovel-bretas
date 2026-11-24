import { useEffect } from "react";
import { FaHome, FaKey, FaDollarSign, FaRegCheckCircle, FaWhatsapp } from "react-icons/fa";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CardOption from "../components/CardOption";
import HistorySection from "../components/HistorySection";
import Button from "../components/Button";
import Revelar, { TituloLinhas } from "../components/Revelar";

const OPCOES = [
  {
    title: "Comprar",
    icon: <FaHome />,
    description:
      "Casas e apartamentos com boa localização, acabamento conferido e documentação em dia.",
  },
  {
    title: "Alugar",
    icon: <FaKey />,
    description:
      "Espaço, lazer e acomodação — para quem mora sozinho ou para a família inteira.",
  },
  {
    title: "Investir",
    icon: <FaDollarSign />,
    description:
      "Imóveis no exterior com apoio de corretor local, câmbio e documentação.",
  },
  {
    title: "Vender",
    icon: <FaRegCheckCircle />,
    description:
      "Avaliamos, anunciamos e acompanhamos a negociação até a escritura.",
  },
];

function AboutUs() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <>
      <Header />

      <main>
        <section className="grao relative isolate overflow-hidden bg-navy-dark py-20 max-[700px]:py-14">
          <div className="mx-auto w-full max-w-[1320px] px-6 max-[700px]:px-4">
            <Revelar as="p" className="etiqueta m-0 mb-6 flex flex-wrap items-center gap-3">
              Brasil
              <span aria-hidden="true" className="h-px w-5 bg-gold/60" />
              Estados Unidos
              <span aria-hidden="true" className="h-px w-5 bg-gold/60" />
              Portugal
            </Revelar>
            <h1 className="display m-0 max-w-[16ch] text-[clamp(34px,5.2vw,68px)] text-white">
              <TituloLinhas
                ordem={1}
                linhas={["Uma rede de corretores", "em três países."]}
              />
            </h1>
            <Revelar as="p" ordem={3} className="m-0 mt-6 max-w-[58ch] text-[clamp(15px,1.2vw,18px)] leading-relaxed text-white/65">
              A Bretas Imóveis nasceu para tirar o medo da compra à distância.
              Em cada praça onde atuamos existe alguém que conhece o bairro, a
              documentação e o preço justo.
            </Revelar>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1320px] px-6 py-14 max-[700px]:px-4 max-[700px]:py-10">
          <Revelar className="regua mb-10">
            <h2 className="display m-0 text-[clamp(26px,3.2vw,44px)] text-ink">
              Ideal para quem quer
            </h2>
          </Revelar>
          <div className="grid grid-cols-4 gap-px bg-line-strong max-[1020px]:grid-cols-2 max-[620px]:grid-cols-1">
            {OPCOES.map((o, i) => (
              <Revelar key={o.title} ordem={i} tipo="escala" className="h-full">
                <CardOption {...o} />
              </Revelar>
            ))}
          </div>

          <HistorySection />
        </section>

        <section className="mx-auto w-full max-w-[1320px] px-6 pb-16 max-[700px]:px-4 max-[700px]:pb-12">
          <div className="border-t border-line-strong pt-10 text-center">
            <h2 className="display m-0 mb-3 text-[clamp(26px,3.2vw,42px)] text-ink">
              Quer conversar antes de procurar?
            </h2>
            <p className="m-0 mx-auto mb-7 max-w-[50ch] text-muted">
              Mande uma mensagem contando o que você precisa. A gente responde
              pelo WhatsApp.
            </p>
            <Button
              label="Falar com a Bretas Imóveis"
              icon={<FaWhatsapp size={18} />}
              onClick={() =>
                window.open(
                  "https://wa.me/5567992609967",
                  "_blank",
                  "noopener noreferrer"
                )
              }
            />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default AboutUs;
