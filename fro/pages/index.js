import Head from 'next/head'
import {useState} from "react";
import {useRouter} from "next/router";

export default function Home({connection}) {
    const router = useRouter();

    const [formText, setFormText] = useState("");

    async function onSubmit(e) {
        e.preventDefault()
        await router.push(`/?t=${formText}`)
    }

    async function onTextInput(e) {
        setFormText(e.target.value)
    }

    return (
        <div>
            <Head>
                <title>Old Chinese Reconstructions!</title>
            </Head>
            <div>
                <form onSubmit={onSubmit}>
                    <label>
                        Your Chinese text:
                        <input type={"text"} value={formText} onChange={onTextInput}/>
                    </label>
                    <button type={"submit"}>Submit</button>
                </form>
                <p>
                    Connection:
                    {
                        typeof connection === "undefined" ||
                        !connection.hasOwnProperty("result") ||
                        connection.result === ""
                        ? "Not provided." : connection.result
                    }
                </p>
            </div>
        </div>
    )
}

export async function getServerSideProps(context) {
    const t = context.query.hasOwnProperty('t') ? context.query.t : "";
    console.log(`Query was ${t}`)
    const res = await fetch(`http://wkt:8080/t/${t}`)
    const js = await res.json().catch(() => {})
    return {
        props: {
            connection: js
        }
    }
}
