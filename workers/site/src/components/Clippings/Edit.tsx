
import { Clipping } from "@app/types"
import { SubmitHandler, useForm } from "react-hook-form"

type Inputs = {
  url: string
}

export default function Edit({clipping}: {clipping: Clipping}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setFocus,
    defaultValues:clipping,
  } = useForm<Inputs>()
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    console.log(data)
    fetch(`/api/clippings/${clipping.uuid}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            text: data.text,
        }),
    })
        .then((res) => res.json())
        .then((res) => {
            console.log(res)
            if (res.err) {
                alert(res.err)
            } else {
                alert("Clipping created")
                setFocus("url")
            }
        })
  }
  return (
    <div>
       <h3>
            {clipping.uuid}
        </h3>
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
            <label>URL</label>
            <input disabled type="url" {...register('url') } />
            <label>Text</label>
            <textarea {...register("text")}/>
            <input type="submit" />
        </form>
        </div>
    </div>
  )
}
