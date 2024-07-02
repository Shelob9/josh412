export default function TableHeader({
    headers,
    allSelected,
    toggleSelectAll,
}: {
    headers: string[]
    allSelected: boolean
    toggleSelectAll: () => void
}) {
    return (
        <thead>
            <tr>
                <th>
                    <label>
                        <input
                            type="checkbox"
                            className="checkbox"
                            checked={allSelected}
                            onChange={toggleSelectAll}
                        />
                    </label>
                </th>
                {headers.map((header) => (
                    <th key={header}>
                        {`${header
                            .substring(0, 1)
                            .toLocaleUpperCase()}${header.substring(1)}`}
                    </th>
                ))}
                <th></th>
            </tr>
        </thead>
    )
}
