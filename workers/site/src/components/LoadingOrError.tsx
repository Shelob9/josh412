import { Loading } from 'react-daisyui';

export default function LoadingOrError({isLoading, isError,children}:{
    isLoading: boolean;
    isError: boolean;
    children: React.ReactNode;
}){
    if(isLoading){
        return <Loading/>
    }
    if(isError){
        return <div>Failed to load data</div>
    }
    return <>{children}</>
}
