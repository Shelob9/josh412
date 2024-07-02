export default async function getImageSize(file: File): Promise<{ width: number, height: number }> {
    return new Promise((resolve,) => {
        // @ts-ignore
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.onload = function () {
            resolve({
                //@ts-ignore
                width: this.width as number,
                //@ts-ignore
                height: this.height as number
            });
        };
        img.src = objectUrl;
    })

}
