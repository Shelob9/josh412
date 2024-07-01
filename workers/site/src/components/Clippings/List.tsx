import { useClippings } from "@app/hooks/useClippings";
import { Clipping } from "@app/types";
import { useState } from "react";
import { Button, Loading } from 'react-daisyui';

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
    const [editId, setEditId] =  useState<string | null>(null);
    const isEditId = (id: string) => editId === id;
    const {data, isLoading,isError} = useClippings();
    return <LoadingOrError isLoading={isLoading} isError={isError}>
        {data ? <ul>
            {data.map((clipping: Clipping) => (
                <li key={clipping.uuid} className="border-2 border-primary">
                        <div >
                            {clipping.domain}/{clipping.path}
                        </div>
                        <div >
                            {isEditId(clipping.uuid) ? (
                                <label className="form-control">
                                <div className="label">
                                    <span className="label-text">Text</span>
                                </div>
                                <textarea className="textarea textarea-bordered h-24"defaultValue={clipping.text}></textarea>
                            </label>
                            ) : (<div className="form-control">
                                <div className="label">
                                    <span className="label-text">Text</span>
                                </div>
                                <span className="h-24">{clipping.text}</span>
                            </div>)}
                        </div>
                        <div>
                            <>
                                {isEditId(clipping.uuid) ? (
                                    <div className="flex flex-items gap-4">
                                        <Button color={'warning'} onClick={() => setEditId(null)}>Cancel</Button>
                                        <Button color={'primary'}onClick={() => setEditId(null)}>Save</Button>
                                    </div>
                                ) : (
                                    <Button onClick={() => setEditId(clipping.uuid)}>Edit</Button>
                                )}
                            </>
                        </div>
                </li>
            ))}
        </ul>: null}
    </LoadingOrError>
}
