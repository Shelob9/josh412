
import React from 'react';
export function Td({id,children,className}){
	return (
		<td id={id} className={className ?? ''}>
			{children}
		</td>
	)
}
export function Th({id,children,className}:{
	id?:string,
	children:React.ReactNode,
	className?:string
}){
	return (
		<th id={id} className={`manage-column ${className}`}>
			{children}

		</th>
	)
}

export  function TablePagination({
	displayingNum,
	totalPages,
	currentPage,
	onClickNext,
	onClickPrev,
	hasNext,
	hasPrev,
	goToPage,
}:{
	goToPage:(page:number)=>void,
	displayingNum:number,
	currentPage:number,
	totalPages:number,
	onClickNext:()=>void,
	onClickPrev:()=>void,
	hasNext:boolean,
	hasPrev:boolean
}){

	const handleClickNext = () => {
		if( hasNext ){
			onClickNext();
		}
	}
	const handleClickPrev = () => {
		if( hasPrev ){
			onClickPrev();
		}
	}
	return (
		<div className="tablenav bottom">

			<div className="alignleft actions bulkactions">
			</div>
			<div className="alignleft actions">
			</div>
			<div className="tablenav-pages">
				<span className="displaying-num">{displayingNum} items</span>
				<span className="pagination-links">
					<button
						disabled={currentPage === 1}
						className={`tablenav-pages-navspan button ${currentPage == 1 ? 'disabled':''}`} aria-hidden="true"
						onClick={() => goToPage(1)}
					>«</button>
					<button className={`tablenav-pages-navspan button ${hasPrev ? '':'disabled'}`} aria-hidden="true"
						onClick={() => handleClickPrev()}
					>
						‹
					</button>
					<span className="screen-reader-text">Current Page</span>
					<span id="table-paging" className="paging-input">
						<span className="tablenav-paging-text">{currentPage} of <span className="total-pages">{totalPages}</span></span>
					</span>
					<button
						className="next-page button"
						disabled={!hasNext}
						onClick={handleClickNext}
					>
						<span className="screen-reader-text">Next page</span>
						<span aria-hidden="true">›</span>
					</button>
					<button
						className={`last-page button ${currentPage === totalPages ? 'disabled':''}`}
						disabled={currentPage === totalPages}
						onClick={() => goToPage(totalPages)}
					>
						<span className="screen-reader-text">Last page</span>
						<span aria-hidden="true">»</span>
					</button>
				</span>
			</div>
			<br className="clear"/>
		</div>
	)
}
export default function Table({caption,headers,rows,footer}:{
	caption:string,
	headers:{
		id:string,
		children:React.ReactNode,
		className?:string
		primary?:boolean
	}[]
	rows: {
		key:string,
		cells: {
			key:string,
			Render: () =>React.ReactNode,
			className?:string
		}[]
	}[]
	footer?:React.ReactNode
}) {

	return (
		<table className="wp-list-table widefat fixed striped table-view-list">
			<caption className="screen-reader-text">{caption}</caption>
			<thead>
				<tr>
					<Td id="cb" className="manage-column column-cb check-column">
						<label htmlFor="cb-select-all-1">
							<span className="screen-reader-text">Select All</span>
						</label>
					</Td>
					{headers.map(({id,children,className,primary})=>(
						<Th key={id} id={id} className={`manage-column column-${id} ${className} ${primary ? 'primary primary-column':''}`}>
							{children}
						</Th>
					))}
				</tr>
			</thead>

			<tbody id="the-list">
				{rows.map((row) => (
					<tr key={row.key}>

					<Th className="check-column">
						<input id="cb-select-3675782" type="checkbox" name="post[]" value="3675782" />
						<label htmlFor="cb-select-3675782">
							<span className="screen-reader-text">
							Select				</span>
						</label>

					</Th>
					{row.cells.map(({key,Render,className})=>(
						<Td key={key} id={key} className={className}>
							<Render />
						</Td>
					))}
				</tr>)
				)}
			</tbody>
			{footer ?<tfoot>{footer}</tfoot>:null}
		</table>
	);
}
