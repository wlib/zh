const showArticlePreviews = async (page = 0) => {
  document.body.innerHTML = "";
  const articles = await getArticlePreviews(page);
  articles.map(article => {
    const { title, description, image, url } = article
    const e = document.createElement("article")
    e.innerHTML = `<h1>${title}</h1> <p>${description}</p> <img src="${image}">`
    e.onclick = () => showArticle(url)
    document.body.appendChild(e)
  })
}

const showArticle = async url => {
  document.body.innerHTML = ""
  history.pushState({}, "")
  const article = await getArticle(url)
  article.removeAttribute("property")
  article.setAttribute("class", "article")
  document.body.appendChild(article)
  const comments = await getComments(url)
  const commentDiv = document.createElement("div")
  commentDiv.classList.add("comments")
  document.body.appendChild(commentDiv)
  comments.map(comment => {
    const el = document.createElement("div")
    el.classList.add("comment")
    el.innerHTML = comment.richTextBody
    commentDiv.appendChild(el)
  })
}

addEventListener("popstate", () => showArticlePreviews())
showArticlePreviews()
