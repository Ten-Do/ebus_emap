import { Link, useLocation } from 'react-router-dom'
import { PAGES } from '../../router/pages.js'
import styles from './styles.module.css'

import RoutSVG from '../../assets/icons/navbar/rout.svg?react'
import PointSVG from '../../assets/icons/navbar/nb_point.svg?react'

export const Navbar = () => {
  const location = useLocation()

  return (
    <div className={styles.container}>
        <Link to={PAGES.routes}>
          <div
            className={
              styles.link + (location.pathname.startsWith(PAGES.routes) ? ' ' + styles.active : '')
            }
          >
            <RoutSVG />
          </div>
        </Link>
        <Link to={PAGES.stops}>
          <div
            className={
              styles.link + (location.pathname.startsWith(PAGES.stops) ? ' ' + styles.active : '')
            }
          >
            <PointSVG />
          </div>
        </Link>
    </div>
  )
}
