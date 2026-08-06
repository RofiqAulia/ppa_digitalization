export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-xl border border-transparent bg-rose-600 px-6 py-3 text-sm font-black uppercase tracking-widest text-white shadow-md transition-all duration-300 ease-in-out hover:bg-rose-700 hover:shadow-lg focus:bg-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-200 active:scale-95 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
