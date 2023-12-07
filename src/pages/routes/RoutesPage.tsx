import { useEffect, useState } from 'react'
import { useMapglContext } from '../../components/map2gis/MapglContext.js'
import styles from './styles.module.css'
import { Clusterer } from '@2gis/mapgl-clusterer'
import { useKeycloak } from '@react-keycloak/web'
import $api from '../../http/api.ts'
import { IRout } from '../../types/rout.ts'
import { decodePath } from '../../utils/decodeRout.ts'
import MaloSVG from './../../assets/icons/malo.svg?react'
import SredneSVG from './../../assets/icons/sredne.svg?react'
import MnogoSVG from './../../assets/icons/mnogo.svg?react'
import { renderToString } from 'react-dom/server'

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

const getsvg = (load: number): string => {
  if (load === 2) return renderToString(<MnogoSVG />)
  if (load === 1) return renderToString(<SredneSVG />)
  return renderToString(<MaloSVG />)
}

export const RoutesPage = () => {
  const { mapglInstance } = useMapglContext()
  const { keycloak } = useKeycloak()
  const [routes, setRoutes] = useState<IRout[]>([])
  const [route, setRoute] = useState<IRout | null>(null)
  const [routInterval, setRoutInterval] = useState(0)

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
    Promise.all([
      $api.delete('ai', 'passengers/' + route.Id, '').catch(() => 'goose'),
      fetch('../../../public/bus_stop_points.json')
        .then(res => res.json())
        .then(data => data.filter(stop => foo(route.Stations, stop.userData)))
    ])
      .then((data) => {
        return Promise.all(data[1].map((e, i) => {
          $api.post('ai', 'passengers/?route_id=' + route.Id + '&station_id=' + i, '', {})
        })).then(res => {
          return Promise.all(res.map((e, id) => $api.get('ai', 'passengers/station_load_status/' + id, '')))
        })
          .then((loadData) => {
            clusterer!.load(data[1].map((stop, i: number) => ({ ...stop, type: 'html', html: getsvg(loadData[i].data.load) })))
          })
      })

    $api.get('ai', 'schedule/' + route.Id, '').then(data => setRoutInterval(data.data.interval))
    return () => {
      clusterer && clusterer.destroy()
      polyline && polyline.destroy()
    }
  }, [route])



  return (
    <>
      <div className={styles.input_container}
        onClick={e => e.stopPropagation()}>
        <label htmlFor={'rout'}>Выберите маршрут</label>
        <select onChange={(e) => e.target.value && setRoute(routes.filter(r => r.Number == e.target.value)[0])} className={styles.select} id={'rout'} name={'rout'} placeholder={'label'}>
          <option key={'ads'} value={''}>{''}</option>
          {routes.map(route => (
            <option key={route.Id} value={route.Number}>{route.Number}</option>
          ))}
        </select>
      </div>
      {routInterval && <div className={styles.interval_container}><p>Интервал {routInterval} минут</p></div>}
    </>
  )
}

