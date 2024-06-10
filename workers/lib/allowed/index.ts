

export function isAuthed(cookie: string | null):boolean{
    if(! cookie ){
      return false;
    }
    return cookie.includes(`wordpress_logged`)
    || cookie.includes(`comment_`)
    || cookie.includes(`wordpress_sec`);
  }


const allowed = {
    public: {
        is: [
            '/',
            '/wp-login.php',
        ],
        startsWith: [
            '/2024',
            '/blog',
        ],
    }
}

export function isAllowed(originalUrl:URL ){
    if( allowed.public.is.includes(originalUrl.pathname) ){
        return true
    }
    return allowed.public.startsWith.some(allowedPath => originalUrl.pathname.startsWith(allowedPath))

}
