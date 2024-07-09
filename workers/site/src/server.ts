import { PrismaD1 } from '@prisma/adapter-d1'
import { PrismaClient } from '@prisma/client'

export interface Env {
  DB: D1Database
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const adapter = new PrismaD1(env.DB)
    const prisma = new PrismaClient({ adapter })
    let taco = await prisma.user.findFirst({
      where: { email: 'taco2@taco.com' }
    });
    console.log({taco});

    if( ! taco  ) {
      const created =  await prisma.user.create({ data: { email: 'taco2@taco.com' } })
      console.log({ created })
      taco = created

    }
    const users = await prisma.user.findMany()
    const result = JSON.stringify({users,taco})
    return new Response(result)
  },
}
