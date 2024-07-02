import { useMastodon } from "@app/hooks/useMastodon";
import { Account, Status } from "@app/types/mastodon";
import { useMemo } from "react";
import LoadingOrError from "../LoadingOrError";
import Table from "../Table";
import { Table_Row } from "../Table/Tbody";
import { Td_Avatar_Props } from "../Table/Tr";
import StatusContent from "./Status/StatusContent";
import { Status_Images } from "./Status/StatusImages";

function accountToAvatarProps(account:Account) :Td_Avatar_Props {
    return {
        src: account.avatar,
        alt: `${account.display_name}'s avatar`,
        textTop: account.display_name,
        textBottom: account.acct,
        href: account.url
    }
}
export default function Mastodon({name,id}:{
    name: string;
    id:string;

}) {
    const {canNext,loadNext,canPrev,loadPrev, data, isLoading,isError} = useMastodon({name,accountId:id});
    const headers = ["Poster", "Content","URL"];
    const rows = useMemo<Table_Row[]>(() => {
        if(! data){
            return [];
        }
        return data.map((status:Status):Table_Row => {
            const images : Status_Images = status.media_attachments ? status.media_attachments.map((attachment) => {
                if( 'image' !== attachment.type){
                    return;
                }
                return {
                    id: attachment.id,
                    url: attachment.url,
                    alt: attachment.description,
                    type: attachment.type
                }
            }).filter((attachment) => attachment !== null) : [];
            return {
                key: status.id,
                avatar: accountToAvatarProps(status.account),
                data: [
                    {
                        key: "content",
                        children: <StatusContent {...{
                            content: status.content,
                            network: 'mastodon',
                            images,
                            contextType: 'timeline'
                        }} />
                    },
                    {
                        key: "url",
                        children: status.url
                    }
                ]
            }
        })
    },[data]);

    console.log({data, isLoading,isError})
    return <LoadingOrError isLoading={isLoading} isError={isError}>
        {data ? (
            <Table
                rows={rows}
                headers={headers}
                title={`Mastodon timeline for ${name}`}
            />
        ) :0}
        <div>
            {canPrev && <button onClick={loadPrev}>Prev</button>}
            {canNext && <button onClick={loadNext}>Next</button>}
        </div>
    </LoadingOrError>
}
