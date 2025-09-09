import { clsx } from 'clsx';

const variantStyles = {
  primary: 'bg-gray-900 text-white hover:bg-black focus:ring-gray-900/20',
  secondary: 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 focus:ring-gray-900/20',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600/20',
};

const sizeStyles = {
  xs: 'rounded px-2 py-1 text-xs',
  sm: 'rounded px-2 py-1 text-sm',
  md: 'rounded-md px-3 py-2 text-sm',
  lg: 'rounded-md px-4 py-2 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-semibold outline-none transition-colors focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  );
}
