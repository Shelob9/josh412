import React from 'react';
export default function Images({images}:{
    images: {
        key: string,
        src: string,
        alt: string,
    }[]
}){
    return (
        <figure
			 className="flex-grid"

		>
			{images.map(({key,src,alt}) => (
                <img key={key} src={src} alt={alt} className="col" />
            ))}
		</figure>
    )
}
