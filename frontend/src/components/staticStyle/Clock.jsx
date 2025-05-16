import { useEffect, useState } from "react";
function Clock(){
    const [date,setDate] = useState("")
    const [day,setDay] = useState("")
    const [time,setTime] = useState("")
    useEffect(() => {
        const new_date = new Date();

        const date = (new_date.toLocaleString('tr-TR', { year: "numeric", month: "long", day: "numeric" }))
        const day = (new_date.toLocaleString('tr-TR', { weekday: "long" }))
        const time = (new_date.toLocaleTimeString('tr-TR', { hour: "numeric", minute: "numeric" }))
        setDate(date)
        setDay(day)
        setTime(time)

        setInterval(() => {
            const new_date = new Date();

            const date = (new_date.toLocaleString('tr-TR', { year: "numeric", month: "long", day: "numeric" }))
            const day = (new_date.toLocaleString('tr-TR', { weekday: "long" }))
            const time = (new_date.toLocaleTimeString('tr-TR', { hour: "numeric", minute: "numeric" }))
            setDate(date)
            setDay(day)
            setTime(time)

        }, 1000);
    }, [])
    return (
        <>
        <p> {date} {day} </p>
        <p> {time} </p></>
    )
}
export default Clock