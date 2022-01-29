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
        <div className={`flex flex-col items-center justify-center my-20 mx-4`}>
            <Head>
                <title>Old Chinese Reconstructions!</title>
            </Head>
            <div className={`m-auto max-w-7xl flex flex-col items-center justify-keft text-xl`}>
                <h1 className={`font-bold text-4xl my-4`}>Traditional Chinese to Ancient Pronunciation</h1>
                <form className={`m-auto flex flex-col gap-4 my-4`} onSubmit={onSubmit}>
                    <label>
                        <textarea value={formText} onChange={onTextInput}
                                  placeholder={"Your Chinese Text"}/>
                    </label>
                    <button
                        className={`flex flex-grow-0 flex-shrink-1 items-center justify-center w-fit m-auto px-6 py-2 border-black border-2 rounded-md hover:bg-gray-200 transition-all`}
                        type={"submit"}>
                        <span className={`border-b-2 border-black`}>Submit</span>
                    </button>
                </form>
                <p>
                    IPA (Zhengzhang; Wiktionary):
                    <br/>
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
    try {
        const res = await fetch(`http://wkt:8080/t/${t}`)
        const js = await res.json().catch(() => {
        })
        return {
            props: {
                connection: js
            }
        }
    } catch (e) {
        return {
            props: {
                connection: {}
            }
        }
    }
}
