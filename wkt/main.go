package main

import (
	"fmt"
	"net/http"
	"os"
)

import (
	"github.com/gin-gonic/gin"
	"github.com/gocolly/colly/v2"
)

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

var localWordCache = make(map[string]oldChinese)

func ipaTrim(s string) string {
	// /*myrealipa/ ---> myrealipa
	return s[2 : len(s)-1]
}

// getWordByWord scraps the content from Wiktionary
func getWordByWord(c *gin.Context) {
	word := c.Param("word")

	cacheEntry, thereIs := localWordCache[word]
	if thereIs {
		c.JSON(http.StatusOK, cacheEntry)
	}

	wordStructure := oldChinese{
		Version: "0.0.1",
		Word:    word,
	}

	co.OnHTML("div.zhpron dd", func(e *colly.HTMLElement) {
		whichIPA := e.ChildText("small i a")

		switch whichIPA {
		case "BaxterSagart":
			rawIPA := ipaTrim(e.ChildText("span.IPAchar"))
			wordStructure.Baxter = append(wordStructure.Baxter, rawIPA)
			break
		case "Zhengzhang":
			rawIPA := ipaTrim(e.ChildText("span.IPAchar"))
			wordStructure.Zheng = append(wordStructure.Zheng, rawIPA)
			break
		}
	})

	// Visit
	err := co.Visit(fmt.Sprintf("https://en.wiktionary.org/wiki/%s", word))
	if err != nil {
		wordStructure.Parse = false
		c.JSON(http.StatusNotFound, wordStructure)
	} else {
		wordStructure.Parse = true
		c.JSON(http.StatusOK, wordStructure)
	}
	localWordCache[word] = wordStructure
}

func main() {
	router := gin.Default()
	router.GET("/w/:word", getWordByWord)

	err := router.Run("localhost:8080")
	if err != nil {
		_, err := fmt.Fprintf(os.Stderr, "There was an error with Gin.\n")
		if err != nil {
			return
		}
		return
	}
}
