import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Icon, type IconName } from './Icon'
import './Button.css'

type Variant = 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'add'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: 'md' | 'lg'
  icon?: IconName
  block?: boolean
  children: ReactNode
}

/** Buttons start with a verb: «Lagre produkt», «Hent tips». */
export function Button({ variant = 'primary', size = 'md', icon, block, className, children, type = 'button', ...rest }: ButtonProps) {
  const cls = ['btn', `btn--${variant}`, `btn--${size}`, block ? 'btn--block' : '', className ?? ''].join(' ').trim()
  return (
    <button type={type} className={cls} {...rest}>
      {icon && <Icon name={icon} size={20} />}
      <span>{children}</span>
    </button>
  )
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: IconName
  /** Screen reader label; required because the button has no visible text. */
  label: string
  /** Without border, e.g. the settings icon on top of the mountains. */
  bare?: boolean
}

export function IconButton({ icon, label, bare, className, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button type={type} className={`icon-btn ${bare ? 'icon-btn--bare' : ''} ${className ?? ''}`.trim()} aria-label={label} title={label} {...rest}>
      <Icon name={icon} />
    </button>
  )
}

type FabProps = ButtonHTMLAttributes<HTMLButtonElement> & { label: string }

export function FloatingAddButton({ label, className, type = 'button', ...rest }: FabProps) {
  return (
    <button type={type} className={`fab ${className ?? ''}`.trim()} aria-label={label} {...rest}>
      <Icon name="plus" size={28} />
    </button>
  )
}
