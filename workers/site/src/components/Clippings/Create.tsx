
import { SubmitHandler, useForm } from "react-hook-form"

type Inputs = {
  url: string
}

export default function Create() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setFocus,

  } = useForm<Inputs>()
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    console.log(data)
    fetch("/api/clippings", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
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
    <form onSubmit={handleSubmit(onSubmit)}>
        <label>URL</label>
        <input defaultValue="" type={"url"} {...register("url")} required />
        <label>Text</label>
        <textarea {...register("text")}/>
        <input type="submit" />
    </form>
  )
}
