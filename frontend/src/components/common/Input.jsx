const Input = ({ label, error, icon: Icon, ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
          <Icon size={16} />
        </div>
      )}
      <input
        className={`input ${Icon ? 'pl-9' : ''} ${error ? 'border-red-400 focus:ring-red-400' : ''}`}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

export default Input;
