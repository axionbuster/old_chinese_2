# WKT

This Go server implements two routers:

- `/w/:word`: The ones following the URL is considered to be a single Chinese character.
Its IPA as reconstructed by Zhengzhang is returned, if any.
- `/t/:text`: This one is a whole line or even the entirety of some text.
The IPA of each recognized character comes out.

## Format for the word (w) API

```json
{
    "v": "0.0.1",
    "k": true,
    "w": "筐",
    "bs": ["k-pʰaŋ"],
    "zh": ["kʰʷaŋ"]
}
```

The fields:

```go
type oldChinese struct {
	Version string   `json:"v"`
	Parse   bool     `json:"k"`
	Word    string   `json:"w"`
	Baxter  []string `json:"bs"`
	Zheng   []string `json:"zh"`
}
```

The JSON field `v` signifies the version of the API.
It is currently "0.0.1."

The JSON field `k` signifies whether the parsing was OK.
If it wasn't, then it means that the Wiktionary article was in an unexpected
format.

The JSON field `w` simply repeats what was received.

The JSON field `bs` returns any and all (0 or more) reconstructions of the
pronunciation of that character as reconstructed by Baxter and Sagart.

The JSON field `zh` returns such things by Zhengzhang.

All five fields are always present.

An array field (`bs` and `zh`) can be null, empty or filled, and independently
so from one another.

## Format for the Text (t) API

```json
{
    "v": "0.0.1",
    "result": "njin tjɯ qʰuːʔ* ŋaːlʔ 、ɢljils ŋaːlʔ tjɯw ɡraːŋ*"
}
```

```go
type textResponse struct {
	Version string `json:"v"`
	Result  string `json:"result"`
}
```

Unlike the words api, this one doesn't repeat your query.

The string in the "result" field:

1. Words that didn't return a Zhengzhang IPA reconstruction are printed
verbatim.
2. Words with exactly one Zhengzhang IPA reconstruction print that
reconstruction.
3. Words with more than one reconstruction print the first one found,
followed by an asterisk.

## Performance

1. Characters that haven't been seen---they can take up forever depending
on your Internet. Even those with good internet will need to spend about
300 ms per character.
2. Characters that have been seen in another reincarnation of the
program---each character costs a few dozen milliseconds.
3. Characters that have been seen while the program has been up---they
only cost 5-10 microseconds on consumer hardware.
