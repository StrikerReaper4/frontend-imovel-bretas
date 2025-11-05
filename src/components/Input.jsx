export default function Input({type, placeholder, label, wid, value, setValue, select,selectOptions,disabled, className, textarea, rows}) {  
    const inputWidth = wid === "full" ? "100%" : `${Math.min(wid, 340)}px`;
    const handleChange = (e) => {
        setValue(e.target.value);
    }
    return (
        <>
            <div className={`flex flex-col text-left ${className} min-w-[50px]`} style={{width: inputWidth}}>
                <label className="mb-0.5 font-semibold text-[#0f3e58] cursor-pointer" htmlFor={label}>{label}</label>
                {select ? (
                    <select
                        id={label}
                        className={`border border-gray-500 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-[#0f3e58] transition focus:shadow-lg ${className}`}
                        disabled={disabled}
                        value={value}
                        onChange={handleChange}
                    >
                        {selectOptions.map((option, index) => (
                            <option key={index} value={option}>{option}</option>
                        ))}
                    </select>
                ) : (
                    <>
                        {textarea ? (
                            <textarea
                                id={label}
                                placeholder={placeholder}
                                disabled={disabled}
                                rows={rows}
                                value={value}
                                onChange={handleChange}
                                className={`border border-gray-500 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-[#0f3e58] transition focus:shadow-lg ${className}`}
                            />
                        ) : (
                            <input
                                id={label}
                                type={type}
                                placeholder={placeholder}
                                onChange={handleChange}
                                value={value}
                                disabled={disabled}
                                className={`border border-gray-500 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-[#0f3e58] transition focus:shadow-lg ${className}`}
                            />
                        )}
                    </>
                )}

            </div>
        </>
    )
}