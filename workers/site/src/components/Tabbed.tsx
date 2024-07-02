
export default function Tabbed({
    tabs,
    current,
    setCurrent
}:{
    current:string;
    setCurrent: (current:string) => void;
    tabs: {
        key: string;
        label: string;
        children: React.ReactNode;
    }[]
}){
    return <div>
            <div role="tablist" className="tabs tabs-bordered">
                {tabs.map(({key, children,label}) => (
                    <a role="tab" key={key}
                        className={`tab ${key===current ? 'tab-active' : ''}`}
                        onClick={() => setCurrent(key)}
                    >
                        {label}
                    </a>
                ))}

            </div>

            <div>

                {tabs.find(({key}) => key === current)?.children}
            </div>

    </div>
}
