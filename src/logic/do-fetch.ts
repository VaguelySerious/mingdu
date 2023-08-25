export const doFetch = (url: string, query: any = {}) => {
  const actualQuery = Object.keys(query)
    .map((key) => {
      return `${key}=${query[key]}`;
    })
    .join("&");
  const actualUrl = actualQuery.length ? `${url}?${actualQuery}` : url;
  console.log("Sending", { actualUrl, actualQuery });
  return fetch(actualUrl).then((response) => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error(response.statusText);
    }
  });
};

export const doPost = (url: string, data: any) => {
  return doFetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};
