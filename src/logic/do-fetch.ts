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
  onPartial: (str: string) => void
) => {
  const response = await fetch(urlWithQuery(url, query));
  if (!response.ok || !response.body) {
    throw new Error(await response.text());
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    onPartial(decoder.decode(value));
  }
};

export const jsonPost = (url: string, data: any) => {
  return jsonFetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};
