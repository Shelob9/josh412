import React, { useState } from "react";

export type SupportedNetwork = 'mastodon' | 'twitter';
export type Account = {
    network: SupportedNetwork;
    instanceUrl: string;
    accountId: string;
    accountName: string;
    accountHandle: string;
    accountAvatarUrl: string;
    key: string;
}
export function AccountIconButton({
    account,
    enabled,
    toggleEnabled
}:{
    account: Account;
    enabled: boolean;
    toggleEnabled: () => void;
}) {
    const clickHandler = (e: {preventDefault: () => void }) => {
        e.preventDefault();
        toggleEnabled();
    }
    return(
        <button onClick={clickHandler}>
            <AccountIcon
                account={account}
                className={enabled ? 'border-black' : 'grayscale'}
            />
        </button>
    )
}

export function AccountIcon({
    account,
    className
}:{
    account: Account;
    className: string;
}) {

    return(
        <img
            className={`${className} inline-block h-10 w-10 rounded-full`}
            src={account.accountAvatarUrl}
            alt={`Avatar for ${account.accountName} on ${account.network}`}
        />
    )
}

const TEXTAREA_NAME = 'composer-text';
export function AccountIcons({ accounts,enabledAccounts, toggleEnabled}: {
    enabledAccounts: string[];
    toggleEnabled: (key: string) => void;
    accounts: Account[];
}){
    return(
        <div className="m-2 w-10 py-1">
            {accounts.map(account => (
                <AccountIconButton
                    key={account.key}
                    account={account}
                    enabled={enabledAccounts.includes(account.key)}
                    toggleEnabled={() => toggleEnabled(account.key)}
                />
            ))}
        </div>
    )
}

const AddImageButton = ({onClick}:{
    onClick: () => void;
}) => {
    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                onClick();
            }}
            className="mt-1 group flex items-center text-blue-400 px-2 py-2 text-base leading-6 font-medium rounded-full hover:bg-blue-800 hover:text-blue-300">
            <svg className="text-center h-7 w-6" fill="none" stroke-linecap="round" stroke-linejoin="round" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        </button>
    );
}
const UPLOAD_ID = 'imgupload';
export default function Composer({accounts, onPublish}: {
    accounts: Account[];
    onPublish: (text: string,enabledAccounts:Account[] ) => void;
}){
    const [enabledAccounts, setEnabledAccounts] = useState<string[]>([]);
    function toggleEnabled(key:string) {
        if(enabledAccounts.includes(key)){
            setEnabledAccounts(enabledAccounts.filter(k => k !== key));
        }else{
            setEnabledAccounts([...enabledAccounts, key]);
        }
    }
    function handler(e:React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const _enabledAccounts : Account[] = accounts.filter(account => enabledAccounts.includes(account.key));
        console.log({_enabledAccounts});
        //get value of textarea with name TEXTAREA_NAME
        const text = e.currentTarget.elements.namedItem(TEXTAREA_NAME) as HTMLInputElement;
        onPublish(text.value, _enabledAccounts);
    }

    function handleImageBtnClick() {
        const input = document.getElementById(UPLOAD_ID) as HTMLInputElement;
        if( input ){
            input.click();
        }
    }
    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if(files){
            console.log({files});
            if( files.length > 0 ){
                const file = files[0];
                fetch('/api/upload', {
                    method: 'POST',
                    body: files[0],
                    headers: {
                        "content-type": file.type
                    }
                }).then(res => {
                    console.log({res});
                })
            }
        }
    }
    return(
        <form
            onSubmit={handler}
            className={`border-2 border-gray`}
        >
            <input
                accept="image/png, image/jpeg"
                type="file"
                id={UPLOAD_ID}
                style={
                    {display: 'none',visibility: 'hidden'}
                }
                onChange={handleFileChange}
            />
            <div className="flex ">
                    <AccountIcons
                        enabledAccounts={enabledAccounts}
                        toggleEnabled={toggleEnabled}
                        accounts={accounts}
                    />

                    <div className="flex-1 px-2 pt-2 mt-2">
                        <textarea
                            className="p-2 placeholder-gray-700::placeholder bg-transparent text-gray-900 font-medium text-lg w-full"
                            rows={2} cols={50} placeholder="What's happening?"
                            name={TEXTAREA_NAME}
                        ></textarea>
                    </div>
                </div>
                <div className="flex">
                    <div className="w-10"></div>
                    <div className="w-64 px-2">

                        <div className="flex items-center">
                            <div className="flex-1 text-center px-1 py-1 m-2 composer-insert-image">
                                <AddImageButton onClick={handleImageBtnClick} />
                            </div>
                            <div className="flex-1 text-center py-2 m-2 composer-insert-emoji">
                                <a className="mt-1 group flex items-center text-blue-400 px-2 py-2 text-base leading-6 font-medium rounded-full hover:bg-blue-800 hover:text-blue-300" target="_blank">
                                <svg className="text-center h-7 w-6" fill="none" stroke-linecap="round" stroke-linejoin="round" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24"><path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </a>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1">
                        <button className="bg-blue-400 mt-5 hover:bg-blue-600 text-white font-bold py-2 px-8 rounded-full mr-8 float-right">
                            Post
                        </button>
                    </div>
                </div>
        </form>
    )
}
