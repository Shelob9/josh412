

export function isAuthed(cookie: string | null):boolean{
    if(! cookie ){
      return false;
    }
    return cookie.includes(`wordpress_logged`)
    || cookie.includes(`comment_`)
    || cookie.includes(`wordpress_sec`);
  }

const categories = [
    'music',
    'internet',
    'software',
    'dogs',
    'photos',
    'pittsburgh',
    'cats',
    'memes',
    'books',
    'time-and-space',
    'cats'
]
const allowed = {
    public: {
        is: [
            '/',
            '/wp-login.php',
        ],
        startsWith: [
            '/404',
            '/403',
            '/2024',
            '/blog',
            '/tag',
            ...categories.map( category => `/category/${category}`),
            ...categories.map( category => `/${category}/`),
        ],
    }
}

export function isAllowed(originalUrl:URL ){
    if( allowed.public.is.includes(originalUrl.pathname) ){
        return true
    }
    return allowed.public.startsWith.some(allowedPath => originalUrl.pathname.startsWith(allowedPath))

}
