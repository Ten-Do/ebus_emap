import { useEffect, useState } from 'react'
import { useMapglContext } from '../../components/map2gis/MapglContext.js'
import styles from './styles.module.css'
import { Clusterer } from '@2gis/mapgl-clusterer'
import { useKeycloak } from '@react-keycloak/web'
import $api from '../../http/api.ts'
import { IRout } from '../../types/rout.ts'
import { decodePath } from '../../utils/decodeRout.ts'
const foo = (stations: {
  ID: number
  Name: string
  Lat: number
  Lon: number
  Routes: any
}[], station_name: string) => {
  for (let i = 0; i < stations.length; i++) {
    if (stations[i].Name === station_name) return true
  } return false
}
export const RoutesPage = () => {
  const { mapglInstance } = useMapglContext()
  const { keycloak } = useKeycloak()
  const [routes, setRoutes] = useState<IRout[]>([])
  const [route, setRoute] = useState<IRout | null>(null)

  useEffect(() => {
    $api
      .get('bus', 'route/', keycloak.token!)
      .then(data => data.data)
      .then(data => {
        setRoutes(data.Routes)
      })
  }, [])

  useEffect(() => {
    if (!route || !mapglInstance) return
    const clusterer = new Clusterer(mapglInstance, {
      radius: 10,
    })
    const polyline = new mapgl.Polyline(mapglInstance, {
      coordinates: decodePath(route.Path),
      width: 5,
      color: '#0029ff',
    })
    fetch('../../../public/bus_stop_points.json')
      .then(res => res.json())
      .then(data => clusterer!.load(data.filter(stop => foo(route.Stations, stop.userData))))

    return () => {
      clusterer && clusterer.destroy()
      polyline && polyline.destroy()
    }
  }, [route])


  return (
    <div className={styles.input_container}
      onClick={e => e.stopPropagation()}>
      <label htmlFor={'rout'}>Выберите маршрут</label>
      <select onChange={(e) => setRoute(routes.filter(r => r.Number == e.target.value)[0])} className={styles.select} id={'rout'} name={'rout'} placeholder={'label'}>
        {routes.map(route => (
          <option key={route.Id} value={route.Number}>{route.Number}</option>
        ))}
      </select>
    </div>
  )
}                           