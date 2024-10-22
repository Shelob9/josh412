import { ReactNode } from "react";

type Headers = {
	key: string;
	label: ReactNode
}[]
type Rows = {
	key: string;
	data: {[key:string]: ReactNode}
}[]

export default function Table({
	headers,
	rows
}:{
	headers: Headers,
	rows: Rows
}) {
	return <table>
		<thead>
			<tr>
				<th scope="col">#</th>
				{headers.map(({key,label}) => (
					<th
						scope="col"
						key={key}
					>
						{label}
					</th>
				))}
			</tr>
		</thead>
		<tbody>
			{rows.map(({key,data},i) => {
				return(
					<tr key={key}>
						<th scope="row">{i+1}</th>
						<>
							{headers.map(({key}) => {
								return <td key={key}>
									{data[key] ? data[key] : ''}
								</td>
							})}
						</>
					</tr>
				)
			})}

		</tbody>
		<tfoot>
			<tr>
				<th scope="col">#</th>
					{headers.map(({key,label}) => (
						<td key={key} scope="col">
							{label}
						</td>
					))}
			</tr>
		</tfoot>
	</table>
}
