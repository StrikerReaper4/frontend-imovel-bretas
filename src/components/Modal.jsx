import { MdClose } from "react-icons/md"
import { useState } from "react"

export default function Modal ({ propertyId,title,data, onClose }) {

    const handleClose = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }

    return(
        <>
            <div  className={`fixed inset-0 bg-black/60 flex items-center justify-center text-center z-50`} onClick={handleClose}>
                <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col w-[90%] max-w-lg relative">
                <div className="absolute top-4 right-4 justify-end cursor-pointer text-gray-500 hover:text-gray-900">
                    <MdClose size={26} onClick={handleClose} />
                </div>
                    <h2 className="text-2xl font-bold -mt-3 w-auto mb-1">{title}</h2>
                    {data}
                </div>
            </div>
        </>
    )
}

