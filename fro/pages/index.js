import Head from 'next/head'
import Link from 'next/link'
import {useState} from "react"
import {useRouter} from "next/router"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExternalLinkAlt} from "@fortawesome/free-solid-svg-icons/faExternalLinkAlt";

export default function Home({connection}) {
    const router = useRouter();

    const [formText, setFormText] = useState("子曰：「學而時習之，不亦說乎？有朋自遠方來，不亦樂乎？人不知而不慍，不亦君子乎？」");

    async function onSubmit() {
        await router.push(`/?t=${formText}`)
    }

    async function onTextInput(e) {
        setFormText(e.target.value)
    }

    return (
        <div className={`flex flex-col items-center justify-center my-5 md:my-20 mx-4`}>
            <Head>
                <title>Old Chinese Reconstructions!</title>
            </Head>
            <div className={`m-auto max-w-7xl flex flex-col items-center justify-keft text-xl max-w-4xl`}>
                <h1 className={`font-bold text-4xl my-4`}>Traditional Chinese to Ancient Pronunciation</h1>
                <p className={`max-w-2xl`}>
                    Enter <Link href={"https://ctext.org"} passHref><a className={`underline`}>any ancient Chinese text
                    fragment <FontAwesomeIcon icon={faExternalLinkAlt}/></a></Link>.
                    This app will convert it to a pronunciation
                    system as reconstructed by <Link href={"https://en.wikipedia.org/wiki/Old_Chinese_phonology"}
                                                     passHref><a className={`underline`}>Zhengzhang
                    Shangfeng <FontAwesomeIcon icon={faExternalLinkAlt}/></a></Link>.
                </p>
                <form className={`flex flex-col gap-4 my-4 w-max`} onSubmit={onSubmit}>
                    <label className={`w-max`}>
                        <textarea value={formText} onChange={onTextInput} placeholder={"Chinese Text"}
                                  className={`h-auto`} rows={5}>
                        </textarea>
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
