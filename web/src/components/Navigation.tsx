import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Icon, type IconName } from './Icon'
import { IconButton } from './Button'
import { Brand } from './Logo'
import { MountainSilhouette } from './MountainSilhouette'
import './Navigation.css'

type Item = { to: string; label: string; short?: string; icon: IconName; primary?: boolean }

// Same structure on mobile (BottomNav) and desktop (SideNav).
export const NAV_ITEMS: Item[] = [
  { to: '/', label: 'Søk', icon: 'search' },
  { to: '/spor', label: 'Spør', icon: 'chat' },
  { to: '/logg', label: 'Logg renn', icon: 'plus', primary: true },
  { to: '/tips', label: 'Andres erfaringer', short: 'Tips', icon: 'globe' },
  { to: '/utstyr', label: 'Utstyr', icon: 'bag' },
]

/** The results view belongs to «Søk», so its menu item stays marked there. */
const useErResultat = () => useLocation().pathname.startsWith('/resultater')

export function BottomNav() {
  const erResultat = useErResultat()
  return (
    <nav className="bottom-nav" aria-label="Hovedmeny">
      <ul>
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} end={item.to === '/'} className={({ isActive }) => `bottom-nav__link ${item.primary ? 'is-primary' : ''} ${isActive || (item.to === '/' && erResultat) ? 'active' : ''}`}>
              <span className="bottom-nav__icon"><Icon name={item.icon} size={item.primary ? 26 : 24} /></span>
              {item.primary ? (
                <span className="visually-hidden">{item.label}</span>
              ) : item.short ? (
                <>
                  <span className="bottom-nav__label" aria-hidden="true">{item.short}</span>
                  <span className="visually-hidden">{item.label}</span>
                </>
              ) : (
                <span className="bottom-nav__label">{item.label}</span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function SideNav() {
  const erResultat = useErResultat()
  return (
    <nav className="side-nav" aria-label="Hovedmeny">
      <Brand className="side-nav__brand" />
      <ul>
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} end={item.to === '/'} className={({ isActive }) => `side-nav__link ${item.primary ? 'is-primary' : ''} ${isActive || (item.to === '/' && erResultat) ? 'active' : ''}`}>
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
      <NavLink to="/innstillinger" className="side-nav__link side-nav__settings">
        <Icon name="settings" />
        <span>Innstillinger</span>
      </NavLink>
    </nav>
  )
}

type TopBarProps = {
  title: string
  actions?: ReactNode
  onSettings?: () => void
  /** Shows a back button (bordered ←) before the title. */
  onBack?: () => void
  /** Mountain silhouette behind the title: «Søk» and auth screens. */
  mountains?: boolean
  /** Show the logo and «Smøreappen» instead of the title (title stays as hidden h1). */
  brand?: boolean
}

export function TopBar({ title, actions, onSettings, onBack, mountains, brand }: TopBarProps) {
  return (
    <header className={`top-bar ${mountains ? 'top-bar--mountains' : ''}`}>
      {mountains && <div className="top-bar__bg"><MountainSilhouette /></div>}
      {onBack && <IconButton icon="arrowLeft" label="Tilbake" onClick={onBack} />}
      {brand ? (
        <>
          <Brand className="top-bar__brand" />
          <h1 className="visually-hidden">{title}</h1>
        </>
      ) : (
        <h1 className="top-bar__title">{title}</h1>
      )}
      <div className="top-bar__actions">
        {actions}
        {onSettings && <IconButton icon="settings" label="Innstillinger" bare className="top-bar__settings" onClick={onSettings} />}
      </div>
    </header>
  )
}

/**
 * Mobile: bottom navigation on main views; flows (forms, steps) are full
 * screen without it. Desktop (≥ 1024 px): fixed side menu always.
 */
export function AppShell({ children, flow }: { children: ReactNode; flow?: boolean }) {
  // «Søk» (the main page) shows the brand inside its mountain header instead.
  const hoved = useLocation().pathname === '/'
  return (
    <div className={`shell ${flow ? 'shell--flow' : ''}`}>
      <SideNav />
      <main className="shell__main" id="innhold">
        {!hoved && (
          <div className="brand-bar">
            <Brand />
          </div>
        )}
        {children}
      </main>
      {!flow && <BottomNav />}
    </div>
  )
}
