import { MdClose } from "react-icons/md"

// closeOnBackdrop: por padrão o clique fora do card NÃO fecha o modal — evita
// que o admin perca o formulário (e as imagens) por um clique acidental.
// Para fechar, use o X no canto superior direito.
export default function Modal ({ title, data, onClose, closeOnBackdrop = false }) {

    const handleBackdropClick = (e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) {
            onClose();
        }
    }

    return(
        <>
            <div  className={`fixed inset-0 bg-black/60 flex items-center justify-center text-center z-50`} onMouseDown={handleBackdropClick}>
                <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col w-[90%] max-w-lg max-h-[90vh] overflow-y-auto relative">
                <button
                    type="button"
                    aria-label="Fechar"
                    title="Fechar"
                    onClick={onClose}
                    className="absolute top-3 right-3 p-1 rounded-full cursor-pointer text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition"
                >
                    <MdClose size={26} />
                </button>
                    <h2 className="text-2xl font-bold w-auto mb-1 px-8">{title}</h2>
                    {data}
                </div>
            </div>
        </>
    )
}
