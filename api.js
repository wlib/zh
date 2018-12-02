const getHTML = async url => {
  const response = await fetch("https://cors-anywhere.herokuapp.com/" + url);
  const parser = new DOMParser();
  return parser.parseFromString(await response.text(), "text/html");
};

const getCatalog = async (page = 0) => {
  const d = await getHTML("https://zerohedge.com/?page=" + page);
  const main = d.body.querySelectorAll("main article.node");
  return Array.from(main).map(article => ({
    url: "https://zerohedge.com/" + article.getAttribute("about"),
    title: article.querySelector(".teaser-title span").innerText,
    image: "https://zerohedge.com/" + article.querySelector(".teaser-image img").getAttribute("src"),
    description: article.querySelector(".teaser-text p").innerText
  }));
};

const getArticle = async url => {
  const d = await getHTML(url);
  const article = d.querySelector("main article .node__content > .text-formatted");
  const images = article.querySelectorAll("a[data-image-href]");
  Array.from(images).map(a => {
    const url = "https://zerohedge.com/" + a.getAttribute("data-image-href");
    a.parentElement.outerHTML = `<img src="${url}">`
  });
  return article;
};

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
     "Content-Type": 'application/json'
    },
    body: JSON.stringify({
      query,
      variables: {
        url
      }
    })
  });
  const { data } = await response.json();
  return data.asset.comments.nodes.sort((a,b) => {
    const aVotes = a.action_summaries.reduce((acc, cv) => acc + cv.count, 0);
    const bVotes = b.action_summaries.reduce((acc, cv) => acc + cv.count, 0);
    if (aVotes < bVotes) return 1;
    if (aVotes > bVotes) return -1;
    return 0;
  });
}
