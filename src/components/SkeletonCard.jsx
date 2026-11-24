// Espelha a ficha do imóvel para o layout não pular ao carregar.
export default function SkeletonCard() {
  return (
    <div className="flex animate-pulse flex-col border-t border-line-strong">
      <div className="aspect-[4/3] w-full bg-line/70" />
      <div className="flex flex-col gap-3 pt-4">
        <div className="h-7 w-2/5 bg-line/70" />
        <div className="h-4 w-4/5 bg-line/70" />
        <div className="h-3.5 w-3/5 bg-line/70" />
        <div className="mt-2 flex gap-4">
          <div className="h-4 w-9 bg-line/70" />
          <div className="h-4 w-9 bg-line/70" />
          <div className="h-4 w-9 bg-line/70" />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="h-4 w-28 bg-line/70" />
          <div className="h-10 w-10 bg-line/70" />
        </div>
      </div>
    </div>
  );
}
