import type { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}: ButtonProps) {
  const variantClass = styles[variant];
  const widthClass = fullWidth ? styles.fullWidth : '';
  
  return (
    <button 
      className={`${styles.button} ${variantClass} ${widthClass} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
}
