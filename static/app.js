const notFoundPara = document.querySelector(".not-found");
const formEl = document.forms["url-form"];
const buttonEl = document.querySelector(".url-form button");
const closeNoteBtn = document.querySelector(".note i");
const clipboardPara = document.querySelector(".clipboard");
const copyBtn = document.querySelector(".copy-shortened-url");
const urlParams = new URLSearchParams(window.location.search);
const errorMessage = urlParams.get("error");

const copiedIcon = `<i class="fi fi-br-check"></i>`;

if (errorMessage) {
  notFoundPara.textContent = errorMessage;
  notFoundPara.style.display = "block";
  let tmo = setTimeout(() => {
    notFoundPara.remove();
    clearTimeout(tmo);
    // location.href = "http://localhost:3000/";
    window.history.replaceState(null, document.title, "/");
  }, 2000);
}

const handleFormSubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const url = formData.get("url").trim();
  const slug = formData.get("slug").trim();
  if (!url) return showErrorPara("Please provide url");
  if (slug && slug.length < 2)
    return showErrorPara("Slug length must be at least two");
  const reqOption = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: { url },
  };
  if (slug) {
    reqOption.body.slug = slug;
  }
  reqOption.body = JSON.stringify(reqOption.body);
  buttonEl.setAttribute("disabled", true);
  buttonEl.classList.add("loading");
  buttonEl.querySelector("span").textContent = "Creating...";
  await createUrl(reqOption);
};

const createUrl = async (reqOptions) => {
  try {
    const response = await fetch("/url", reqOptions);
    const jsonRes = await response.json();
    if (response.ok) {
      if (jsonRes) {
        if (jsonRes.slug) {
          showShortenedUrl(`${window.location.origin}/${jsonRes.slug}`);
        }
      }
    } else {
      if (jsonRes && jsonRes.message) {
        let etmo = setTimeout(() => {
          showErrorPara(jsonRes.message);
          clearTimeout(etmo);
        }, 800);
      }
    }
  } catch (error) {
    if (error && error.message) {
      let etmo = setTimeout(() => {
        showErrorPara(error);
        clearTimeout(etmo.message);
      }, 800);
    }
  } finally {
    let btmo = setTimeout(() => {
      buttonEl.removeAttribute("disabled");
      buttonEl.classList.remove("loading");
      buttonEl.querySelector("span").textContent = "Create Short Url";
      clearTimeout(btmo);
    }, 800);
  }
};

const showShortenedUrl = (url) => {
  const shortenedUrlEl = document.querySelector(".clipboard .shortened-url");
  shortenedUrlEl.textContent = url;
  clipboardPara.style.display = "flex";
};

const showErrorPara = (err) => {
  const errorParaInPage = document.querySelector(".error-para");
  if (errorParaInPage) {
    return (errorParaInPage.textContent = err);
  }
  const errorPara = document.createElement("p");
  errorPara.className = "error-para";
  errorPara.textContent = err;
  formEl.insertBefore(errorPara, buttonEl);
  let tmo = setTimeout(() => {
    errorPara.remove();
    clearTimeout(tmo);
  }, 1500);
};

closeNoteBtn.addEventListener("click", (e) => {
  const closeNotePara = e.target.closest(".note");
  if (closeNotePara) {
    closeNotePara.remove();
  }
});

function copyToClipboard(text) {
  if (!navigator.clipboard) {
    alert("Clipboard API not supported");
  }
  return navigator.clipboard.writeText(text);
}

const setupCopiedIcon = () => {
  clipboardPara.innerHTML += copiedIcon;
  const newCopyBtn = document.createElement("i");
  newCopyBtn.className = "fi fi-rr-copy copy-shortened-url";
  newCopyBtn.addEventListener("click", copyAction);
  let tmo = setTimeout(() => {
    clipboardPara.querySelector(".fi-br-check").remove();
    clipboardPara.appendChild(newCopyBtn);
    clearTimeout(tmo);
  }, 2000);
};

const copyAction = (e) => {
  const shortenedUrlEl = document.querySelector(".clipboard .shortened-url");
  if (shortenedUrlEl) {
    const shortenedUrlContent = shortenedUrlEl.textContent.trim();
    if (!shortenedUrlContent) return;
    copyToClipboard(shortenedUrlContent).then(
      () => {
        e.target.remove();
        setupCopiedIcon();
      },
      (err) => {
        console.error("Failed to copy text:", err);
      }
    );
  }
};

copyBtn.addEventListener("click", copyAction);
formEl.addEventListener("submit", handleFormSubmit);
