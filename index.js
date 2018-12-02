const openCatalog = async page => {
  document.body.innerHTML = "";
  const catalog = await getCatalog(page);
  catalog.map(article => {
    const el = document.createElement("div");
    const { title, description, image, url } = article;
    el.innerHTML = `<h1>${title}</h1><p>${description}</p><img src="${image}">`;
    el.onclick = () => openArticle(url);
    document.body.appendChild(el);
  });
}

const openArticle = async url => {
  document.body.innerHTML = "";
  history.pushState({},"");
  const article = await getArticle(url);
  document.body.appendChild(article);
  const comments = await getComments(url);
  const commentDiv = document.createElement("div");
  document.body.appendChild(commentDiv);
  comments.map(comment => {
    const el = document.createElement("div");
    el.innerHTML = comment.richTextBody;
    commentDiv.appendChild(el);
  })
}

addEventListener("popstate", () => openCatalog());
openCatalog();
