const VARIANT_STYLES = {
  primary: 'bg-primary-600 hover:bg-primary-700',
  secondary: 'bg-transparent border border-primary-600',
  danger: 'bg-danger hover:bg-red-700',
};

const VARIANT_TEXT_STYLES = {
  primary: 'text-white',
  secondary: 'text-primary-600',
  danger: 'text-white',
};

export function Button({ title, onPress, variant = 'primary', loading = false, disabled = false, type = 'button' }) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onPress}
      disabled={isDisabled}
      className={`h-12 items-center justify-center rounded-xl flex flex-row ${VARIANT_STYLES[variant]} ${
        isDisabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <span className={`m-auto text-base font-semibold ${VARIANT_TEXT_STYLES[variant]}`}>
        {loading ? '…' : title}
      </span>
    </button>
  );
}
