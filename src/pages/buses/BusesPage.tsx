import { useKeycloak } from '@react-keycloak/web'
import { useEffect, useState } from 'react'
import { Table } from '../../components/table/BusTable.js'
import { Actions } from '../../components/tableActions/Actions.js'
import $api from '../../http/api.js'
import { IBus } from '../../types/bus.js'
import { IRout } from '../../types/rout.js'

export const BusesPage = () => {
  const { keycloak } = useKeycloak()
  const [buses, setBuses] = useState<IBus[]>([])
  const [routes, setRoutes] = useState<{ text: string; id: string }[]>([])
  useEffect(() => {
    Promise.all([
      $api.get('bus', 'bus/', keycloak.token!).then(data => data.data.buses as IBus[]),
      $api
        .get('bus', 'route/', keycloak.token!)
        .then(data => data.data.Routes.map((r: IRout) => ({ text: r.Number, id: r.Id }))),
    ]).then(data => {
      setBuses(data[0])
      setRoutes(data[1])
    })
  }, [])
  return (
    <div style={{ display: 'flex', gap: '22px', flexDirection: 'column' }}>
      <Actions
        button_text='Добавить автобус'
        action='bus/'
        formConfig={{
          number: { placeholder: 'Номер автобуса', label: 'Номер автобуса' },
          routeID: { options: routes, label: 'Маршрут' },
          status: {
            options: [
              { text: 'Не в работе', id: 'Не в работе' },
              { text: 'В работе', id: 'В работе' },
              { text: 'Зарядка', id: 'Зарядка' },
            ],
            label: 'Статус',
          },
        }}
      ></Actions>
      <Table data={buses} />
    </div>
  )
}
