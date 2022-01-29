import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons/faExternalLinkAlt";

const defaultText = "子曰：「學而時習之，不亦說乎？有朋自遠方來，不亦樂乎？人不知而不慍，不亦君子乎？」";

export default function Home({ connection, orig }) {
    const router = useRouter();

    const [formText, setFormText] = useState(defaultText);
    const [tooLong, setTooLong] = useState(false);

    async function onSubmit(e) {
        if (formText.length < 512) { await router.push(`/?t=${formText}`) } else {
            e.preventDefault();
        }
    }

    async function onTextInput(e) {
        setFormText(e.target.value)
        setTooLong(e.target.value.length >= 512);
    }

    useEffect(() => {
        setFormText(orig ? orig : defaultText)
    }, [orig])

    return (
        <div className={`flex flex-col items-center justify-center my-5 md:my-20 mx-4`}>
            <Head>
                <title>Old Chinese Reconstructions!</title>
            </Head>
            <div className={`m-auto flex flex-col items-center justify-keft text-xl max-w-4xl`}>
                <h1 className={`font-bold text-4xl my-4`}>Traditional Chinese to Ancient Pronunciation</h1>
                <p className={`max-w-2xl`}>
                    Enter <Link href={"https://ctext.org/analects/xue-er"} passHref
                    ><a target="_blank" rel="noopener noreferrer" className={`underline`}
                    >any ancient Chinese text fragment <FontAwesomeIcon icon={faExternalLinkAlt} /></a></Link>.
                    This app will convert it to a pronunciation
                    system as reconstructed by <Link href={"https://en.wikipedia.org/wiki/Old_Chinese_phonology"}
                        passHref><a target="_blank" rel="noopener noreferrer" className={`underline`}
                        >Zhengzhang Shangfeng <FontAwesomeIcon icon={faExternalLinkAlt} /></a></Link>.
                </p>
                <p>The raw data is scraped from <Link href="https://en.wiktionary.org" passHref>
                    <a target="_blank" rel="noopener noreferrer" className={`underline`}>Wiktionary{" "}
                        <FontAwesomeIcon icon={faExternalLinkAlt} />
                    </a></Link>.</p>
                <form className={`flex flex-col gap-4 my-4 w-max items-center`} onSubmit={onSubmit}>
                    <label className={`w-max`}>
                        <textarea value={formText} onChange={onTextInput} placeholder={"Chinese Text"}
                            className={`h-auto ${tooLong ? "border-red-700 border-4" : ""}`} rows={5}>
                        </textarea>
                    </label>
                    <button
                        className={`flex flex-grow-0 flex-shrink-1 items-center justify-center w-fit m-auto px-6 py-2 border-black border-2 rounded-md hover:bg-gray-200 transition-all`}
                        type={"submit"}>
                        <span className={`border-b-2`}>Submit</span>
                    </button>
                    <p className={`${tooLong ? "text-red-700" : "hidden"}`}>Your text is too long!</p>
                </form>
                <p>IPA (Zhengzhang; Wiktionary):</p>
                <div className={`text-left my-4`}>
                    <p>
                        {
                            typeof connection === "undefined" ||
                                !connection.hasOwnProperty("result") ||
                                connection.result === ""
                                ? "Not provided." : connection.result
                        }
                    </p>
                    <p className={`italic font-light text-sm text-gray-700`}>
                        {
                            typeof orig === "undefined" ||
                                orig === ""
                                ? "Unknown input." : orig
                        }
                    </p></div>
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
                connection: js,
                orig: t,
            }
        }
    } catch (e) {
        return {
            props: {
                connection: {},
                orig: t,
            }
        }
    }
}
