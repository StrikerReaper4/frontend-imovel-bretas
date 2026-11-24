function CardOption({ title, icon, description }) {
  return (
    <div className="group flex h-full flex-col bg-canvas p-7 transition-colors duration-300 hover:bg-surface max-[700px]:p-5">
      <div className="mb-5 grid h-11 w-11 place-items-center rounded-[2px] border border-gold/60 text-[19px] text-gold-ink transition-colors duration-300 group-hover:bg-navy group-hover:text-gold">
        {icon}
      </div>
      <h3 className="display-med m-0 mb-2 text-[20px] text-ink">{title}</h3>
      <p className="m-0 text-[14.5px] leading-relaxed text-muted">
        {description}
      </p>
    </div>
  );
}

export default CardOption;
