import { Hono } from 'hono'
import { PropsWithChildren } from 'hono/jsx'

const app = new Hono()


function Layout({ title, children }: PropsWithChildren<{title:string}>) {
  return (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  )
}
const Top = ({messages,}:{
  messages: {key:string;value:string}[]
}) => {
  return (
    <Layout
      title={'Hello aHono!'}
    >
      <ul>
         {messages.map(({key,value}) => {
          return <li key={key}>{value}</li>
        })}

      </ul>
    </Layout>
  )
}

app.get('/', (c) => {
  const messages = [{
    key: '1',
    value: 'Hello, World',
  }, {
    key: '2',

    value: 'Hello, aHono',
  }]
  return c.html(<Top messages={messages} />)
})

export default app
