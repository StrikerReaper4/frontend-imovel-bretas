import nossaHistoria from "../assets/nossa-historia.jpg";

function HistorySection() {
  return (
    <section className="mt-16 grid grid-cols-2 items-center gap-12 max-[900px]:grid-cols-1 max-[900px]:gap-8">
      <figure className="relative m-0"><span aria-hidden="true" className="absolute -bottom-4 -right-4 left-4 top-4 border border-gold/70" />
        <img
          src={nossaHistoria}
          alt="Fachada de um imóvel da carteira da Bretas Imóveis"
          loading="lazy"
          className="relative aspect-[4/3] w-full object-cover"
        />
      </figure>

      <div>
        <h2 className="display m-0 mb-4 text-[clamp(26px,3vw,40px)] text-ink">
          Nossa história
        </h2>
        <p className="m-0 max-w-[58ch] text-[15.5px] leading-relaxed text-muted">
          A Imóveis Bretas surgiu de uma ideia simples: facilitar, de maneira
          segura, a compra de imóveis no Brasil e no exterior. Para isso,
          montamos uma rede de contatos com corretores de vários países e
          passamos a ofertar casas, apartamentos e lugares únicos para quem
          procura beleza, conforto e a paz de ter um lar.
        </p>
      </div>
    </section>
  );
}

export default HistorySection;
