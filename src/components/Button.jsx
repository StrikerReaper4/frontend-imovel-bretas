export default function Button({label, onClick, wid, disabled, className}) {
    const buttonWidth = wid === "full" ? "100%" : `${Math.min(wid, 340)}px`;
    return (
        <>
            <button 
                className={` bg-[#0f3e58] text-xl text-white font-semibold rounded-4xl cursor-pointer hover:bg-[#0d3246]  transition w-full disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
                style={{width: buttonWidth,}}
                onClick={onClick}
                disabled={disabled}
            >
                {label}
            </button>
        </>
    )
}