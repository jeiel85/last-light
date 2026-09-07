import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonTone = 'default' | 'primary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: ButtonTone;
  size?: ButtonSize;
  block?: boolean;
  children: ReactNode;
}

export function Button({
  tone = 'default',
  size = 'md',
  block = false,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const classes = ['btn', `btn-${tone}`, `btn-${size}`, block ? 'btn-block' : '', className]
    .filter(Boolean)
    .join(' ');
  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}
