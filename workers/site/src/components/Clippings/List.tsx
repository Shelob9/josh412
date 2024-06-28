import { useClippings } from "@app/hooks/useClippings";
import { Clipping } from "@app/types";
import { Button, Loading, Stack } from 'react-daisyui';

function LoadingOrError({isLoading, isError,children}:{
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
export default function ClippingsList(){
    const [editId, setEditId] = React.useState<string | null>(null);
    const isEditId = (id: string) => editId === id;
    const {data, isLoading,isError} = useClippings();
    return <LoadingOrError isLoading={isLoading} isError={isError}>
        {data ? <ul>
            {data.map((clipping: Clipping) => (
                <Stack as="li" key={clipping.uuid}>
                        <div className="grid w-32 h-20 rounded bg-primary text-primary-content place-content-center">
                            {clipping.domain}/{clipping.path}
                        </div>
                        <div className="grid w-32 h-20 rounded bg-accent text-accent-content place-content-center">
                            {isEditId(clipping.uuid) ? (
                                <textarea defaultValue={clipping.text}></textarea>
                            ) : (<div>{clipping.text}</div>)}
                        </div>
                        <div className="grid w-32 h-20 rounded bg-secondary text-secondary-content place-content-center">
                            <>
                                {isEditId(clipping.uuid) ? (
                                    <Button onClick={() => setEditId(null)}>Cancel</Button>
                                ) : (
                                    <Button onClick={() => setEditId(clipping.uuid)}>Edit</Button>
                                )}
                            </>
                        </div>
                </Stack>
            ))}
        </ul>: null}
    </LoadingOrError>
}
