const RESPONSE_HEADERS = {
    "content-type": "application/json;charset=UTF-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
    "Access-Control-Max-Age": "86400",
}

addEventListener("fetch", (event) => {
    event.respondWith(handleEvent(event).catch(
        (err) => {
            return new Response({"error": true}, {
                status: 500,
                headers: {
                    "content-type": "text/html;charset=UTF-8",
                }
            })
        }
    ));
});

async function handleRequest(request) {
    const url = new URL(request.url)

    const encodedUrl = encodeURIComponent(url.pathname).toLowerCase()
    let dataCached = await CACHES.get(`crypto-${encodedUrl}`, {type: "json"})

    console.log(dataCached) 
    if(dataCached){
        console.log("Cached")
        return new Response(JSON.stringify(dataCached), {
            headers: RESPONSE_HEADERS,
        });
    }
    
    let response = await fetch(
      `https://pro-api.coinmarketcap.com${url.pathname}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-CMC_PRO_API_KEY': COINMARKETCAP_KEY
        },
      }
    );
    const data = await response.json();
    if(response.status >= 200 && response.status < 300){
        await CACHES.put(
            `crypto-${encodedUrl}`,
            JSON.stringify(data),
            {expirationTtl: 300}
        )
    }

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: RESPONSE_HEADERS,
    });
}

async function handleEvent(event) {
    let request = event.request;
    return handleRequest(request)
}