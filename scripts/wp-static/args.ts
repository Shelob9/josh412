export type PathArgInput = string|{
    from:string;
    to:string;
}

export type PathArg = {
    from:string;
    to:string;
}
export type Paths = {
    tags:PathArg;
    categories:PathArg;
    posts:PathArg;
    authors:PathArg;
};
export type Args = {
    outputDir: string;
    baseUrl: string;
    paths:Paths;
    auth?:{
        username:string;
        password:string;
    }
};
