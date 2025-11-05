// CardOption.jsx

function CardOption({ title, icon, description }) {
  return (
    <>
      <div className="flex flex-col items-center justify-center p-6 bg-white shadow-md rounded-lg w-64 h-56 hover:shadow-lg transition">
        <div className="text-4xl mb-4">{icon}</div>
        <h2 className="text-lg font-bold text-yellow-700 mb-2">{title}</h2>
        <p className="text-center text-gray-600 text-sm">{description}</p>
      </div>
    </>
  );
}

export default CardOption;
