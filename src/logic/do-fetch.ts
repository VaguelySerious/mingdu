const urlWithQuery = (url: string, query: any) => {
  const actualQuery = Object.keys(query)
    .map((key) => {
      return `${key}=${query[key]}`;
    })
    .join("&");
  const actualUrl = actualQuery.length ? `${url}?${actualQuery}` : url;
  return actualUrl;
};

export const jsonFetch = (url: string, query: any = {}) => {
  return fetch(urlWithQuery(url, query)).then((response) => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error(response.statusText);
    }
  });
};

export const streamFetch = async (
  url: string,
  query: any = {},
  data: any = {},
  onPartial: (str: string) => void
) => {
  const response = await fetch(urlWithQuery(url, query), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok || !response.body) {
    throw new Error(await response.text());
  }

  const decoder = new TextDecoder("utf-8");
  const reader = response.body.getReader();
  reader.read().then(function processText({ done, value }) {
    if (done) {
      return;
    }
    onPartial(decoder.decode(value));
    reader.read().then(processText);
  });
};

export const jsonPost = (url: string, query: any = {}, data: any) => {
  return fetch(urlWithQuery(url, query), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then((response) => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error(response.statusText);
    }
  });
};
