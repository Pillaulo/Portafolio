import { PROFILE } from '../data/cv'

/** Left cluster: identity chip + floating shortcut icons (above music deck). */
export function SideProfile() {
  return (
    <aside className="side-dock" aria-label="Perfil y accesos directos">
      <div className="side-chip">
        <div className="side-chip__bar">
          <span className="side-chip__led" aria-hidden />
          <span className="side-chip__sys">PORTFOLIO · GARAGE OS</span>
        </div>
        <h1 className="side-chip__name">{PROFILE.shortName}</h1>
        <p className="side-chip__role">{PROFILE.title}</p>
        <p className="side-chip__tag">
          IA, Desarrollo Fullstack, Machine Learning para análisis de datos y automatización.
        </p>
      </div>

      <div className="side-live" role="group" aria-labelledby="side-live-title">
        <p id="side-live-title" className="side-live__title">
          Proyectos en vivo
        </p>
        <div className="side-shortcuts" role="list">
          <a
            className="side-shortcut"
            href={PROFILE.garageOs}
            target="_blank"
            rel="noreferrer"
            role="listitem"
            title="Abrir Garage OS (web en vivo)"
          >
            <img src="/icons/garage-os.png" alt="" className="side-shortcut__img" />
            <span className="side-shortcut__caption">Garage OS</span>
          </a>

          <a
            className="side-shortcut"
            href={PROFILE.cuidadoVecinos}
            target="_blank"
            rel="noreferrer"
            role="listitem"
            title="Abrir Cuidado Vecinos (web en vivo)"
          >
            <img src="/icons/cuidado-vecinos.png" alt="" className="side-shortcut__img" />
            <span className="side-shortcut__caption">Cuidado Vecinos</span>
          </a>
        </div>
      </div>
    </aside>
  )
}
