package main

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/gocolly/colly/v2"
)

const VERSION = "0.0.1"

var co = colly.NewCollector(
	colly.AllowURLRevisit(),
	colly.CacheDir("./wikt_ca"),
)

type oldChinese struct {
	Version string   `json:"v"`
	Parse   bool     `json:"k"`
	Word    string   `json:"w"`
	Baxter  []string `json:"bs"`
	Zheng   []string `json:"zh"`
}

type textResponse struct {
	Version string `json:"v"`
	Result  string `json:"result"`
}

var localWordCache = make(map[string]oldChinese)

func ipaTrim(s string) string {
	// /*myrealipa/ ---> myrealipa
	return s[2 : len(s)-1]
}

// Two cache levels
//	First: localWordCache
//	Second: colly.NewCollector
//
// The second cache reduces the response time to some dozen milliseconds (from seconds).
// The first cache reduces that to some dozen MICRO-seconds.

// This function implements it
func commonLookup(word string) oldChinese {
	cacheEntry, thereIs := localWordCache[word]
	if thereIs {
		return cacheEntry
	}

	wordStructure := oldChinese{
		Version: VERSION,
		Word:    word,
	}

	co.OnHTML("div.zhpron dd", func(e *colly.HTMLElement) {
		whichIPA := e.ChildText("small i a")

		switch whichIPA {
		case "BaxterSagart":
			rawIPA := ipaTrim(e.ChildText("span.IPAchar"))
			wordStructure.Baxter = append(wordStructure.Baxter, rawIPA)
		case "Zhengzhang":
			rawIPA := ipaTrim(e.ChildText("span.IPAchar"))
			wordStructure.Zheng = append(wordStructure.Zheng, rawIPA)
		}
	})

	err := co.Visit(fmt.Sprintf("https://en.wiktionary.org/wiki/%s", word))
	wordStructure.Parse = err == nil
	localWordCache[word] = wordStructure
	return wordStructure
}

// getWordByWord scraps the content from Wiktionary
func getWordByWord(c *gin.Context) {
	word := c.Param("word")

	// In UTF-8, a CJK character could have up to 4 bytes.
	// On the other hand, the string is very possibly NOT UTF-8.
	// IDC, it's their fault if they choose a wack encoding.
	if len(word) > 4 {
		c.JSON(http.StatusNotAcceptable, oldChinese{
			Version: VERSION,
			Parse:   false,
			Word:    "",
			Baxter:  nil,
			Zheng:   nil,
		})
		return
	}

	wordStructure := commonLookup(word)
	if wordStructure.Parse {
		c.JSON(http.StatusOK, wordStructure)
	} else {
		c.JSON(http.StatusNotFound, wordStructure)
	}
}

func getText(c *gin.Context) {
	sb := strings.Builder{}

	text := c.Param("text")
	for _, r := range text {
		// No match = verbatim rune print
		// 1 match = print transl.
		// 1+ matches = print transl. + '*' [asterisk; plural marker]
		oc := commonLookup(string(r))
		if oc.Parse {
			if len(oc.Zheng) == 1 {
				sb.WriteString(oc.Zheng[0])
				sb.WriteRune(' ')
			} else if len(oc.Zheng) > 1 {
				sb.WriteString(oc.Zheng[0])
				sb.WriteString("* ")
			} else {
				sb.WriteRune(r)
			}
		} else {
			sb.WriteRune(r)
		}
	}

	c.JSON(http.StatusOK, textResponse{
		Version: VERSION,
		Result:  strings.TrimSpace(sb.String()),
	})
}

func main() {
	router := gin.Default()
	router.GET("/w/:word", getWordByWord)
	router.GET("/t/:text", getText)

	err := router.Run("localhost:8080")
	if err != nil {
		_, err := fmt.Fprintf(os.Stderr, "There was an error with Gin.\n")
		if err != nil {
			return
		}
		return
	}
}
