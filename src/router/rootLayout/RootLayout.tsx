import { Outlet } from 'react-router-dom'
import Map from '../../components/map2gis/Map.js'
import { MapglContextProvider } from '../../components/map2gis/MapglContext.js'
import { Navbar } from '../../components/navbar/Navbar.js'
import styles from './styles.module.css'

export const RootLayout = () => {
  return (
    <div className={styles.app}>
      <MapglContextProvider>
        <div className={styles.content}>
          <div className={styles.map_container}>
            <Map />
          </div>
          <Outlet />
        </div>
      </MapglContextProvider>
      <Navbar />
    </div>
  )
}
