import { BskyAgent, RichText,AtpSessionEvent,AtpSessionData } from '@atproto/api'
interface Buffer extends Uint8Array {
}
export interface Attatchment {
    file: Buffer;
    description: string;
    encoding: "image/jpg"| "image/png";

}
export type Attatchments = Attatchment[];

export async function tryBskyLogin({ service, identifier, password,kv }: {
    service?: string,
    identifier: string,
    password: string,
    kv: KVNamespace,
  }) {
      service = service ?? 'https://bsky.social';
      // Hash for persistent key
      // Prevents using persited session without password
      // Or for a different service
      const digest = await crypto.subtle.digest(
          {
            name: 'SHA-256',
          },
          new TextEncoder().encode(`${service.slice(
              'https://'.length,
          )}${identifier}${password}`)
      );


      const saveKey = `at-savedsession_3:${new Uint8Array(digest).toString()}`;
      const agent = new BskyAgent({
          service: service ?? 'https://bsky.social',
          persistSession: (evt: AtpSessionEvent, sess?: AtpSessionData) => {
              if( sess && ! ['created','updated'].includes(evt) ) {
                  kv.put(saveKey, JSON.stringify(sess), {
                      //expire in 1 hour
                      expirationTtl: 60 * 60,
                  });
              }else{
                  kv.delete(saveKey);
              }
          }
      });
      const tryLogin = async () => {
          await agent.login({
              identifier,
              password,
          });
      };
      let saved = await kv.get(saveKey);
      let resumed = false;

      if( saved ) {
          try {
              await agent.resumeSession(JSON.parse(saved));
              resumed = true;
          } catch (error) {
              kv.delete(saveKey);
              await tryLogin();
          }

      }else{
          await tryLogin();
      }
      return {agent,resumed};
  }

export async function getBskyLikes({agent,actor,limit,cursor}:{
    actor:string;
    agent: BskyAgent;
    limit?: number;
    cursor?: string;
}) {
    const likes = await agent.getActorLikes({
        actor,
        limit,
        cursor,
    });
    if( ! likes.data ) {
        throw new Error('no data');
    }

    return {
        likesCursor: likes.data.cursor,
        likes: likes.data.feed,
    };
}
export async function postBsykyStatus({ text, agent, attatchments }: {
    text: string,
    agent: BskyAgent,
    attatchments?: Attatchments,
  }): Promise<{ uri: string; cid: string; }> {

    const rt = new RichText({ text });
    await rt.detectFacets(agent);
    const post: any = {
      $type: 'app.bsky.feed.post',
      text: rt.text,
      facets: rt.facets,
      createdAt: new Date().toISOString(),
    }
    if (attatchments && attatchments.length > 0) {

      const images = await Promise.all(attatchments.map(async ({ file, description, encoding }) => {
        const upload = await agent.uploadBlob(file, { encoding, });
        return {
          image: upload.data.blob,
          alt: description,
        };
      }));
      if( images.length > 0 ){
        post.embed = {
          images: images,
          $type: "app.bsky.embed.images",
        };
      }
    }

    const results = await agent.post(post);
    return {
        uri: results.uri,
        cid: results.cid,
    };
  }
