const getHtmlDocument = async url => {
  const response = await fetch(`https://cors-anywhere.herokuapp.com/${url}`)
  const parser = new DOMParser()
  return parser.parseFromString(await response.text(), "text/html")
}

const getArticlePreviews = async (page = 0) => {
  const pageDOM = await getHtmlDocument(`https://www.zerohedge.com/?page=${page}`)
  const articles = pageDOM.body.querySelectorAll("main article.node--type-article")
  return Array.from(articles).map(article => {
    const header = article.querySelector(".teaser-title")
    const teaser = article.querySelector(".teaser-content")
    const image = teaser.querySelector("img").getAttribute("src")      
    return {
      url: "https://www.zerohedge.com/" + header.querySelector("a").getAttribute("src") ,
      title: header.innerText,
      image: (image[0] == "/") ? "https://www.zerohedge.com/" + image : image,
      description: teaser.innerText
    }
  })
}

const getArticle = async url => {
  const pageDOM = await getHtmlDocument(url)
  const article = pageDOM.querySelector("main article .node__content > .text-formatted")
  const ads = article.querySelectorAll(".ad__wrapper-element")
  Array.from(ads).map(a => article.removeChild(a))
  const images = article.querySelectorAll("a[data-image-href]")
  Array.from(images).map(a => {
    a.parentElement.outerHTML = `<img src="${a.href}">`
  })
  return article
}

const getComments = async (url, limit = 100) => {
  const query = `
query GetComments($url: String!) {
  asset(url: $url) {
    totalCommentCount
    comments(query: {limit: ${limit}, sortOrder: ASC, sortBy: CREATED_AT}) {
      ...AnyComment
    }
  }
}

fragment AnyComment on CommentConnection {
  nodes {
    action_summaries { __typename count }
    richTextBody
    user { username avatar }
    replies {
      nodes {
        action_summaries { __typename count }
        richTextBody
        user { username avatar }
        replies {
          nodes {
            action_summaries { __typename count }
            richTextBody
            user { username avatar }
            replies {
              nodes {
                action_summaries { __typename count }
                richTextBody
                user { username avatar }
                replies {
                  nodes {
                    action_summaries { __typename count }
                    richTextBody
                    user { username avatar }
                    replies {
                      nodes {
                        action_summaries { __typename count }
                        richTextBody
                        user { username avatar }
                        replies {
                          nodes {
                            action_summaries { __typename count }
                            richTextBody
                            user { username avatar }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
`
  const response = await fetch("https://cors-anywhere.herokuapp.com/https://talk.zerohedge.com/api/v1/graph/ql", {
    method: "POST",
    headers: {
     "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query,
      variables: {
        url
      }
    })
  })
  const { data } = await response.json()
  return data.asset.comments.nodes.sort((a, b) => {
    const aVotes = a.action_summaries.reduce((acc, v) => acc + v.count, 0)
    const bVotes = b.action_summaries.reduce((acc, v) => acc + v.count, 0)
    if (aVotes < bVotes) return 1
    if (aVotes > bVotes) return -1
    return 0
  })
}
