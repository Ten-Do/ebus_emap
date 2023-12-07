import { useEffect, useState } from 'react'
import { Table } from '../../components/table/AccidentTable.tsx'
import { IAccident } from '../../types/accident.ts'
import $api from '../../http/api.ts'
import { useKeycloak } from '@react-keycloak/web'
import { useMapglContext } from '../../components/map2gis/MapglContext.tsx'
import { MapPointerEvent } from '@2gis/mapgl/types/index.js'
import { Clusterer } from '@2gis/mapgl-clusterer'
import { BusMarker } from '../../UI/markers/Bus.tsx'
import AccidentSVG from '../../assets/icons/Accident.svg?react'
import { renderToString } from 'react-dom/server'
import { AccidentCard } from '../../components/cards/accident/AccidentCard.tsx'

export const AccidentsPage = () => {
  const { mapglInstance, mapgl } = useMapglContext()
  const { keycloak } = useKeycloak()
  const [accidents, setAccidents] = useState<IAccident[]>([])
  const [point, setPoint] = useState<{ coordinates: number[], userData: string } | null>(null)
  //fetch data
  useEffect(() => {
    if (!keycloak.token) return
    $api.get('accident', 'accident/', keycloak.token!).then(data => setAccidents(data.data.Accidents))
  }, [keycloak])


  useEffect(() => {
    if (!mapglInstance || !accidents) return
    const clusterer = new Clusterer(mapglInstance, {
      radius: 10,
    })
    clusterer.on('click', ({ target }) =>
      setPoint(
        { coordinates: target.data.coordinates, userData: target.data.userData },
      ),
    )
console.log(accidents.map(accident => ({ coordinates: [accident.Lat, accident.Lon], userData: accident.Name, type: 'html', html: renderToString(<AccidentSVG />) })));

    clusterer!.load(accidents.map(accident => ({ coordinates: [accident.Lat, accident.Lon], userData: accident.Name, html: renderToString(<AccidentSVG />) })))
    const clickHandler = (e: MapPointerEvent) => {
      setPoint({ coordinates: e.lngLat, userData: '' })
    }
    mapglInstance.on('click', clickHandler)
    return () => { mapglInstance.off('click', clickHandler); clusterer && clusterer.destroy() }

  }, [mapglInstance, accidents])

  useEffect(() => {
    if (!point) return
    const marker = new mapgl!.HtmlMarker(mapglInstance!, { ...point, html: renderToString(<AccidentSVG />) })
    return () => { marker && marker.destroy() }

  }, [point])
  return <div>
    <Table data={accidents} />
    {point && <AccidentCard token={keycloak.token!} close={() => {setPoint(null)}} coordinates={point?.coordinates} />}
  </div>
}

/**
 * 
 * табличка с инцедентами
 * добавить инцедент
 */